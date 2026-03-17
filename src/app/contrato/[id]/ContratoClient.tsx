'use client';

import { useState, useCallback } from 'react';
import type { Contract } from '@/types';
import SignaturePad from '@/components/contract/SignaturePad';

const CONTRATADO_NAME = 'Matheus Dias';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    timeZone: 'America/Sao_Paulo' 
  });
}

function valueToWords(value: number): string {
  if (value === 0) return 'zero reais';
  const n = Math.round(value);

  const ones = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const tens = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];

  const toWords = (num: number): string => {
    if (num === 0) return '';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      const t = Math.floor(num / 10), u = num % 10;
      return u === 0 ? tens[t] : `${tens[t]} e ${ones[u]}`;
    }
    if (num < 1000) {
      const h = Math.floor(num / 100), r = num % 100;
      const hw = h === 1 ? (r === 0 ? 'cem' : 'cento') : ['', '', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'][h];
      return r === 0 ? hw : `${hw} e ${toWords(r)}`;
    }
    if (num < 1000000) {
      const th = Math.floor(num / 1000), r = num % 1000;
      const tw = th === 1 ? 'mil' : `${toWords(th)} mil`;
      return r === 0 ? tw : `${tw} e ${toWords(r)}`;
    }
    return String(num);
  };

  const words = toWords(n);
  return n === 1 ? `${words} real` : `${words} reais`;
}

export default function ContratoClient({ contract }: { contract: Contract }) {
  const [signature, setSignature] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSignatureChange = useCallback((dataUrl: string | null) => {
    setSignature(dataUrl);
  }, []);

  const contractDate = formatDate(contract.createdAt);

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
            Contrato de Prestação de Serviços — Social Media
          </p>
        </div>

        {/* Contract Document */}
        <div className="contract-document" style={{ marginBottom: 32 }}>
          <div className="contract-title">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</div>

          {/* PARTES */}
          <div className="contract-section">
            <h4>PARTES</h4>
            <p>
              <strong>CONTRATANTE:</strong>{' '}
              <strong style={{ color: 'var(--color-primary)' }}>{contract.clientName}</strong>
            </p>
            <p style={{ marginTop: 10 }}>
              <strong>CONTRATADO:</strong>{' '}
              <strong style={{ color: 'var(--color-primary)' }}>{CONTRATADO_NAME}</strong>
            </p>
          </div>

          {/* OBJETO */}
          <div className="contract-section">
            <h4>OBJETIVO DO CONTRATO</h4>
            <p>
              O presente contrato tem por objetivo a prestação de serviço de{' '}
              <strong>gestão de redes sociais (Social Media)</strong>
              {contract.serviceName ? `, especificamente: ${contract.serviceName}` : ''}, incluindo:
            </p>
            <ul style={{ marginTop: 12, paddingLeft: 24, lineHeight: 2 }}>
              <li>Planejamento de conteúdo</li>
              <li>Criação de artes para publicações</li>
              <li>Criação de legendas</li>
              <li>Organização e publicação dos posts no perfil do CONTRATANTE</li>
              {contract.serviceDescription && (
                <li><em>{contract.serviceDescription}</em></li>
              )}
            </ul>
          </div>

          {/* VALOR */}
          <div className="contract-section">
            <h4>VALOR E FORMA DE PAGAMENTO</h4>
            <p>
              Pelo serviço descrito acima, o CONTRATANTE pagará ao CONTRATADO o valor de
            </p>
            <p style={{ margin: '14px 0', fontSize: '1.1rem' }}>
              <strong style={{ color: 'var(--color-primary)', fontSize: '1.15rem' }}>
                {formatCurrency(contract.value)}
              </strong>{' '}
              (<strong>{valueToWords(contract.value)}</strong>)
            </p>
            <p>
              O pagamento será realizado <strong>digitalmente através do Mercado Pago</strong>, no ato
              da assinatura deste contrato.
            </p>
          </div>

          {/* PRAZO */}
          <div className="contract-section">
            <h4>PRAZO DO SERVIÇO</h4>
            {(() => {
              const dias = Math.round((new Date(contract.expiresAt).getTime() - new Date(contract.createdAt).getTime()) / (1000 * 60 * 60 * 24));
              const prazo = dias >= 30 ? `${Math.round(dias / 30)} ${Math.round(dias / 30) === 1 ? 'mês' : 'meses'}` : `${dias} dias`;
              return (
                <p>
                  O serviço terá duração de <strong>{prazo}</strong>, iniciando após a confirmação
                  do pagamento e o envio das informações necessárias pelo CONTRATANTE.
                </p>
              );
            })()}
          </div>

          {/* CLÁUSULAS */}
          <div className="contract-section">
            <h4>CLÁUSULAS GERAIS</h4>
            <ol style={{ paddingLeft: 22, lineHeight: 2.2 }}>
              <li>O CONTRATADO iniciará a prestação do serviço após a confirmação do pagamento.</li>
              <li>O CONTRATANTE compromete-se a fornecer todas as informações necessárias para a execução do serviço.</li>
              <li>Qualquer modificação no escopo do serviço deverá ser previamente acordada entre as partes.</li>
              <li>Em caso de desistência após o início da execução, poderá ser cobrado valor proporcional ao trabalho realizado.</li>
              <li>As partes elegem a comarca do CONTRATADO para dirimir quaisquer controvérsias deste contrato.</li>
            </ol>
          </div>

          {/* DATA */}
          <div className="contract-section">
            <h4>DATA DE CELEBRAÇÃO</h4>
            <p><strong>{contractDate}</strong></p>
          </div>
        </div>

        {/* Signature Area */}
        {contract.status === 'signed' || contract.status === 'paid' ? (
          <div className="card" style={{ marginBottom: 24, textAlign: 'center', borderColor: 'var(--color-success)', borderWidth: 2 }}>
            <div style={{ color: 'var(--color-success)', fontSize: '2rem', marginBottom: 8 }}>✅</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: 'var(--color-text)' }}>Contrato Assinado Digitalmente</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
              Assinado por <strong>{contract.clientName}</strong> em {contract.signedAt ? formatDate(contract.signedAt) : contractDate}.
            </p>
            {contract.signatureImage && (
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 16, display: 'inline-block', background: '#fff' }}>
                <img 
                  src={contract.signatureImage} 
                  alt="Assinatura do Cliente" 
                  style={{ maxHeight: 150, maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
            )}
            <p style={{ marginTop: 24, fontSize: '0.9rem', color: 'var(--color-success)', fontWeight: 600 }}>
              Status Atual: {contract.status === 'paid' ? 'Contrato Finalizado e Pago' : 'Aguardando Compensação Financeira'}
            </p>
            <button 
              className="btn btn--secondary no-print" 
              style={{ marginTop: 24 }}
              onClick={() => window.print()}
            >
              📥 Baixar em PDF
            </button>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Assinatura Digital</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginBottom: 20 }}>
              Assine no campo abaixo para confirmar que leu e concorda com os termos do contrato.
            </p>

            <SignaturePad onChange={handleSignatureChange} />

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
                `✍️ Assinar e Pagar ${formatCurrency(contract.value)}`
              )}
            </button>

            {(!signature && !submitting) && (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.82rem', marginTop: 10 }}>
                Faça sua assinatura acima para habilitar o botão
              </p>
            )}
          </div>
        )}

        {contract.status === 'pending' && (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
            🔒 Seus dados são protegidos. O pagamento é processado pelo MercadoPago.
          </p>
        )}
      </div>
    </div>
  );
}
