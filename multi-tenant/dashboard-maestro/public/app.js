const socket = io();

const agentsBody = document.getElementById('agentsBody');
const agentCounter = document.getElementById('agentCounter');
const lastRefresh = document.getElementById('lastRefresh');
const refreshButton = document.getElementById('refreshButton');
const actionsStatus = document.getElementById('actionsStatus');
const auditList = document.getElementById('auditList');

let actionsConfig = {
  enabled: false,
  environment: 'local'
};

function renderAgents(payload) {
  const agents = payload.agents || [];
  agentCounter.textContent = `${payload.count || 0} agentes`;
  lastRefresh.textContent = `Última actualización: ${new Date(payload.loadedAt).toLocaleString()} · Fuente: ${payload.source}`;
  renderGlobalStatus(payload.health);
  renderActionsStatus();

  if (agents.length === 0) {
    agentsBody.innerHTML = '<tr><td colspan="10">No hay agentes configurados.</td></tr>';
    return;
  }

  agentsBody.innerHTML = agents.map(agent => `
    <tr>
      <td><strong>${escapeHtml(agent.id)}</strong></td>
      <td>${escapeHtml(agent.clientId || 'actual')}</td>
      <td>
        <strong>${escapeHtml(agent.name)}</strong><br>
        <span>${escapeHtml(agent.info.telefono || 'Sin teléfono')}</span>
      </td>
      <td>
        <span class="badge ${agent.enabled ? 'enabled' : 'disabled'}">
          ${agent.enabled ? 'Sí' : 'No'}
        </span>
      </td>
      <td>${renderHealth(agent.health && agent.health.botApi)}</td>
      <td>${renderHealth(agent.health && agent.health.humanDashboard)}</td>
      <td>${agent.ports.api || '-'}</td>
      <td>${agent.ports.dashboard || '-'}</td>
      <td>
        <div class="paths">
          <span>data: ${escapeHtml(agent.paths.data || '-')}</span>
          <span>logs: ${escapeHtml(agent.paths.logs || '-')}</span>
          <span>catalog: ${escapeHtml(agent.paths.catalog || '-')}</span>
        </div>
      </td>
      <td>${renderAgentActions(agent)}</td>
    </tr>
  `).join('');
}

function renderError(message) {
  agentsBody.innerHTML = `<tr><td colspan="10" class="error">${escapeHtml(message)}</td></tr>`;
}

function renderGlobalStatus(health) {
  const globalStatus = document.getElementById('globalStatus');
  const statusDot = document.querySelector('.status-dot');
  if (!globalStatus || !health) return;

  const labels = {
    ok: 'Operativo',
    warning: 'Con advertencias',
    critical: 'Crítico'
  };

  globalStatus.textContent = `${labels[health.overall] || 'Desconocido'} · check ${new Date(health.checkedAt).toLocaleTimeString()}`;

  if (statusDot) {
    statusDot.className = `status-dot ${health.overall === 'ok' ? 'ok' : health.overall === 'critical' ? 'critical' : 'pending'}`;
  }
}

function renderHealth(check) {
  if (!check) return '<span class="health unknown">Sin check</span>';

  const label = {
    up: 'Up',
    degraded: 'Degraded',
    down: 'Down',
    unknown: 'Unknown'
  }[check.status] || check.status;

  const detail = check.error
    ? escapeHtml(check.error)
    : `${check.httpStatus} · ${check.responseTimeMs}ms`;
  const lastSuccess = check.lastSuccessfulCheck
    ? new Date(check.lastSuccessfulCheck).toLocaleTimeString()
    : 'sin éxito';

  return `
    <div class="health-cell">
      <span class="health ${escapeHtml(check.status)}">${label}</span>
      <small>${detail}</small>
      <small>último ok: ${escapeHtml(lastSuccess)}</small>
    </div>
  `;
}

function renderActionsStatus() {
  if (!actionsStatus) return;
  actionsStatus.textContent = actionsConfig.enabled
    ? `Controles PM2 habilitados · ${actionsConfig.environment}`
    : 'Controles PM2 deshabilitados';
}

function renderAgentActions(agent) {
  const disabled = actionsConfig.enabled ? '' : 'disabled';
  return `
    <div class="actions-cell">
      <button class="action-btn" data-agent-id="${escapeHtml(agent.id)}" data-target="bot" data-action="start" ${disabled}>Start bot</button>
      <button class="action-btn" data-agent-id="${escapeHtml(agent.id)}" data-target="bot" data-action="restart" ${disabled}>Restart bot</button>
      <button class="action-btn" data-agent-id="${escapeHtml(agent.id)}" data-target="bot" data-action="stop" ${disabled}>Stop bot</button>
      <button class="action-btn" data-agent-id="${escapeHtml(agent.id)}" data-target="dashboard" data-action="restart" ${disabled}>Restart dash</button>
    </div>
  `;
}

function renderAudit(events) {
  if (!auditList) return;
  if (!events || events.length === 0) {
    auditList.textContent = 'Sin eventos registrados.';
    return;
  }

  auditList.innerHTML = events.map(event => `
    <div class="audit-item">
      <strong>${escapeHtml(event.result)}</strong>
      <span>${escapeHtml(event.action || '-')} ${escapeHtml(event.target || '-')} · ${escapeHtml(event.agentId || '-')}</span>
      <small>${new Date(event.timestamp).toLocaleString()} · ${escapeHtml(event.error || event.message || '')}</small>
    </div>
  `).join('');
}

async function loadActionsConfig() {
  const response = await fetch('/api/actions/config');
  actionsConfig = await response.json();
  renderActionsStatus();
}

async function loadAudit() {
  const response = await fetch('/api/audit-events?limit=10');
  const payload = await response.json();
  renderAudit(payload.events);
}

async function runAction(button) {
  const agentId = button.dataset.agentId;
  const target = button.dataset.target;
  const action = button.dataset.action;

  if (!window.confirm(`Confirmar ${action} ${target} para ${agentId}`)) return;

  button.disabled = true;
  try {
    const response = await fetch(`/api/agents/${encodeURIComponent(agentId)}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, action })
    });
    const payload = await response.json();
    if (!response.ok) {
      window.alert(payload.error || 'Acción rechazada');
    }
    await loadAudit();
  } catch (error) {
    window.alert(error.message);
  } finally {
    button.disabled = !actionsConfig.enabled;
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

refreshButton.addEventListener('click', () => {
  refreshButton.disabled = true;
  refreshButton.textContent = 'Actualizando...';
  refreshAgents();

  setTimeout(() => {
    refreshButton.disabled = false;
    refreshButton.textContent = 'Actualizar ahora';
  }, 500);
});

agentsBody.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  runAction(button);
});

socket.on('agents:update', renderAgents);
socket.on('agents:error', error => renderError(error.message || 'Error cargando agentes'));

function refreshAgents() {
  return fetch('/api/agents')
  .then(response => response.json())
  .then(payload => {
    if (payload.error) {
      renderError(payload.message || payload.error);
      return;
    }
    renderAgents(payload);
  })
  .catch(error => renderError(error.message));
}

refreshAgents();

loadActionsConfig().catch(error => {
  if (actionsStatus) actionsStatus.textContent = error.message;
});
loadAudit().catch(error => {
  if (auditList) auditList.textContent = error.message;
});
