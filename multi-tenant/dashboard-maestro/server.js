const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const { readAgents } = require('./lib/agent-registry');
const { listAuditEvents, recordAuditEvent } = require('./lib/audit-log');
const { getBackupConfig, runBackupNow } = require('./lib/backup-control');
const { collectAgentsHealth } = require('./lib/health-collector');
const { getPm2Config, resolveProcessName, runPm2Action, validateActionInput } = require('./lib/pm2-control');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  },
  allowRequest: (req, callback) => {
    callback(null, isValidBasicAuth(req.headers.authorization));
  }
});

const PORT = parseInt(process.env.DASHBOARD_MAESTRO_PORT, 10) || 3050;
const REFRESH_INTERVAL_MS = parseInt(process.env.DASHBOARD_MAESTRO_REFRESH_MS, 10) || 300000;
const DASHBOARD_USER = process.env.DASHBOARD_MAESTRO_USER || 'admin';
const DASHBOARD_PASS = process.env.DASHBOARD_MAESTRO_PASS || 'admin123';

app.use(express.json());

app.use((req, res, next) => {
  if (req.path === '/health') return next();

  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Dashboard Maestro"');
    return res.status(401).send('Autenticación requerida');
  }

  const [user, pass] = Buffer.from(auth.slice(6), 'base64').toString().split(':');
  if (user !== DASHBOARD_USER || pass !== DASHBOARD_PASS) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Dashboard Maestro"');
    return res.status(401).send('Credenciales incorrectas');
  }

  next();
});

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

function getAuthUser(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) return 'unknown';
  return Buffer.from(auth.slice(6), 'base64').toString().split(':')[0] || 'unknown';
}

function isValidBasicAuth(authHeader) {
  if (!authHeader || !authHeader.startsWith('Basic ')) return false;
  const [user, pass] = Buffer.from(authHeader.slice(6), 'base64').toString().split(':');
  return user === DASHBOARD_USER && pass === DASHBOARD_PASS;
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

app.get('/api/actions/config', (req, res) => {
  res.json(getPm2Config());
});

app.get('/api/backups/config', (req, res) => {
  res.json(getBackupConfig());
});

app.get('/api/audit-events', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  res.json({ events: listAuditEvents(limit) });
});

app.post('/api/agents/:id/actions', async (req, res) => {
  const { target, action } = req.body || {};

  try {
    const registry = readAgents();
    const agent = registry.agents.find(item => item.id === req.params.id);
    const validationError = validateActionInput(agent, target, action);

    if (validationError) {
      const audit = recordAuditEvent({
        user: getAuthUser(req),
        ip: req.ip,
        action,
        target,
        agentId: req.params.id,
        result: 'rejected',
        error: validationError
      });

      return res.status(agent ? 400 : 404).json({ error: validationError, audit });
    }

    const processName = resolveProcessName(agent, target);
    const result = await runPm2Action(agent, target, action);
    const audit = recordAuditEvent({
      user: getAuthUser(req),
      ip: req.ip,
      action,
      target,
      agentId: agent.id,
      processName,
      result: 'success',
      message: `pm2 ${action} ${processName}`
    });

    res.json({ success: true, ...result, audit });
  } catch (error) {
    const audit = recordAuditEvent({
      user: getAuthUser(req),
      ip: req.ip,
      action,
      target,
      agentId: req.params.id,
      processName: error.processName || null,
      result: error.code === 'PM2_CONTROL_DISABLED' ? 'disabled' : 'error',
      error: error.stderr || error.message
    });

    const status = error.code === 'PM2_CONTROL_DISABLED' ? 403 : 500;
    res.status(status).json({
      error: error.message,
      processName: error.processName || null,
      audit
    });
  }
});

app.post('/api/backups/now', async (req, res) => {
  try {
    const result = await runBackupNow();
    const audit = recordAuditEvent({
      user: getAuthUser(req),
      ip: req.ip,
      action: 'backup-now',
      target: 'system',
      result: 'success',
      message: `backup script ${result.scriptPath}`
    });

    res.json({ success: true, ...result, audit });
  } catch (error) {
    const audit = recordAuditEvent({
      user: getAuthUser(req),
      ip: req.ip,
      action: 'backup-now',
      target: 'system',
      result: error.code === 'BACKUP_DISABLED' ? 'disabled' : 'error',
      error: error.stderr || error.message
    });

    const status = error.code === 'BACKUP_DISABLED' ? 403 : 500;
    res.status(status).json({ error: error.message, audit });
  }
});

io.use((socket, next) => {
  if (isValidBasicAuth(socket.handshake.headers.authorization)) return next();
  next(new Error('Autenticación requerida'));
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
