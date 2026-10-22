const base = 'http://localhost:5000/api';
async function call(path, method = 'GET', body, token) {
  const r = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: r.status, data: await r.json() };
}
(async () => {
  const email = 'test' + Date.now() + '@mail.com';
  const pw = 'MasterPass#123';
  console.log('Register:', await call('/auth/register', 'POST', { email, password: pw }));
  const login = await call('/auth/login', 'POST', { email, password: pw });
  console.log('Login status:', login.status);
  const t = login.data.token;
  console.log('Add 1:', await call('/vault', 'POST', { site: 'github.com', username: 'demo_user', password: 'Xk9$mP2#qL7!vR' }, t));
  console.log('Add 2:', await call('/vault', 'POST', { site: 'x.com', username: 'demo_user', password: 'password123' }, t));
  console.log('List:', JSON.stringify((await call('/vault', 'GET', null, t)).data, null, 2));
  console.log('No token:', await call('/vault'));
})();