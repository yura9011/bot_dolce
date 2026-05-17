const mutedAgents = new Map();

function getMaintenanceMutes() {
  return Array.from(mutedAgents.entries()).map(([agentId, data]) => ({
    agentId,
    ...data
  }));
}

function isAgentMuted(agentId) {
  const data = mutedAgents.get(agentId);
  return Boolean(data && (!data.until || Date.now() < data.until));
}

function setAgentMute(agentId, muted, options = {}) {
  if (!muted) {
    mutedAgents.delete(agentId);
    return { agentId, muted: false };
  }

  const entry = {
    muted: true,
    reason: options.reason || 'maintenance',
    since: new Date().toISOString(),
    until: options.until || null
  };
  mutedAgents.set(agentId, entry);

  return { agentId, ...entry };
}

module.exports = {
  getMaintenanceMutes,
  isAgentMuted,
  setAgentMute
};
