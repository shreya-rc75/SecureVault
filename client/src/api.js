const BASE = 'http://localhost:5000/api';

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('sv_token');
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  // Session expired (e.g. server restarted): go back to login
  if (res.status === 401 && token) {
    localStorage.removeItem('sv_token');
    localStorage.removeItem('sv_email');
    window.location.reload();
  }
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}