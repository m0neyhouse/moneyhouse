import MercadoPagoConfig, { Preference } from 'mercadopago';
import type { Contract, PaymentPreference } from '@/types';

function getMercadoPagoClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado');
  return new MercadoPagoConfig({ accessToken });
}

export async function createPaymentPreference(contract: Contract): Promise<PaymentPreference> {
  const client = getMercadoPagoClient();
  const preference = new Preference(client);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  const response = await preference.create({
    body: {
      items: [
        {
          id: contract.id,
          title: contract.serviceName,
          description: contract.serviceDescription ?? `Serviço contratado por ${contract.clientName}`,
          quantity: 1,
          unit_price: contract.value,
          currency_id: 'BRL',
        },
      ],
      payer: {
        name: contract.clientName,
      },
      back_urls: {
        success: `${baseUrl}/pagamento/sucesso?contrato=${contract.id}`,
        failure: `${baseUrl}/pagamento/falha?contrato=${contract.id}`,
        pending: `${baseUrl}/pagamento/pendente?contrato=${contract.id}`,
      },
      auto_return: 'approved',
      external_reference: contract.id,
      statement_descriptor: 'SIGN & PAY',
    },
  });

  return {
    id: response.id ?? '',
    init_point: response.init_point ?? '',
    sandbox_init_point: response.sandbox_init_point ?? '',
  };
}
