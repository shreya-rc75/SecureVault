const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { encrypt, decrypt, fingerprint } = require('../utils/crypto');
const { classify, entropyBits } = require('../utils/strength');

const router = express.Router();
router.use(requireAuth);

function toEntry(row, key) {
  const password = decrypt(
    { ciphertext: row.ciphertext, iv: row.iv, authTag: row.auth_tag }, key);
  return {
    id: row.id,
    site: row.site,
    username: row.username,
    password,
    strength: classify(password),
    entropy: entropyBits(password),
    updatedAt: row.updated_at,
  };
}

// List all credentials (decrypted for the logged-in user)
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM credentials WHERE user_id = ? ORDER BY id DESC').all(req.userId);
  res.json(rows.map((r) => toEntry(r, req.key)));
});

// Add a credential
router.post('/', (req, res) => {
  const { site, username, password } = req.body || {};
  if (!site || !username || !password) return res.status(400).json({ error: 'site, username and password required' });
  const enc = encrypt(password, req.key);
  const info = db.prepare(
    `INSERT INTO credentials (user_id, site, username, ciphertext, iv, auth_tag, pwd_fingerprint)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(req.userId, site, username, enc.ciphertext, enc.iv, enc.authTag, fingerprint(password, req.key));
  res.status(201).json({ id: info.lastInsertRowid });
});

// Update a credential
router.put('/:id', (req, res) => {
  const { site, username, password } = req.body || {};
  if (!site || !username || !password) return res.status(400).json({ error: 'site, username and password required' });
  const enc = encrypt(password, req.key);
  const info = db.prepare(
    `UPDATE credentials SET site=?, username=?, ciphertext=?, iv=?, auth_tag=?, pwd_fingerprint=?, updated_at=CURRENT_TIMESTAMP
     WHERE id=? AND user_id=?`
  ).run(site, username, enc.ciphertext, enc.iv, enc.authTag, fingerprint(password, req.key), req.params.id, req.userId);
  if (!info.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Updated' });
});

// Delete a credential
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM credentials WHERE id=? AND user_id=?').run(req.params.id, req.userId);
  if (!info.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;