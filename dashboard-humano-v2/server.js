const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { authenticateToken, JWT_SECRET } = require('./middleware/auth');

console.log('🚀 Iniciando Dashboard Humano v2 - VERSIÓN CORREGIDA');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configuración
const PORT = process.env.DASHBOARD_HUMANO_PORT || 3001;
const AGENT_ID = 'santa-ana';
const BOT_API_URL = 'http://localhost:3011';

// Paths
const CONFIG_PATH = path.join(__dirname, '../config/agents.json');
const DATA_PATH = path.join(__dirname, '../data/santa-ana');
const HISTORIAL_PATH = path.join(DATA_PATH, 'historial.json');
const PAUSAS_PATH = path.join(DATA_PATH, 'pausas.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
// express.static se mueve al final (después de las rutas API)

// Rate limiting para login
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 5, // 5 intentos
  message: { error: 'Demasiados intentos de login. Intenta en 1 minuto.' }
});

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function leerConfig() {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    const agent = config.agents.find(a => a.id === AGENT_ID);
    return agent;
  } catch (error) {
    console.error('Error leyendo config:', error);
    return null;
  }
}

function leerHistorial() {
  try {
    if (fs.existsSync(HISTORIAL_PATH)) {
      return JSON.parse(fs.readFileSync(HISTORIAL_PATH, 'utf8'));
    }
    return {};
  } catch (error) {
    console.error('Error leyendo historial:', error);
    return {};
  }
}

function leerPausas() {
  try {
    if (fs.existsSync(PAUSAS_PATH)) {
      return JSON.parse(fs.readFileSync(PAUSAS_PATH, 'utf8'));
    }
    return {};
  } catch (error) {
    console.error('Error leyendo pausas:', error);
    return {};
  }
}

function obtenerChats() {
  const historial = leerHistorial();
  const pausas = leerPausas();
  const chats = [];

  for (const [userId, mensajes] of Object.entries(historial)) {
    if (!mensajes || mensajes.length === 0) continue;

    const ultimoMensaje = mensajes[mensajes.length - 1];
    const pausado = pausas[userId]?.pausado || false;
    
    let estado = 'bot'; // Por defecto, bot manejando
    if (pausado) {
      estado = 'waiting_human'; // Cliente esperando humano
    }

    chats.push({
      userId,
      nombre: userId.split('@')[0],
      ultimoMensaje: ultimoMensaje.text?.substring(0, 50) || '',
      timestamp: ultimoMensaje.timestamp || Date.now(),
      estado,
      mensajes: mensajes.length,
      noLeidos: pausado ? 1 : 0
    });
  }

  // Ordenar por más reciente
  chats.sort((a, b) => b.timestamp - a.timestamp);

  return chats;
}

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

console.log('📝 Registrando rutas de autenticación...');

app.get('/api/test', (req, res) => {
  console.log('✅ Test route hit!');
  res.json({ success: true, message: 'Test OK' });
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  console.log('🔐 Login attempt:', req.body);
  const { username, password } = req.body;

  if (!username || !password) {
    console.log('❌ Missing credentials');
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }

  const agent = leerConfig();
  console.log('📋 Agent config:', agent ? 'Found' : 'Not found');
  console.log('👥 Dashboard users:', agent?.dashboardUsers ? 'Found' : 'Not found');
  
  if (!agent || !agent.dashboardUsers) {
    console.log('❌ No dashboard users configured');
    return res.status(500).json({ error: 'Configuración de usuarios no encontrada' });
  }

  const user = agent.dashboardUsers.find(u => u.username === username);
  console.log('👤 User found:', user ? 'Yes' : 'No');
  
  if (!user) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  console.log('🔑 Password valid:', validPassword);
  
  if (!validPassword) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }

  // Generar JWT
  const token = jwt.sign(
    { username: user.username, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 8 * 60 * 60 * 1000, // 8 horas
    sameSite: 'strict'
  });

  res.json({
    success: true,
    user: {
      username: user.username,
      name: user.name,
      role: user.role
    },
    token
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ============================================
// RUTAS DE DASHBOARD (PROTEGIDAS)
// ============================================

app.get('/api/chats', authenticateToken, (req, res) => {
  const chats = obtenerChats();
  res.json(chats);
});

app.get('/api/chats/:userId/messages', authenticateToken, (req, res) => {
  const { userId } = req.params;
  const historial = leerHistorial();
  const mensajes = historial[userId] || [];
  res.json(mensajes);
});

app.post('/api/chats/:userId/message', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  try {
    // Enviar mensaje al bot API
    const response = await fetch(`${BOT_API_URL}/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: userId,
        message: message
      })
    });

    if (!response.ok) {
      throw new Error('Error enviando mensaje al bot');
    }

    // Emitir evento de Socket.IO
    io.emit('message_sent', { userId, message, timestamp: Date.now() });

    res.json({ success: true });
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({ error: 'Error enviando mensaje' });
  }
});

app.post('/api/chats/:userId/finish', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    // Enviar "MUCHAS GRACIAS" para reactivar el bot
    const response = await fetch(`${BOT_API_URL}/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: userId,
        message: 'MUCHAS GRACIAS'
      })
    });

    if (!response.ok) {
      throw new Error('Error finalizando conversación');
    }

    // Emitir evento
    io.emit('bot_resumed', { userId });

    res.json({ success: true });
  } catch (error) {
    console.error('Error finalizando conversación:', error);
    res.status(500).json({ error: 'Error finalizando conversación' });
  }
});

// ============================================
// WEBSOCKET
// ============================================

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('join_dashboard', ({ agentId }) => {
    socket.join(agentId);
    console.log(`Cliente ${socket.id} unido a sala ${agentId}`);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Polling para detectar cambios (cada 3 segundos)
setInterval(() => {
  const chats = obtenerChats();
  io.emit('chats_updated', chats);
}, 3000);

// ============================================
// SERVIR ARCHIVOS ESTÁTICOS (DESPUÉS DE RUTAS API)
// ============================================
app.use(express.static('public'));

// ============================================
// INICIAR SERVIDOR
// ============================================

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Dashboard Humano corriendo en http://0.0.0.0:${PORT}`);
  console.log(`📊 Agente: ${AGENT_ID}`);
});
