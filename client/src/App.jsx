import { useState } from 'react';
import Auth from './pages/Auth';
import Vault from './pages/Vault';
import { api } from './api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('sv_token'));
  const [email, setEmail] = useState(localStorage.getItem('sv_email') || '');

  function handleLogin(t, e) {
    localStorage.setItem('sv_token', t);
    localStorage.setItem('sv_email', e);
    setToken(t);
    setEmail(e);
  }

  async function handleLogout() {
    try { await api('/auth/logout', { method: 'POST' }); } catch {}
    localStorage.removeItem('sv_token');
    localStorage.removeItem('sv_email');
    setToken(null);
  }

  if (!token) return <Auth onLogin={handleLogin} />;

  return (
    <div className="app">
      <header className="navbar">
        <h1>🔐 SecureVault</h1>
        <div className="nav-right">
          <span className="muted">{email}</span>
          <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className="container">
        <Vault />
      </main>
    </div>
  );
}