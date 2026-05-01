const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { AUTO_RESUME_TIMEOUT_MS } = require('./lib/validation');
const { 
  getEstadisticasHoy, 
  getEstadisticasUltimosDias, 
  getResumenGeneral, 
  getConsultasFrecuentes 
} = require('./lib/statistics');

// Polyfill para fetch en Node.js
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.DASHBOARD_PORT || 3001;

// ─── MIDDLEWARE ──────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ─── FUNCIONES PARA LEER DATOS ───────────────────────────────────────────────

function leerArchivoPausas() {
  try {
    const archivo = path.join(__dirname, 'data', 'pausas.json');
    if (fs.existsSync(archivo)) {
      const data = fs.readFileSync(archivo, 'utf8');
      const parsed = JSON.parse(data);
      // Validar estructura
      if (typeof parsed.global !== "boolean") {
        parsed.global = false;
      }
      if (!parsed.usuarios || typeof parsed.usuarios !== "object") {
        parsed.usuarios = {};
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error leyendo pausas:', error.message);
  }
  return { usuarios: {}, global: false };
}

function leerArchivoHistorial() {
  try {
    const archivo = path.join(__dirname, 'data', 'historial.json');
    if (fs.existsSync(archivo)) {
      const data = fs.readFileSync(archivo, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error leyendo historial:', error.message);
  }
  return {};
}

function leerLogs(archivo, lineas = 50) {
  try {
    const rutaArchivo = path.join(__dirname, 'logs', archivo);
    if (fs.existsSync(rutaArchivo)) {
      const data = fs.readFileSync(rutaArchivo, 'utf8');
      return data.split('\n').filter(l => l.trim()).slice(-lineas);
    }
  } catch (error) {
    console.error(`Error leyendo ${archivo}:`, error.message);
  }
  return [];
}

function obtenerEstadisticas() {
  const pausas = leerArchivoPausas();
  
  // Obtener estadísticas del sistema de estadísticas (async)
  return getResumenGeneral().then(resumen => {
    return {
      mensajesHoy: resumen.hoy.mensajes.recibidos,
      handoffs: resumen.hoy.handoffs.total,
      usuariosActivos: resumen.hoy.usuariosUnicos,
      usuariosPausados: Object.keys(pausas.usuarios).length,
      botActivo: !pausas.global,
      
      // Estadísticas adicionales
      busquedasHoy: resumen.hoy.busquedas.total,
      hijackingHoy: resumen.hoy.hijacking.total,
      promedioDiario: resumen.semana.promedioDiario,
      totalUsuarios: resumen.total.usuariosRegistrados,
      diasActivo: resumen.total.diasActivo
    };
  }).catch(error => {
    console.error('Error obteniendo estadísticas:', error.message);
    return {
      mensajesHoy: 0,
      handoffs: 0,
      usuariosActivos: 0,
      usuariosPausados: Object.keys(pausas.usuarios).length,
      botActivo: !pausas.global,
      busquedasHoy: 0,
      hijackingHoy: 0,
      promedioDiario: { mensajes: 0, handoffs: 0, busquedas: 0 },
      totalUsuarios: 0,
      diasActivo: 0
    };
  });
}

function obtenerConversaciones() {
  const historial = leerArchivoHistorial();
  const conversaciones = [];
  
  for (const [userId, mensajes] of Object.entries(historial)) {
    if (mensajes && mensajes.length > 0) {
      const ultimosMensajes = mensajes.slice(-5).map(msg => ({
        type: msg.role === 'user' ? 'user' : 'bot',
        text: msg.text.substring(0, 100) + (msg.text.length > 100 ? '...' : ''),
        timestamp: msg.timestamp
      }));
      
      conversaciones.push({
        userId,
        messages: ultimosMensajes,
        lastMessage: mensajes[mensajes.length - 1].timestamp
      });
    }
  }
  
  // Ordenar por último mensaje
  return conversaciones.sort((a, b) => b.lastMessage - a.lastMessage).slice(0, 10);
}

function obtenerUsuariosPausados() {
  const pausas = leerArchivoPausas();
  const ahora = Date.now();
  
  return Object.entries(pausas.usuarios).map(([userId, pausa]) => ({
    userId,
    timestamp: pausa.timestamp,
    reason: pausa.razon,
    minutosTranscurridos: Math.floor((ahora - pausa.timestamp) / 60000),
    autoResumeIn: Math.max(0, AUTO_RESUME_TIMEOUT_MS - (ahora - pausa.timestamp))
  }));
}

function obtenerLogsSeguridad() {
  const logs = leerLogs('security.log', 20);
  return logs.map(log => {
    const match = log.match(/\[(.+?)\].*Usuario: (.+?) - Tipo: (.+?) - Mensaje: "(.+?)"/);
    if (match) {
      const [, timestamp, userId, tipo, mensaje] = match;
      return {
        timestamp,
        userId: userId.replace(/@(c\.us|lid)$/, ''),
        tipo,
        mensaje: mensaje.substring(0, 50) + (mensaje.length > 50 ? '...' : '')
      };
    }
    return { timestamp: 'Unknown', userId: 'Unknown', tipo: 'Unknown', mensaje: log };
  });
}

// ─── API ENDPOINTS ───────────────────────────────────────────────────────────

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await obtenerEstadisticas();
    res.json(stats);
  } catch (error) {
    console.error('Error en /api/stats:', error.message);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

app.get('/api/conversations', (req, res) => {
  res.json(obtenerConversaciones());
});

app.get('/api/paused', (req, res) => {
  res.json(obtenerUsuariosPausados());
});

app.get('/api/logs', (req, res) => {
  const logs = leerLogs('bot.log', 30);
  res.json(logs.map(log => ({
    timestamp: log.match(/\[(.+?)\]/)?.[1] || 'Unknown',
    message: log
  })));
});

app.get('/api/security', (req, res) => {
  res.json(obtenerLogsSeguridad());
});

// ─── NUEVOS ENDPOINTS DE ESTADÍSTICAS ────────────────────────────────────────

app.get('/api/stats/detailed', async (req, res) => {
  try {
    const resumen = await getResumenGeneral();
    res.json(resumen);
  } catch (error) {
    console.error('Error en /api/stats/detailed:', error.message);
    res.status(500).json({ error: 'Error obteniendo estadísticas detalladas' });
  }
});

app.get('/api/stats/history/:days', async (req, res) => {
  try {
    const days = parseInt(req.params.days) || 7;
    const historial = await getEstadisticasUltimosDias(days);
    res.json(historial);
  } catch (error) {
    console.error('Error en /api/stats/history:', error.message);
    res.status(500).json({ error: 'Error obteniendo historial' });
  }
});

app.get('/api/stats/searches', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const consultas = await getConsultasFrecuentes(days);
    res.json(consultas);
  } catch (error) {
    console.error('Error en /api/stats/searches:', error.message);
    res.status(500).json({ error: 'Error obteniendo consultas' });
  }
});

app.get('/api/stats/today', async (req, res) => {
  try {
    const hoy = await getEstadisticasHoy();
    res.json(hoy);
  } catch (error) {
    console.error('Error en /api/stats/today:', error.message);
    res.status(500).json({ error: 'Error obteniendo estadísticas de hoy' });
  }
});

const BOT_API_URL = "http://localhost:3002";

app.post('/api/pause/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const response = await fetch(`${BOT_API_URL}/pause/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/resume/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const response = await fetch(`${BOT_API_URL}/resume/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/pause-global', async (req, res) => {
  try {
    const response = await fetch(`${BOT_API_URL}/pause-global`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/resume-global', async (req, res) => {
  try {
    const response = await fetch(`${BOT_API_URL}/resume-global`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── WEBSOCKET PARA TIEMPO REAL ──────────────────────────────────────────────

io.on('connection', async (socket) => {
  console.log('📊 Dashboard conectado');
  
  try {
    // Enviar datos iniciales
    const stats = await obtenerEstadisticas();
    socket.emit('initial_data', {
      stats,
      conversations: obtenerConversaciones(),
      paused: obtenerUsuariosPausados(),
      security: obtenerLogsSeguridad()
    });
  } catch (error) {
    console.error('Error enviando datos iniciales:', error.message);
    socket.emit('initial_data', {
      stats: {},
      conversations: [],
      paused: [],
      security: []
    });
  }
  
  socket.on('disconnect', () => {
    console.log('📊 Dashboard desconectado');
  });
});

// Actualizar datos cada 10 segundos
setInterval(async () => {
  try {
    const stats = await obtenerEstadisticas();
    io.emit('stats_update', stats);
    io.emit('conversations_update', obtenerConversaciones());
    io.emit('paused_update', obtenerUsuariosPausados());
  } catch (error) {
    console.error('Error actualizando datos WebSocket:', error.message);
  }
}, 10000);

// ─── INICIAR SERVIDOR ────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`\n🎈 ===== DOLCE PARTY DASHBOARD =====`);
  console.log(`📊 Dashboard disponible en: http://localhost:${PORT}`);
  console.log(`🔄 Actualizaciones en tiempo real activadas`);
  console.log(`📁 Leyendo datos de: ./data/ y ./logs/`);
  console.log(`=====================================\n`);
});

// ─── MANEJO DE ERRORES ───────────────────────────────────────────────────────

process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada:', reason);
});