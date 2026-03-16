import Link from 'next/link';

export default function PagamentoSucessoPage() {
  return (
    <div className="page-wrapper">
      <div className="container container--sm" style={{ width: '100%', textAlign: 'center' }}>
        <div className="status-icon status-icon--success" style={{ width: 90, height: 90, fontSize: '2.5rem', margin: '0 auto 28px' }}>
          ✅
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 12 }}>
          Pagamento confirmado!
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 8 }}>
          Seu pagamento foi processado com sucesso. O contrato está confirmado.
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 32 }}>
          Em breve você receberá os detalhes do serviço contratado.
        </p>
        <div className="alert alert--success" style={{ textAlign: 'left', marginBottom: 24 }}>
          🎉 Obrigado por confiar em nosso serviço! Entraremos em contato em breve.
        </div>
      </div>
    </div>
  );
}
