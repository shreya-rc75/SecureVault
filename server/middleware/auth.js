const jwt = require('jsonwebtoken');
const sessions = require('../sessions');

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const key = sessions.get(payload.sid);
    if (!key) return res.status(401).json({ error: 'Session expired, please log in again' });
    req.userId = payload.uid;
    req.key = key;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { requireAuth, JWT_SECRET };