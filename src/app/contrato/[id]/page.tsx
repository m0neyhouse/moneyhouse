import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getContract } from '@/lib/contracts';
import ContratoClient from './ContratoClient';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const contract = await getContract(id);
  if (!contract) return { title: 'Contrato não encontrado' };
  return {
    title: `Contrato — ${contract.clientName} | Sign & Pay`,
    description: `Contrato de prestação de serviços para ${contract.clientName}.`,
  };
}

export default async function ContratoPage({ params }: Props) {
  const { id } = await params;
  const contract = await getContract(id);

  if (!contract) notFound();

  if (contract.status === 'expired') {
    return (
      <div className="page-wrapper">
        <div className="container container--sm" style={{ width: '100%', textAlign: 'center' }}>
          <div className="status-icon" style={{ background: '#f1f5f9', margin: '0 auto 24px' }}>⏰</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Link expirado</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Este link não é mais válido. Entre em contato com o prestador de serviços.
          </p>
        </div>
      </div>
    );
  }

  return <ContratoClient contract={contract} />;
}
