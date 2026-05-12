require('dotenv').config();
const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const socketIo = require('socket.io');
const fetch = require('node-fetch');
const { execSync } = require('child_process');

// ─── RUTAS MODULARES ──────────────────────────────────────
const humanPanelRoutes = require('./routes/human-panel');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.DASHBOARD_CENTRAL_PORT || 3000;
const DASHBOARD_USER = process.env.DASHBOARD_CENTRAL_USER || 'admin';
const DASHBOARD_PASS = process.env.DASHBOARD_CENTRAL_PASS || 'admin123';

app.use(express.json());

// Middleware de autenticación básica HTTP
app.use((req, res, next) => {
  if (req.path.match(/\.(css|js|png|ico|wav)$/)) return next();
  if (req.path.startsWith('/socket.io')) return next();

  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Dashboard Central"');
    return res.status(401).send('Autenticación requerida');
  }

  const [user, pass] = Buffer.from(auth.slice(6), 'base64').toString().split(':');
  if (user !== DASHBOARD_USER || pass !== DASHBOARD_PASS) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Dashboard Central"');
    return res.status(401).send('Credenciales incorrectas');
  }
  next();
});

app.use(express.static('public-central'));

// ─── RUTAS DEL PANEL HUMANO ──────────────────────────────
app.use('/api/agents', humanPanelRoutes);

// Ruta para la página del panel humano
app.get('/human-panel/:id?', (req, res) => {
  const htmlPath = path.join(__dirname, 'public-central', 'human-panel.html');
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.status(404).send('Página no encontrada');
  }
});

// Ruta para la página de detalles del agente
app.get('/agente/:id', (req, res) => {
  const agentId = req.params.id;
  const htmlPath = path.join(__dirname, 'public-central', 'agent-details.html');
  
  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, 'utf8');
    res.send(html);
  } else {
    res.status(404).send('Página no encontrada');
  }
});

// API para obtener aliases de teléfonos
app.get('/api/phone-aliases', (req, res) => {
  const aliasesPath = path.join(__dirname, 'config', 'phone-aliases.json');
  
  if (fs.existsSync(aliasesPath)) {
    const aliases = JSON.parse(fs.readFileSync(aliasesPath, 'utf8'));
    res.json(aliases);
  } else {
    res.json({ aliases: {} });
  }
});

