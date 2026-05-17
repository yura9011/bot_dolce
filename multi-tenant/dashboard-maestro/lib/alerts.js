function buildAlerts(agents, options = {}) {
  const alerts = [];
  const now = new Date().toISOString();
  const isMuted = options.isMuted || (() => false);

  for (const agent of agents) {
    if (!agent.enabled) continue;

    const muted = isMuted(agent.id);

    if (agent.health?.botApi?.status === 'down') {
      alerts.push(createAlert(agent, 'critical', 'bot-down', 'Bot API no responde', agent.health.botApi.error, now, muted));
    }

    if (agent.health?.humanDashboard?.status === 'down') {
      alerts.push(createAlert(agent, 'critical', 'dashboard-down', 'Dashboard humano no responde', agent.health.humanDashboard.error, now, muted));
    }

    if (['disconnected', 'auth_failure'].includes(agent.health?.whatsapp?.status)) {
      alerts.push(createAlert(agent, 'critical', 'whatsapp-disconnected', 'WhatsApp desconectado', agent.health.whatsapp.detail, now, muted));
    }

    if ((agent.handoffs?.criticalCount || 0) > 0) {
      alerts.push(createAlert(
        agent,
        'critical',
        'handoff-waiting',
        'Handoff esperando más de 10 minutos',
        `${agent.handoffs.criticalCount} handoff(s) crítico(s)`,
        now,
        muted
      ));
    }
  }

  return alerts;
}

function createAlert(agent, severity, type, message, detail, timestamp, muted = false) {
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
    muted,
    resolvedAt: null
  };
}

module.exports = {
  buildAlerts
};
