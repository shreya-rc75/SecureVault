const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const sessions = require('../sessions');
const { deriveKey } = require('../utils/crypto');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (password.length < 8) return res.status(400).json({ error: 'Master password must be at least 8 characters' });

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(409).json({ error: 'Email already registered' });

  const hash = bcrypt.hashSync(password, 10);
  const salt = crypto.randomBytes(16).toString('hex');
  db.prepare('INSERT INTO users (email, password_hash, kdf_salt) VALUES (?, ?, ?)').run(email, hash, salt);
  res.status(201).json({ message: 'Registered successfully' });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const sid = crypto.randomUUID();
  sessions.set(sid, deriveKey(password, user.kdf_salt));
  const token = jwt.sign({ uid: user.id, sid }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, email: user.email });
});

router.post('/logout', (req, res) => {
  try {
    const token = (req.headers.authorization || '').slice(7);
    const payload = jwt.verify(token, JWT_SECRET);
    sessions.delete(payload.sid);
  } catch {}
  res.json({ message: 'Logged out' });
});

module.exports = router;