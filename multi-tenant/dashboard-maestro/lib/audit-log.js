const MAX_EVENTS = 200;
const events = [];

function recordAuditEvent(event) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    user: event.user || 'unknown',
    ip: event.ip || null,
    action: event.action,
    target: event.target,
    agentId: event.agentId || null,
    processName: event.processName || null,
    result: event.result,
    message: event.message || null,
    error: event.error || null
  };

  events.unshift(entry);
  if (events.length > MAX_EVENTS) {
    events.length = MAX_EVENTS;
  }

  return entry;
}

function listAuditEvents(limit = 50) {
  return events.slice(0, limit);
}

module.exports = {
  listAuditEvents,
  recordAuditEvent
};
