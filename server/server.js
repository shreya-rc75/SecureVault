const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vault', require('./routes/vault'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SecureVault server running on http://localhost:${PORT}`));