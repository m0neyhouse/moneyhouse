import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getContract, updatePaymentStatus } from '@/lib/contracts';

const MERCADOPAGO_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET;
const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;

// Verifica a autenticidade da requisição do Mercado Pago baseada na assinatura SHA256
function verifySignature(req: Request, dataID: string): boolean {
  if (!MERCADOPAGO_WEBHOOK_SECRET) {
    // Se o usuário não configurou webhook secret, aceita (menos seguro) ou rejeita.
    // Vamos logar aviso e prosseguir se não configurado para ambiente hobby ser fácil de usar.
    console.warn('MERCADOPAGO_WEBHOOK_SECRET não configurado. Validação HMAC desativada.');
    return true; 
  }

  const xSignature = req.headers.get('x-signature');
  const xRequestId = req.headers.get('x-request-id');

  if (!xSignature || !xRequestId) return false;

  const parts = xSignature.split(',');
  let ts = '';
  let v1 = '';

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 'ts') ts = value;
    if (key === 'v1') v1 = value;
  }

  if (!ts || !v1) return false;

  const manifest = `id:${dataID};request-id:${xRequestId};ts:${ts};`;

  const hmac = crypto.createHmac('sha256', MERCADOPAGO_WEBHOOK_SECRET);
  hmac.update(manifest);
  const digest = hmac.digest('hex');

  return digest === v1;
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    let body: any = {};
    
    // Tenta fazer o parse do body em JSON, pois os Webhooks mandam o Payload ali.
    try {
      body = await req.clone().json();
    } catch (e) {
      // Body vazio ou não JSON
    }

    const action = url.searchParams.get('type') || url.searchParams.get('topic') || body.type || body.action;
    const dataId = url.searchParams.get('data.id') || url.searchParams.get('id') || body.data?.id;

    if (!dataId) {
      return NextResponse.json({ success: false, error: 'ID ausente' }, { status: 400 });
    }

    // Verifica assinatura de segurança do Webhook (opcionalmente)
    const isValid = verifySignature(req, dataId);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Assinatura inválida' }, { status: 403 });
    }

    // Só processamos eventos de pagamento aprovado/atualizado
    if ((action === 'payment' || action === 'payment.updated' || action === 'payment.created') && dataId) {
      // 1. Consulta ao MercadoPago a API Oficial pelo status atualizado do ID do pagamento.
      if (!MERCADOPAGO_ACCESS_TOKEN) throw new Error('Cade o token');
      
      const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
        headers: {
          Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`
        }
      });
      
      const paymentData = await paymentRes.json();
      
      if (paymentData.status === 'approved' && paymentData.external_reference) {
        const contractId = paymentData.external_reference;
        const contract = await getContract(contractId);
        
        // Só atualiza se o contrato não estava pago já
        if (contract && contract.status !== 'paid') {
          await updatePaymentStatus(contractId, 'paid');
          console.log(`\n✅ Contrato ${contractId} do cliente ${contract.clientName} foi PAGO AUTOMATICAMENTE VIA WEBHOOK.`);
        }
      }
    }

    // Sempre responder 200 OK rápido pro Mercado Pago não tentar reenviar
    return NextResponse.json({ success: true, message: 'Processado' }, { status: 200 });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json({ success: false, error: 'Erro interno webhook' }, { status: 500 });
  }
}
