const COMMON = ['password', 'password123', '123456', '12345678', 'qwerty', 'admin',
  'admin123', 'letmein', 'welcome', 'iloveyou', 'abc123', '111111'];

// Shannon-style entropy estimate: E = L * log2(R)
function entropyBits(pw) {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 32;
  return pool ? Math.round(pw.length * Math.log2(pool) * 10) / 10 : 0;
}

function classify(pw) {
  if (COMMON.includes(pw.toLowerCase())) return 'weak';
  const e = entropyBits(pw);
  if (e >= 60) return 'strong';
  if (e >= 40) return 'medium';
  return 'weak';
}

module.exports = { entropyBits, classify };