'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        router.push('/admin');
      } else {
        setError(data.error ?? 'Senha incorreta');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper">
      <div className="container container--sm" style={{ width: '100%' }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '8px'
            }}>
              ✍️ <span style={{ color: 'var(--color-text)' }}>Sign</span>&nbsp;&amp;&nbsp;Pay
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Acesse o painel administrativo
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Senha de acesso</label>
              <input
                id="password"
                type="password"
                className={`form-input${error ? ' form-input--error' : ''}`}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              {error && <span className="form-error">⚠ {error}</span>}
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--full btn--lg"
              disabled={loading || !password}
              id="btn-login"
            >
              {loading ? (
                <><div className="spinner" /> Entrando...</>
              ) : (
                'Entrar no painel'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
