const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/auth/login', (req, res) => {
  console.log('Login route hit!', req.body);
  res.json({ success: true, message: 'Test OK' });
});

app.listen(3002, () => {
  console.log('Test server on http://localhost:3002');
});