// Cargar configuración de agentes
function loadAgentsConfig() {
  const configPath = path.join(__dirname, 'config', 'agents.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

// GET /api/agents - Lista de agentes
app.get('/api/agents', (req, res) => {
  const config = loadAgentsConfig();
  res.json(config.agents);
});

// GET /api/agents/:id/stats - Stats de un agente
app.get('/api/agents/:id/stats', async (req, res) => {
  try {
    const config = loadAgentsConfig();
    const agent = config.agents.find(a => a.id === req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }

    // Leer archivo de estadisticas del agente
    const statsPath = path.join(__dirname, agent.paths.data, 'estadisticas.json');
    
    if (!fs.existsSync(statsPath)) {
      return res.json({
        mensajes: {},
        handoffs: {},
        hijacking: {},
        busquedas: {}
      });
    }

    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/agents/:id/status - Status de un agente
app.get('/api/agents/:id/status', async (req, res) => {
  try {
    const config = loadAgentsConfig();
    const agent = config.agents.find(a => a.id === req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }

    const response = await fetch(`http://localhost:${agent.ports.api}/status`);
    const status = await response.json();
    
    res.json(status);
  } catch (error) {
    res.json({ isRunning: false, error: error.message });
  }
});

// GET /api/agents/:id/paused - Usuarios pausados de un agente
app.get('/api/agents/:id/paused', async (req, res) => {
  try {
    const config = loadAgentsConfig();
    const agent = config.agents.find(a => a.id === req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }

    const response = await fetch(`http://localhost:${agent.ports.api}/paused`);
    const paused = await response.json();
    
    res.json(paused);
  } catch (error) {
    res.json([]);
  }
});

// GET /api/agents/:id/conversations - Conversaciones de un agente
app.get('/api/agents/:id/conversations', async (req, res) => {
  try {
    const config = loadAgentsConfig();
    const agent = config.agents.find(a => a.id === req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }

    const response = await fetch(`http://localhost:${agent.ports.api}/conversations`);
    const conversations = await response.json();
    
    res.json(conversations);
  } catch (error) {
    res.json([]);
  }
});

// GET /api/agents/:id/logs - Logs de un agente
app.get('/api/agents/:id/logs', async (req, res) => {
  try {
    const config = loadAgentsConfig();
    const agent = config.agents.find(a => a.id === req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }

    const lines = req.query.lines || 50;
    const response = await fetch(`http://localhost:${agent.ports.api}/logs?lines=${lines}`);
    const logs = await response.json();
    
    res.json(logs);
  } catch (error) {
    res.json([]);
  }
});

// GET /api/agents/:id/security - Logs de seguridad de un agente
app.get('/api/agents/:id/security', async (req, res) => {
  try {
    const config = loadAgentsConfig();
    const agent = config.agents.find(a => a.id === req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }

    const lines = req.query.lines || 20;
    const response = await fetch(`http://localhost:${agent.ports.api}/security?lines=${lines}`);
    const security = await response.json();
    
    res.json(security);
  } catch (error) {
    res.json([]);
  }
});

// GET /api/agents/:id/stats/detailed - Estadísticas detalladas
app.get('/api/agents/:id/stats/detailed', async (req, res) => {
  try {
    const config = loadAgentsConfig();
    const agent = config.agents.find(a => a.id === req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }

    const response = await fetch(`http://localhost:${agent.ports.api}/stats`);
    const stats = await response.json();
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/agents/:id/pause-global - Pausar bot globalmente
app.post('/api/agents/:id/pause-global', async (req, res) => {
  try {
    const config = loadAgentsConfig();
    const agent = config.agents.find(a => a.id === req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }

    const response = await fetch(`http://localhost:${agent.ports.api}/pause-global`, { 
      method: 'POST' 
    });
    const result = await response.json();
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/agents/:id/resume-global - Reanudar bot globalmente
app.post('/api/agents/:id/resume-global', async (req, res) => {
  try {
    const config = loadAgentsConfig();
    const agent = config.agents.find(a => a.id === req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }

    const response = await fetch(`http://localhost:${agent.ports.api}/resume-global`, { 
      method: 'POST' 
    });
    const result = await response.json();
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/agents/:id/resume/:userId - Reanudar usuario específico
app.post('/api/agents/:id/resume/:userId', async (req, res) => {
  try {
    const config = loadAgentsConfig();
    const agent = config.agents.find(a => a.id === req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }

    const response = await fetch(`http://localhost:${agent.ports.api}/resume/${req.params.userId}`, { 
      method: 'POST' 
    });
    const result = await response.json();
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/agents/:id/stats/history/:days - Historial de estadísticas
app.get('/api/agents/:id/stats/history/:days', async (req, res) => {
  try {
    const config = loadAgentsConfig();
    const agent = config.agents.find(a => a.id === req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }

    const days = parseInt(req.params.days) || 7;
    const response = await fetch(`http://localhost:${agent.ports.api}/stats/history/${days}`);
    const history = await response.json();
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/agents/:id/stats/searches - Consultas frecuentes
app.get('/api/agents/:id/stats/searches', async (req, res) => {
  try {
    const config = loadAgentsConfig();
    const agent = config.agents.find(a => a.id === req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }

    const days = parseInt(req.query.days) || 7;
    const response = await fetch(`http://localhost:${agent.ports.api}/stats/searches?days=${days}`);
    const searches = await response.json();
    
    res.json(searches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── VIGILANCIA DE HISTORIALES PARA NOTIFICACIONES ───────────────────────────
const historialWatchers = new Map(); // agentId -> watcher
const lastMessageTimestamps = new Map(); // `${agentId}_${userId}` -> timestamp

function setupHistorialWatchers() {
  try {
    const config = loadAgentsConfig();
    
    for (const agent of config.agents) {
      if (!agent.enabled) continue;
      if (historialWatchers.has(agent.id)) continue;
      
      const historialPath = path.join(__dirname, agent.paths.data, 'historial.json');
      const watchDir = path.dirname(historialPath);
      
      console.log(`📡 Vigilando cambios en historial de ${agent.id}`);
      
      const watcher = fs.watch(watchDir, { persistent: true }, (eventType, filename) => {
        if (eventType === 'change' || (filename && filename.endsWith('historial.json'))) {
          clearTimeout(watcher.debounce);
          watcher.debounce = setTimeout(() => {
            handleHistorialChange(agent.id, historialPath);
          }, 500);
        }
      });
      
      historialWatchers.set(agent.id, watcher);
    }
  } catch (error) {
    console.error('Error configurando vigilancia:', error.message);
  }
}

function handleHistorialChange(agentId, historialPath) {
  try {
    if (!fs.existsSync(historialPath)) return;
    
    const historial = JSON.parse(fs.readFileSync(historialPath, 'utf8'));
    
    for (const [userId, messages] of Object.entries(historial)) {
      if (!Array.isArray(messages) || messages.length === 0) continue;
      
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role !== 'user') continue;
      
      const key = `${agentId}_${userId}`;
      const lastTracked = lastMessageTimestamps.get(key) || 0;
      
      if (lastMsg.timestamp > lastTracked) {
        lastMessageTimestamps.set(key, lastMsg.timestamp);
        console.log(`🔔 Nuevo mensaje de ${userId}: "${lastMsg.text.substring(0, 20)}..."`);
        io.emit(`agent_${agentId}_new_message`, {
          agentId,
          userId,
          message: lastMsg,
          timestamp: Date.now()
        });
      }
    }
  } catch (error) {
    console.error(`Error en historial de ${agentId}:`, error.message);
  }
}

// ─── WEBSOCKET PARA TIEMPO REAL ─────────────────────────────────────────

io.on('connection', async (socket) => {
  console.log('📊 Dashboard centralizado conectado');
  
  try {
    const config = loadAgentsConfig();
    
    // Enviar datos iniciales para cada agente
    for (const agent of config.agents) {
      if (agent.enabled) {
        try {
          const [stats, conversations, paused, logs, security] = await Promise.all([
            fetch(`http://localhost:${agent.ports.api}/stats`).then(r => r.json()),
            fetch(`http://localhost:${agent.ports.api}/conversations?limit=0`).then(r => r.json()),
            fetch(`http://localhost:${agent.ports.api}/paused`).then(r => r.json()),
            fetch(`http://localhost:${agent.ports.api}/logs?lines=50`).then(r => r.json()),
            fetch(`http://localhost:${agent.ports.api}/security?lines=30`).then(r => r.json())
          ]);
          
          const pausedCount = Array.isArray(paused) ? paused.length : Object.keys(paused).length;
          socket.emit(`agent_${agent.id}_initial`, {
            agentId: agent.id,
            stats,
            conversations: conversations.conversaciones || conversations,
            resumenPorNumero: conversations.resumenPorNumero || [],
            paused,
            pausedCount,
            logs,
            security
          });
        } catch (error) {
          console.error(`Error enviando datos iniciales de ${agent.id}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error en conexión WebSocket:', error.message);
  }
  
  socket.on('disconnect', () => {
    console.log('📊 Dashboard desconectado');
  });
});

// Actualizar datos cada X segundos (configurable via .env)
const UPDATE_INTERVAL = parseInt(process.env.WS_UPDATE_INTERVAL) || 10000;

setInterval(async () => {
  try {
    const config = loadAgentsConfig();
    
    for (const agent of config.agents) {
      if (agent.enabled) {
        try {
          const [stats, conversations, paused, logs, security] = await Promise.all([
            fetch(`http://localhost:${agent.ports.api}/stats`).then(r => r.json()),
            fetch(`http://localhost:${agent.ports.api}/conversations?limit=0`).then(r => r.json()),
            fetch(`http://localhost:${agent.ports.api}/paused`).then(r => r.json()),
            fetch(`http://localhost:${agent.ports.api}/logs?lines=50`).then(r => r.json()),
            fetch(`http://localhost:${agent.ports.api}/security?lines=30`).then(r => r.json())
          ]);
          
          const pausedCount = Array.isArray(paused) ? paused.length : Object.keys(paused).length;
          io.emit(`agent_${agent.id}_update`, {
            agentId: agent.id,
            stats,
            conversations: conversations.conversaciones || conversations,
            resumenPorNumero: conversations.resumenPorNumero || [],
            paused,
            pausedCount,
            logs,
            security
          });
        } catch (error) {
          console.error(`Error actualizando ${agent.id}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error en actualización WebSocket:', error.message);
  }
}, UPDATE_INTERVAL);

// ─── ENDPOINTS DE SISTEMA: BACKUP Y LOGS ──────────────────────────────────

// GET /api/system/backup-status
app.get('/api/system/backup-status', (req, res) => {
  try {
    const backupDir = '/home/forma/backups';
    const prodDir = path.join(__dirname);

    let lastBackup = null;
    let backupSize = null;
    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir)
        .filter(f => f.endsWith('.tar.gz'))
        .sort()
        .reverse();
      if (files.length > 0) {
        lastBackup = files[0].replace('.tar.gz', '');
        const stat = fs.statSync(path.join(backupDir, files[0]));
        backupSize = (stat.size / 1024 / 1024).toFixed(2) + ' MB';
      }
    }

    const config = loadAgentsConfig();
    const logSizes = {};
    for (const agent of config.agents) {
      const logDir = path.join(prodDir, agent.paths.logs || `logs/${agent.id}`);
      if (fs.existsSync(logDir)) {
        let totalSize = 0;
        fs.readdirSync(logDir).forEach(f => {
          try { totalSize += fs.statSync(path.join(logDir, f)).size; } catch(e) {}
        });
        logSizes[agent.id] = (totalSize / 1024 / 1024).toFixed(2) + ' MB';
      } else {
        logSizes[agent.id] = '0 MB';
      }
    }

    res.json({ lastBackup, backupSize, logSizes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/system/backup
app.post('/api/system/backup', (req, res) => {
  try {
    const scriptPath = path.join(__dirname, 'scripts/backup.sh');
    if (!fs.existsSync(scriptPath)) {
      return res.status(404).json({ error: 'Script de backup no encontrado' });
    }
    execSync(`bash ${scriptPath}`, { timeout: 60000 });
    res.json({ success: true, message: 'Backup completado' });
  } catch (error) {
    res.status(500).json({ error: 'Error ejecutando backup: ' + error.message });
  }
});

// POST /api/system/rotate-logs
app.post('/api/system/rotate-logs', (req, res) => {
  try {
    const scriptPath = path.join(__dirname, 'scripts/rotate-logs.sh');
    if (!fs.existsSync(scriptPath)) {
      return res.status(404).json({ error: 'Script de rotación no encontrado' });
    }
    execSync(`bash ${scriptPath}`, { timeout: 30000 });
    res.json({ success: true, message: 'Logs rotados' });
  } catch (error) {
    res.status(500).json({ error: 'Error rotando logs: ' + error.message });
  }
});

server.listen(PORT, () => {
  console.log(`\n🎈 ===== DASHBOARD CENTRALIZADO =====`);
  console.log(`📊 Dashboard disponible en: http://localhost:${PORT}`);
  console.log(`🔄 WebSocket activado (actualizaciones cada ${UPDATE_INTERVAL/1000}s)`);
  console.log(`📁 Leyendo datos de: ./data/ y ./logs/`);
  console.log(`=====================================\n`);

  // Iniciar vigilancia de historiales para notificaciones
  setupHistorialWatchers();
});
