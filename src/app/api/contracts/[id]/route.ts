import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getContract, signContract, updatePayment } from '@/lib/contracts';
import { createPaymentPreference } from '@/lib/mercadopago';
import { z } from 'zod';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contract = await getContract(id);

  if (!contract) {
    return NextResponse.json({ success: false, error: 'Contrato não encontrado' }, { status: 404 });
  }
  if (contract.status === 'expired') {
    return NextResponse.json({ success: false, error: 'Este link expirou' }, { status: 410 });
  }

  const { signatureImage: _sig, ...safeContract } = contract;
  return NextResponse.json({ success: true, data: safeContract });
}

const signSchema = z.object({
  signatureImage: z.string().min(100),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contract = await getContract(id);

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

    const signed = await signContract({
      contractId: id,
      signatureImage: parsed.data.signatureImage,
      signerIp,
    });

    if (!signed) {
      return NextResponse.json({ success: false, error: 'Erro ao assinar' }, { status: 500 });
    }

    const payment = await createPaymentPreference(signed);
    await updatePayment(id, payment.id, payment.init_point);

    const isSandbox = process.env.MERCADOPAGO_ACCESS_TOKEN?.startsWith('TEST-');
    const paymentUrl = isSandbox ? payment.sandbox_init_point : payment.init_point;

    return NextResponse.json({ success: true, data: { paymentUrl } });
  } catch (error: any) {
    let msg = 'Erro interno desconhecido.';
    if (error instanceof Error) {
      msg = error.message;
    } else if (typeof error === 'object' && error !== null) {
      msg = error.message || error.error || JSON.stringify(error);
    } else {
      msg = String(error);
    }
    
    console.error('Erro ao processar assinatura:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
