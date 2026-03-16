import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getContract, signContract } from '@/lib/contracts';
import { createPaymentPreference } from '@/lib/mercadopago';
import { updatePayment } from '@/lib/contracts';
import { z } from 'zod';

// GET /api/contracts/[id] — público, usado pelo cliente
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const contract = getContract(params.id);

  if (!contract) {
    return NextResponse.json({ success: false, error: 'Contrato não encontrado' }, { status: 404 });
  }

  if (contract.status === 'expired') {
    return NextResponse.json({ success: false, error: 'Este link expirou' }, { status: 410 });
  }

  // Não retornar imagem da assinatura na consulta pública
  const { signatureImage: _, ...safeContract } = contract;
  return NextResponse.json({ success: true, data: safeContract });
}

const signSchema = z.object({
  signatureImage: z.string().min(100, 'Assinatura inválida'), // base64 mínimo
});

// PATCH /api/contracts/[id] — assinar contrato e gerar link de pagamento
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const contract = getContract(params.id);

  if (!contract) {
    return NextResponse.json({ success: false, error: 'Contrato não encontrado' }, { status: 404 });
  }

  if (contract.status !== 'pending') {
    return NextResponse.json({ success: false, error: 'Contrato já foi processado' }, { status: 409 });
  }

  try {
    const body = await request.json();
    const parsed = signSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Assinatura inválida' }, { status: 400 });
    }

    const signerIp =
      request.headers.get('x-forwarded-for')?.split(',')[0] ??
      request.headers.get('x-real-ip') ??
      undefined;

    // Registra assinatura
    const signed = signContract({
      contractId: params.id,
      signatureImage: parsed.data.signatureImage,
      signerIp,
    });

    if (!signed) {
      return NextResponse.json({ success: false, error: 'Erro ao assinar' }, { status: 500 });
    }

    // Gera preferência de pagamento no MercadoPago
    const payment = await createPaymentPreference(signed);

    // Salva referência do pagamento
    updatePayment(params.id, payment.id, payment.init_point);

    const isSandbox = process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('TEST-');
    const paymentUrl = isSandbox ? payment.sandbox_init_point : payment.init_point;

    return NextResponse.json({ success: true, data: { paymentUrl } });
  } catch (error) {
    console.error('Erro ao processar assinatura:', error);
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}
