const fs = require('fs');
const path = require('path');

const DEFAULT_CONFIG_PATH = path.resolve(__dirname, '..', '..', '..', 'config', 'agents.json');

function normalizeAgent(agent) {
  return {
    id: agent.id,
    name: agent.name || agent.info?.nombre || agent.id,
    enabled: Boolean(agent.enabled),
    whatsappSession: agent.whatsappSession || null,
    ports: {
      api: agent.ports?.api || null,
      dashboard: agent.ports?.dashboard || null
    },
    paths: {
      data: agent.paths?.data || null,
      logs: agent.paths?.logs || null,
      catalog: agent.paths?.catalog || null
    },
    info: {
      telefono: agent.info?.telefono || null,
      direccion: agent.info?.direccion || null,
      horario: agent.info?.horario || null
    }
  };
}

function readAgents(configPath = process.env.AGENTS_CONFIG_PATH || DEFAULT_CONFIG_PATH) {
  const raw = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(raw);
  const agents = Array.isArray(config.agents) ? config.agents.map(normalizeAgent) : [];

  return {
    source: path.relative(path.resolve(__dirname, '..', '..', '..'), configPath),
    agents,
    count: agents.length,
    enabledCount: agents.filter(agent => agent.enabled).length,
    disabledCount: agents.filter(agent => !agent.enabled).length,
    loadedAt: new Date().toISOString()
  };
}

module.exports = {
  readAgents
};
