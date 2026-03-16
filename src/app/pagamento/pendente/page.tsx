export default function PagamentoPendentePage() {
  return (
    <div className="page-wrapper">
      <div className="container container--sm" style={{ width: '100%', textAlign: 'center' }}>
        <div className="status-icon status-icon--warning" style={{ width: 90, height: 90, fontSize: '2.5rem', margin: '0 auto 28px' }}>
          ⏳
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 12 }}>
          Pagamento em análise
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32 }}>
          Seu pagamento está sendo processado. Isso pode levar alguns instantes.
        </p>
        <div className="alert alert--warning" style={{ textAlign: 'left', marginBottom: 24 }}>
          📋 Você receberá uma confirmação assim que o pagamento for aprovado. O serviço será iniciado após
          a confirmação.
        </div>
      </div>
    </div>
  );
}
