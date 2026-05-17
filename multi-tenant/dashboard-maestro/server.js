const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const { readAgents } = require('./lib/agent-registry');
const { collectAgentsHealth } = require('./lib/health-collector');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

const PORT = parseInt(process.env.DASHBOARD_MAESTRO_PORT, 10) || 3050;
const REFRESH_INTERVAL_MS = parseInt(process.env.DASHBOARD_MAESTRO_REFRESH_MS, 10) || 300000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function getRegistryPayload() {
  const registry = readAgents();
  const agents = await collectAgentsHealth(registry.agents);

  return {
    ...registry,
    agents,
    health: {
      overall: summarizeOverallHealth(agents),
      checkedAt: new Date().toISOString()
    }
  };
}

function summarizeOverallHealth(agents) {
  if (agents.some(agent => agent.health?.overall === 'critical')) return 'critical';
  if (agents.some(agent => agent.health?.overall === 'warning')) return 'warning';
  return 'ok';
}

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'dashboard-maestro',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/agents', async (req, res) => {
  try {
    res.json(await getRegistryPayload());
  } catch (error) {
    res.status(500).json({
      error: 'No se pudo leer config/agents.json',
      message: error.message
    });
  }
});

io.on('connection', async (socket) => {
  console.log('Dashboard Maestro conectado');

  try {
    socket.emit('agents:update', await getRegistryPayload());
  } catch (error) {
    socket.emit('agents:error', { message: error.message });
  }

  socket.on('agents:refresh', async () => {
    try {
      io.emit('agents:update', await getRegistryPayload());
    } catch (error) {
      socket.emit('agents:error', { message: error.message });
    }
  });
});

setInterval(async () => {
  try {
    io.emit('agents:update', await getRegistryPayload());
  } catch (error) {
    io.emit('agents:error', { message: error.message });
  }
}, REFRESH_INTERVAL_MS);

server.listen(PORT, () => {
  console.log('');
  console.log('===== DASHBOARD MAESTRO =====');
  console.log(`Dashboard disponible en: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Refresh cada ${Math.round(REFRESH_INTERVAL_MS / 1000)}s`);
  console.log('=============================');
  console.log('');
});
