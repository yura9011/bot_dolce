const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const DEFAULT_CONFIG_PATH = path.resolve(__dirname, '..', '..', '..', 'config', 'agents.json');
const DEFAULT_CLIENTS_DIR = path.resolve(__dirname, '..', '..', 'clients');

function normalizeAgent(agent, source) {
  return {
    id: agent.id,
    clientId: agent.clientId || source.clientId || null,
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
    },
    source
  };
}

function readAgents(configPath = process.env.AGENTS_CONFIG_PATH || DEFAULT_CONFIG_PATH) {
  const rootSource = {
    type: 'root-config',
    path: relativeToRepo(configPath),
    clientId: null
  };
  const rootAgents = readAgentsFromFile(configPath, rootSource);
  const clientSources = readClientSources(process.env.CLIENTS_DIR || DEFAULT_CLIENTS_DIR);
  const agents = [...rootAgents, ...clientSources.flatMap(source => readAgentsFromFile(source.fullPath, source))];

  return {
    source: relativeToRepo(configPath),
    sources: [
      rootSource,
      ...clientSources.map(({ fullPath, ...source }) => source)
    ],
    agents,
    count: agents.length,
    enabledCount: agents.filter(agent => agent.enabled).length,
    disabledCount: agents.filter(agent => !agent.enabled).length,
    loadedAt: new Date().toISOString()
  };
}

function readAgentsFromFile(configPath, source) {
  const raw = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(raw);
  return Array.isArray(config.agents)
    ? config.agents.map(agent => normalizeAgent(agent, withoutFullPath(source)))
    : [];
}

function readClientSources(clientsDir) {
  if (!fs.existsSync(clientsDir)) return [];

  return fs.readdirSync(clientsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => {
      const fullPath = path.join(clientsDir, entry.name, 'agents.json');
      return {
        type: 'client-config',
        path: relativeToRepo(fullPath),
        fullPath,
        clientId: entry.name
      };
    })
    .filter(source => fs.existsSync(source.fullPath));
}

function withoutFullPath(source) {
  const { fullPath, ...publicSource } = source;
  return publicSource;
}

function relativeToRepo(filePath) {
  return path.relative(REPO_ROOT, filePath);
}

module.exports = {
  readAgents
};
