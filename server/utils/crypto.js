const crypto = require('crypto');

// Derive a 256-bit key from the master password using scrypt + per-user salt
function deriveKey(masterPassword, saltHex) {
  return crypto.scryptSync(masterPassword, Buffer.from(saltHex, 'hex'), 32);
}

// AES-256-GCM encryption
function encrypt(plaintext, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return {
    ciphertext: enc.toString('base64'),
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
  };
}

function decrypt({ ciphertext, iv, authTag }, key) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64')),
    decipher.final(),
  ]);
  return dec.toString('utf8');
}

// Keyed hash used only to detect reused passwords (plaintext is never compared)
function fingerprint(password, key) {
  return crypto.createHmac('sha256', key).update(password).digest('hex');
}

module.exports = { deriveKey, encrypt, decrypt, fingerprint };