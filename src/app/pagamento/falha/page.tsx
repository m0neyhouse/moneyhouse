import Link from 'next/link';

export default function FalhaPage({ searchParams }: { searchParams: { contrato?: string } }) {
  const contratoId = searchParams.contrato;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: 20 }}>
      <div className="card" style={{ maxWidth: 400, textAlign: 'center', padding: '40px 24px', width: '100%' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: '#EF4444', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem',
          margin: '0 auto 24px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
        }}>
          ×
        </div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 12, color: 'var(--color-text)', fontWeight: 700 }}>Pagamento Recusado</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32, lineHeight: 1.5, fontSize: '0.95rem' }}>
          Infelizmente não foi possível processar o pagamento do seu contrato. Por favor, tente novamente ou escolha outra forma de pagamento.
        </p>
        
        {contratoId ? (
          <Link href={`/contrato/${contratoId}`} className="btn btn--primary btn--full btn--lg">
            Tentar Novamente
          </Link>
        ) : (
          <Link href="/" className="btn btn--ghost btn--full btn--lg">
            Voltar ao Início
          </Link>
        )}
      </div>
    </div>
  );
}
