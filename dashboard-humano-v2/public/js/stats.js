let cachedStats = null;

async function loadStats() {
  const panel = document.getElementById('statsPanel');
  panel.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><span>Calculando estadísticas...</span></div>';

  try {
    const response = await fetch('/api/chats', { credentials: 'include' });
    if (!response.ok) {
      panel.innerHTML = '<p class="no-chats">Error al obtener datos</p>';
      return;
    }

    const chats = await response.json();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalToday = chats.filter(c => new Date(c.timestamp) >= today).length;
    const waiting = chats.filter(c => c.estado === 'waiting_human').length;
    const total = chats.length;
    const botActive = total - waiting;

    let avgResponseSeconds = null;
    const recentChats = chats.slice(0, 8);
    let totalTime = 0;
    let count = 0;

    for (const chat of recentChats) {
      try {
        const msgRes = await fetch(`/api/chats/${chat.userId}/messages`, { credentials: 'include' });
        if (!msgRes.ok) continue;
        const messages = await msgRes.json();
        for (let i = 0; i < messages.length - 1; i++) {
          if (messages[i].role === 'user' && messages[i + 1].role !== 'user') {
            const diff = new Date(messages[i + 1].timestamp) - new Date(messages[i].timestamp);
            if (diff > 0 && diff < 7200000) {
              totalTime += diff;
              count++;
            }
          }
        }
      } catch (e) {}
    }

    if (count > 0) {
      avgResponseSeconds = Math.round(totalTime / count / 1000);
    }

    renderStats({ total, totalToday, waiting, botActive, avgResponseSeconds });
  } catch (error) {
    panel.innerHTML = '<p class="no-chats">Error de conexión</p>';
  }
}

function formatTime(seconds) {
  if (seconds === null || seconds === undefined) return 'N/A';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function renderStats(s) {
  const panel = document.getElementById('statsPanel');
  panel.innerHTML = `
    <div class="stats-header">
      <h2>📊 Estadísticas del Día</h2>
      <p class="stats-date">${new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
    <div class="stats-grid">
      <div class="stat-card stat-total">
        <div class="stat-value">${s.totalToday}</div>
        <div class="stat-label">Conversaciones hoy</div>
      </div>
      <div class="stat-card stat-waiting">
        <div class="stat-value">${s.waiting}</div>
        <div class="stat-label">Esperando humano</div>
      </div>
      <div class="stat-card stat-active">
        <div class="stat-value">${s.botActive}</div>
        <div class="stat-label">Bot activo</div>
      </div>
      <div class="stat-card stat-response">
        <div class="stat-value">${formatTime(s.avgResponseSeconds)}</div>
        <div class="stat-label">Tiempo resp. promedio</div>
      </div>
    </div>
    <div class="stats-detail">
      <h3>Detalle</h3>
      <div class="stats-detail-row">
        <span>Total conversaciones</span>
        <strong>${s.total}</strong>
      </div>
      <div class="stats-detail-row">
        <span>Esperando atención humana</span>
        <strong class="stat-badge-waiting">${s.waiting}</strong>
      </div>
      <div class="stats-detail-row">
        <span>Manejadas por el bot</span>
        <strong>${s.botActive}</strong>
      </div>
    </div>
  `;
}
