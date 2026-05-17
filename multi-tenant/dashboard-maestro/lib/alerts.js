function buildAlerts(agents) {
  const alerts = [];
  const now = new Date().toISOString();

  for (const agent of agents) {
    if (agent.health?.botApi?.status === 'down') {
      alerts.push(createAlert(agent, 'critical', 'bot-down', 'Bot API no responde', agent.health.botApi.error, now));
    }

    if (agent.health?.humanDashboard?.status === 'down') {
      alerts.push(createAlert(agent, 'critical', 'dashboard-down', 'Dashboard humano no responde', agent.health.humanDashboard.error, now));
    }
  }

  return alerts;
}

function createAlert(agent, severity, type, message, detail, timestamp) {
  return {
    id: `${agent.id}:${type}`,
    agentId: agent.id,
    agentName: agent.name,
    severity,
    type,
    message,
    detail: detail || null,
    firstSeen: timestamp,
    lastSeen: timestamp,
    muted: false,
    resolvedAt: null
  };
}

module.exports = {
  buildAlerts
};
