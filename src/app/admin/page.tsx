'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { Contract } from '@/types';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  signed: 'Assinado',
  paid: 'Pago',
  expired: 'Expirado',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export default function AdminPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    clientName: '',
    serviceName: '',
    serviceDescription: '',
    value: '',
    validityDays: '7',
  });

  async function loadContracts() {
    setLoading(true);
    const res = await fetch('/api/contracts');
    if (res.status === 401) { router.push('/admin/login'); return; }
    const data = await res.json();
    if (data.success) setContracts(data.data);
    setLoading(false);
  }

  useEffect(() => { loadContracts(); }, []); // eslint-disable-line

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja apagar este contrato?')) return;
    
    setLoading(true);
    const res = await fetch(`/api/contracts/${id}`, { method: 'DELETE' });
    if (res.ok) {
        setContracts(prev => prev.filter(c => c.id !== id));
    } else {
        alert('Falha ao excluir contrato.');
    }
    setLoading(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    const body = {
      clientName: form.clientName,
      serviceName: form.serviceName,
      serviceDescription: form.serviceDescription || undefined,
      value: parseFloat(form.value),
      validityDays: parseInt(form.validityDays),
    };

    const res = await fetch('/api/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    setSubmitting(false);

    if (data.success) {
      const link = `${window.location.origin}/contrato/${data.data.id}`;
      setGeneratedLink(link);
      setForm({ clientName: '', serviceName: '', serviceDescription: '', value: '', validityDays: '7' });
      loadContracts();
    } else {
      setFormError(data.error ?? 'Erro ao criar contrato');
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleInput(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="admin-header">
        <a className="brand" href="/admin">✍️ Sign &<em> Pay</em></a>
        <button className="btn btn--ghost btn--sm" onClick={handleLogout} id="btn-logout">
          Sair
        </button>
      </header>

      <main style={{ padding: '40px 24px', maxWidth: 960, margin: '0 auto' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>Contratos</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
              Gerencie e crie links de contrato para seus clientes
            </p>
          </div>
          <button
            className="btn btn--primary"
            onClick={() => { setShowForm(true); setGeneratedLink(''); }}
            id="btn-new-contract"
          >
            + Novo Contrato
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total', count: contracts.length, color: 'var(--color-primary)' },
            { label: 'Pendentes', count: contracts.filter(c => c.status === 'pending').length, color: 'var(--color-warning)' },
            { label: 'Assinados', count: contracts.filter(c => c.status === 'signed').length, color: 'var(--color-primary)' },
            { label: 'Pagos', count: contracts.filter(c => c.status === 'paid').length, color: 'var(--color-success)' },
          ].map((stat) => (
            <div key={stat.label} className="card card--sm" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color }}>{stat.count}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Contracts table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Carregando contratos...
            </div>
          ) : contracts.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📄</div>
              <p style={{ color: 'var(--color-text-secondary)' }}>Nenhum contrato criado ainda.</p>
              <button className="btn btn--primary" style={{ marginTop: 20 }} onClick={() => setShowForm(true)}>
                Criar primeiro contrato
              </button>
            </div>
          ) : (
            <div className="table-wrapper" style={{ borderRadius: 0, border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Serviço</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Criado em</th>
                    <th>Expira em</th>
                    <th>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => (
                    <tr key={contract.id}>
                      <td style={{ fontWeight: 600 }}>{contract.clientName}</td>
                      <td>{contract.serviceName}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>
                        {formatCurrency(contract.value)}
                      </td>
                      <td>
                        <span className={`badge badge--${contract.status}`}>
                          {STATUS_LABELS[contract.status]}
                        </span>
                      </td>
                      <td>{formatDate(contract.createdAt)}</td>
                      <td>{formatDate(contract.expiresAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {contract.status === 'pending' ? (
                            <button
                              className="btn btn--ghost btn--sm"
                              title="Copiar link"
                              onClick={() => {
                                const link = `${window.location.origin}/contrato/${contract.id}`;
                                setGeneratedLink(link);
                                setShowForm(false);
                              }}
                            >
                              📋
                            </button>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', padding: '0 8px' }}>—</span>
                          )}
                          <button
                            className="btn btn--ghost btn--sm"
                            style={{ color: '#EF4444' }}
                            title="Apagar contrato"
                            onClick={() => handleDelete(contract.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal: Novo Contrato */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal-box" style={{ maxWidth: 520 }}>
            <h2 className="modal-title">Criar novo contrato</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="clientName">Nome do cliente *</label>
                <input id="clientName" type="text" className="form-input" placeholder="Ex: João Silva"
                  value={form.clientName} onChange={handleInput('clientName')} required maxLength={100} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="serviceName">Serviço contratado *</label>
                <input id="serviceName" type="text" className="form-input" placeholder="Ex: Criação de Site"
                  value={form.serviceName} onChange={handleInput('serviceName')} required maxLength={200} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="serviceDescription">Descrição (opcional)</label>
                <textarea id="serviceDescription" className="form-input" placeholder="Detalhes sobre o serviço..."
                  value={form.serviceDescription} onChange={handleInput('serviceDescription')} maxLength={500} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="value">Valor (R$) *</label>
                  <input id="value" type="number" className="form-input" placeholder="0,00"
                    value={form.value} onChange={handleInput('value')} required min="0.01" step="0.01" max="999999" />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="validityDays">Validade (dias)</label>
                  <select id="validityDays" className="form-input" value={form.validityDays} onChange={handleInput('validityDays')}>
                    <option value="3">3 dias</option>
                    <option value="7">7 dias</option>
                    <option value="14">14 dias</option>
                    <option value="30">30 dias</option>
                  </select>
                </div>
              </div>

              {formError && (
                <div className="alert alert--danger" style={{ marginBottom: 16 }}>⚠ {formError}</div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn--ghost" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" style={{ flex: 2 }} disabled={submitting} id="btn-submit-contract">
                  {submitting ? <><div className="spinner" /> Gerando...</> : 'Gerar Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Link Gerado */}
      {generatedLink && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setGeneratedLink('')}>
          <div className="modal-box">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: '3rem', marginBottom: 8 }}>🔗</div>
              <h2 className="modal-title" style={{ marginBottom: 8 }}>Link gerado com sucesso!</h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                Envie este link para o seu cliente pelo Instagram ou WhatsApp.
              </p>
            </div>

            <div className="copy-box" style={{ marginBottom: 16 }}>
              <span style={{ flex: 1 }}>{generatedLink}</span>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn--ghost" style={{ flex: 1 }} onClick={() => setGeneratedLink('')}>
                Fechar
              </button>
              <button className="btn btn--primary" style={{ flex: 1 }} onClick={handleCopy} id="btn-copy-link">
                {copied ? '✓ Copiado!' : '📋 Copiar link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
