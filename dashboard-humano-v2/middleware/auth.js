const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dashboard-humano-secret-key-change-in-production';

function authenticateToken(req, res, next) {
  // Obtener token solo de la cookie (httpOnly)
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
}

module.exports = { authenticateToken, JWT_SECRET };
