import { useEffect, useState } from 'react';
import { api } from '../api';

const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';

function generatePassword(len = 16) {
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => CHARS[n % CHARS.length]).join('');
}

// Same entropy formula as the backend: E = L * log2(R)
function clientStrength(pw) {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 32;
  const e = pool ? pw.length * Math.log2(pool) : 0;
  return e >= 60 ? 'strong' : e >= 40 ? 'medium' : 'weak';
}

export default function Vault() {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ site: '', username: '', password: '' });
  const [visible, setVisible] = useState({});
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);

  async function load() {
    try {
      setEntries(await api('/vault'));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    setError('');
    try {
      await api('/vault', { method: 'POST', body: form });
      setForm({ site: '', username: '', password: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this credential?')) return;
    await api(`/vault/${id}`, { method: 'DELETE' });
    load();
  }

  async function copy(entry) {
    try {
      await navigator.clipboard.writeText(entry.password);
      setCopied(entry.id);
      // Auto-clear clipboard after 15 seconds
      setTimeout(() => { navigator.clipboard.writeText('').catch(() => {}); setCopied(null); }, 15000);
    } catch {}
  }

  const formStrength = form.password ? clientStrength(form.password) : null;

  return (
    <>
      <form className="card add-form" onSubmit={add}>
        <h2>Add credential</h2>
        <div className="form-row">
          <input placeholder="Website (e.g. github.com)" value={form.site}
            onChange={(e) => setForm({ ...form, site: e.target.value })} required />
          <input placeholder="Username / email" value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <input placeholder="Password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button type="button" className="btn btn-ghost"
            onClick={() => setForm({ ...form, password: generatePassword() })}>
            Generate
          </button>
          <button className="btn">Save</button>
        </div>
        {formStrength && (
          <div className="meter">
            Strength: <span className={`badge ${formStrength}`}>{formStrength}</span>
          </div>
        )}
        {error && <div className="error">{error}</div>}
      </form>

      <div className="card">
        <h2>Your vault ({entries.length})</h2>
        {entries.length === 0 ? (
          <p className="muted">No credentials yet. Add your first one above.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Site</th><th>Username</th><th>Password</th><th>Strength</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {entries.map((en) => (
                  <tr key={en.id}>
                    <td>{en.site}</td>
                    <td>{en.username}</td>
                    <td className="mono">
                      {visible[en.id] ? en.password : '••••••••••'}
                      <button className="icon" title="Show / hide"
                        onClick={() => setVisible({ ...visible, [en.id]: !visible[en.id] })}>
                        {visible[en.id] ? '🙈' : '👁️'}
                      </button>
                    </td>
                    <td><span className={`badge ${en.strength}`}>{en.strength}</span></td>
                    <td>
                      <button className="btn btn-small" onClick={() => copy(en)}>
                        {copied === en.id ? 'Copied!' : 'Copy'}
                      </button>{' '}
                      <button className="btn btn-small btn-danger" onClick={() => remove(en.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}