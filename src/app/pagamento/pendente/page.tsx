import Link from 'next/link';

export default function PendentePage({ searchParams }: { searchParams: { contrato?: string } }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: 20 }}>
      <div className="card" style={{ maxWidth: 400, textAlign: 'center', padding: '40px 24px', width: '100%' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: '#F59E0B', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
          margin: '0 auto 24px', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
        }}>
          ⏳
        </div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 12, color: 'var(--color-text)', fontWeight: 700 }}>Pagamento Pendente</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32, lineHeight: 1.5, fontSize: '0.95rem' }}>
          Seu pagamento está em análise ou aguardando compensação (ex: Boleto bancário). Você receberá o recibo e daremos andamento ao serviço assim que for confirmado.
        </p>
        
        <Link href="/" className="btn btn--primary btn--full btn--lg">
          Entendido
        </Link>
      </div>
    </div>
  );
}
