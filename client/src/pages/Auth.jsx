import { useState } from 'react';
import { api } from '../api';

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await api('/auth/register', { method: 'POST', body: { email, password } });
      }
      const data = await api('/auth/login', { method: 'POST', body: { email, password } });
      onLogin(data.token, data.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <h1>🔐 SecureVault</h1>
        <p className="muted">
          {mode === 'login' ? 'Unlock your encrypted vault' : 'Create your vault with a master password'}
        </p>

        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com" required />

        <label>Master password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters" required />

        {error && <div className="error">{error}</div>}

        <button className="btn" disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
        </button>

        <p className="muted switch">
          {mode === 'login' ? "Don't have a vault? " : 'Already registered? '}
          <a href="#" onClick={(e) => { e.preventDefault(); setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
            {mode === 'login' ? 'Register' : 'Login'}
          </a>
        </p>
      </form>
    </div>
  );
}