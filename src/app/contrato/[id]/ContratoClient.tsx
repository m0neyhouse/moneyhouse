'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Contract } from '@/types';
import SignaturePad from '@/components/contract/SignaturePad';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function ContratoClient({ contract }: { contract: Contract }) {
  const router = useRouter();
  const [signature, setSignature] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSignatureChange = useCallback((dataUrl: string | null) => {
    setSignature(dataUrl);
  }, []);

  const today = formatDate(new Date().toISOString());

  async function handleSign() {
    if (!signature || !agreed) return;
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/contracts/${contract.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureImage: signature }),
      });
      const data = await res.json();

      if (data.success && data.data.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      } else {
        setError(data.error ?? 'Erro ao processar. Tente novamente.');
        setSubmitting(false);
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', padding: '40px 16px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            ✍️ Sign <span style={{ color: 'var(--color-text)' }}>&amp; Pay</span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            Contrato de Prestação de Serviços
          </p>
        </div>

        {/* Contract Document */}
        <div className="contract-document" style={{ marginBottom: 32 }}>
          <div className="contract-title">Contrato de Prestação de Serviços</div>

          <div className="contract-section">
            <h4>Partes</h4>
            <p>
              <strong>CONTRATANTE:</strong> <span className="contract-highlight">{contract.clientName}</span>
            </p>
            <p style={{ marginTop: 8 }}>
              <strong>CONTRATADA:</strong> Prestador de Serviços
            </p>
          </div>

          <div className="contract-section">
            <h4>Objeto do Contrato</h4>
            <p>
              O presente contrato tem por objeto a prestação do serviço de{' '}
              <span className="contract-highlight">{contract.serviceName}</span>.
              {contract.serviceDescription && (
                <><br /><br /><em>{contract.serviceDescription}</em></>
              )}
            </p>
          </div>

          <div className="contract-section">
            <h4>Valor e Forma de Pagamento</h4>
            <p>
              Pelo serviço descrito acima, o CONTRATANTE pagará à CONTRATADA o valor de{' '}
              <span className="contract-value">{formatCurrency(contract.value)}</span>{' '}
              (
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency', currency: 'BRL',
              }).format(contract.value)} reais)
              , mediante pagamento digital no ato da assinatura deste instrumento.
            </p>
          </div>

          <div className="contract-section">
            <h4>Cláusulas Gerais</h4>
            <p>
              <strong>1.</strong> A CONTRATADA iniciará a prestação do serviço após a confirmação do pagamento.
            </p>
            <p style={{ marginTop: 8 }}>
              <strong>2.</strong> O CONTRATANTE compromete-se a fornecer todas as informações necessárias à execução do serviço.
            </p>
            <p style={{ marginTop: 8 }}>
              <strong>3.</strong> Qualquer modificação no escopo do serviço deverá ser acordada previamente entre as partes.
            </p>
            <p style={{ marginTop: 8 }}>
              <strong>4.</strong> Em caso de desistência após o início da execução, será cobrado o valor proporcional ao trabalho realizado.
            </p>
            <p style={{ marginTop: 8 }}>
              <strong>5.</strong> As partes elegem a comarca do Contratado para dirimir quaisquer controvérsias deste contrato.
            </p>
          </div>

          <div className="contract-section">
            <h4>Data de Celebração</h4>
            <p>{today}</p>
          </div>
        </div>

        {/* Signature Section */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Assinatura Digital</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginBottom: 20 }}>
            Assine no campo abaixo para confirmar que leu e concorda com os termos do contrato.
          </p>

          <SignaturePad onChange={handleSignatureChange} />

          {/* Checkbox */}
          <label style={{
            display: 'flex', gap: 12, alignItems: 'flex-start',
            padding: '16px 0', borderTop: '1px solid var(--color-border)', marginTop: 16, cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              id="agree-terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: 2, width: 18, height: 18, flexShrink: 0, cursor: 'pointer', accentColor: 'var(--color-primary)' }}
            />
            <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
              Li e aceito todos os termos e condições do contrato acima. Entendo que minha assinatura
              digital tem validade legal e que serei redirecionado para o pagamento ao confirmar.
            </span>
          </label>

          {error && (
            <div className="alert alert--danger" style={{ marginBottom: 16 }}>⚠ {error}</div>
          )}

          <button
            className="btn btn--primary btn--full btn--lg"
            onClick={handleSign}
            disabled={!signature || !agreed || submitting}
            id="btn-sign-and-pay"
            style={{ fontSize: '1.05rem' }}
          >
            {submitting ? (
              <><div className="spinner" /> Processando...</>
            ) : (
              '✍️ Assinar e Pagar ' + formatCurrency(contract.value)
            )}
          </button>

          {(!signature && !submitting) && (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: 10 }}>
              Faça sua assinatura acima para habilitar o botão
            </p>
          )}
        </div>

        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
          🔒 Seus dados são protegidos. O pagamento é processado pelo MercadoPago.
        </p>
      </div>
    </div>
  );
}
