const socket = io();

const agentsBody = document.getElementById('agentsBody');
const agentCounter = document.getElementById('agentCounter');
const lastRefresh = document.getElementById('lastRefresh');
const refreshButton = document.getElementById('refreshButton');

function renderAgents(payload) {
  const agents = payload.agents || [];
  agentCounter.textContent = `${payload.count || 0} agentes`;
  lastRefresh.textContent = `Última actualización: ${new Date(payload.loadedAt).toLocaleString()} · Fuente: ${payload.source}`;
  renderGlobalStatus(payload.health);

  if (agents.length === 0) {
    agentsBody.innerHTML = '<tr><td colspan="9">No hay agentes configurados.</td></tr>';
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
    </tr>
  `).join('');
}

function renderError(message) {
  agentsBody.innerHTML = `<tr><td colspan="9" class="error">${escapeHtml(message)}</td></tr>`;
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
  socket.emit('agents:refresh');

  setTimeout(() => {
    refreshButton.disabled = false;
    refreshButton.textContent = 'Actualizar ahora';
  }, 500);
});

socket.on('agents:update', renderAgents);
socket.on('agents:error', error => renderError(error.message || 'Error cargando agentes'));

fetch('/api/agents')
  .then(response => response.json())
  .then(payload => {
    if (payload.error) {
      renderError(payload.message || payload.error);
      return;
    }
    renderAgents(payload);
  })
  .catch(error => renderError(error.message));
