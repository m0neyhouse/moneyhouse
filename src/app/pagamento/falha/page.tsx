export default function PagamentoFalhaPage() {
  return (
    <div className="page-wrapper">
      <div className="container container--sm" style={{ width: '100%', textAlign: 'center' }}>
        <div className="status-icon status-icon--danger" style={{ width: 90, height: 90, fontSize: '2.5rem', margin: '0 auto 28px' }}>
          ❌
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 12 }}>
          Pagamento recusado
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>
          Não foi possível processar seu pagamento. Verifique os dados do cartão ou use outro método.
        </p>
        <div className="alert alert--danger" style={{ textAlign: 'left', marginBottom: 24 }}>
          ⚠ Entre em contato com o prestador de serviços para tentar novamente.
        </div>
      </div>
    </div>
  );
}
