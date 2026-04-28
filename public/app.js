// ─── VARIABLES GLOBALES ───────────────────────────────────────────────────────

let socket;
let isConnected = false;

// DOM Elements
const botStatus = document.getElementById('botStatus');
const lastUpdate = document.getElementById('lastUpdate');
const mensajesHoy = document.getElementById('mensajesHoy');
const handoffs = document.getElementById('handoffs');
const usuariosActivos = document.getElementById('usuariosActivos');
const usuariosPausados = document.getElementById('usuariosPausados');
const conversationsList = document.getElementById('conversationsList');
const pausedUsersList = document.getElementById('pausedUsersList');
const logsList = document.getElementById('logsList');
const securityList = document.getElementById('securityList');
const controlModal = document.getElementById('controlModal');

// ─── INICIALIZACIÓN ───────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    initializeSocket();
    loadInitialData();
    
    // Auto-refresh cada 30 segundos
    setInterval(refreshAllData, 30000);
    
    // Cargar estadísticas detalladas cada 5 minutos
    setInterval(loadDetailedStats, 300000);
});

// ─── WEBSOCKET CONNECTION ─────────────────────────────────────────────────────

function initializeSocket() {
    socket = io();
    
    socket.on('connect', () => {
        console.log('✅ Conectado al dashboard');
        isConnected = true;
        updateConnectionStatus(true);
    });
    
    socket.on('disconnect', () => {
        console.log('❌ Desconectado del dashboard');
        isConnected = false;
        updateConnectionStatus(false);
    });
    
    socket.on('initial_data', (data) => {
        console.log('📊 Datos iniciales recibidos:', data);
        updateStats(data.stats);
        updateConversations(data.conversations);
        updatePausedUsers(data.paused);
        updateSecurity(data.security);
        updateLastUpdate();
    });
    
    socket.on('stats_update', (stats) => {
        updateStats(stats);
        updateLastUpdate();
    });
    
    socket.on('conversations_update', (conversations) => {
        updateConversations(conversations);
    });
    
    socket.on('paused_update', (paused) => {
        updatePausedUsers(paused);
    });
    
    socket.on('new_message', (message) => {
        console.log('💬 Nuevo mensaje:', message);
        // Actualizar conversaciones en tiempo real
        refreshConversations();
    });
    
    socket.on('user_paused', (user) => {
        console.log('⏸️ Usuario pausado:', user);
        refreshPausedUsers();
    });
    
    socket.on('user_resumed', (userId) => {
        console.log('▶️ Usuario reanudado:', userId);
        refreshPausedUsers();
    });
    
    socket.on('security_alert', (alert) => {
        console.log('🚨 Alerta de seguridad:', alert);
        refreshSecurity();
    });
}

// ─── UPDATE FUNCTIONS ─────────────────────────────────────────────────────────

function updateConnectionStatus(connected) {
    if (connected) {
        botStatus.className = 'status-indicator active';
        botStatus.innerHTML = '<span class="status-dot"></span><span class="status-text">✅ Conectado</span>';
    } else {
        botStatus.className = 'status-indicator paused';
        botStatus.innerHTML = '<span class="status-dot"></span><span class="status-text">❌ Desconectado</span>';
    }
}

function updateLastUpdate() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    lastUpdate.textContent = `Última actualización: ${timeString}`;
}

function updateStats(stats) {
    if (!stats) return;
    
    // Animar números principales
    animateNumber(mensajesHoy, stats.mensajesHoy || 0);
    animateNumber(handoffs, stats.handoffs || 0);
    animateNumber(usuariosActivos, stats.usuariosActivos || 0);
    animateNumber(usuariosPausados, stats.usuariosPausados || 0);
    
    // Actualizar status del bot
    if (stats.botActivo) {
        botStatus.className = 'status-indicator active';
        botStatus.innerHTML = '<span class="status-dot"></span><span class="status-text">✅ Bot Activo</span>';
    } else {
        botStatus.className = 'status-indicator paused';
        botStatus.innerHTML = '<span class="status-dot"></span><span class="status-text">⏸️ Bot Pausado</span>';
    }
    
    // Actualizar estadísticas adicionales si existen
    if (stats.busquedasHoy !== undefined) {
        updateAdditionalStats(stats);
    }
}

function updateAdditionalStats(stats) {
    // Buscar o crear elementos para estadísticas adicionales
    let additionalStatsContainer = document.getElementById('additionalStats');
    if (!additionalStatsContainer) {
        // Crear contenedor si no existe
        const statsGrid = document.querySelector('.stats-grid');
        additionalStatsContainer = document.createElement('div');
        additionalStatsContainer.id = 'additionalStats';
        additionalStatsContainer.className = 'additional-stats';
        additionalStatsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-number" id="busquedasHoy">0</div>
                <div class="stat-label">🔍 Búsquedas Hoy</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="hijackingHoy">0</div>
                <div class="stat-label">🚨 Ataques Bloqueados</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="totalUsuarios">0</div>
                <div class="stat-label">👥 Total Usuarios</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="diasActivo">0</div>
                <div class="stat-label">📅 Días Activo</div>
            </div>
        `;
        statsGrid.appendChild(additionalStatsContainer);
    }
    
    // Actualizar valores
    animateNumber(document.getElementById('busquedasHoy'), stats.busquedasHoy || 0);
    animateNumber(document.getElementById('hijackingHoy'), stats.hijackingHoy || 0);
    animateNumber(document.getElementById('totalUsuarios'), stats.totalUsuarios || 0);
    animateNumber(document.getElementById('diasActivo'), stats.diasActivo || 0);
}

function updateConversations(conversations) {
    if (!conversations || conversations.length === 0) {
        conversationsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💬</div>
                <div>No hay conversaciones recientes</div>
            </div>
        `;
        return;
    }
    
    conversationsList.innerHTML = conversations.map(conv => `
        <div class="conversation-item">
            <div class="conversation-header">
                <span class="conversation-user">👤 ${formatUserId(conv.userId)}</span>
                <span class="conversation-time">🕐 ${formatTime(conv.lastMessage)}</span>
            </div>
            <div class="messages">
                ${conv.messages.map(msg => `
                    <div class="message ${msg.type}">
                        ${msg.type === 'user' ? '👤' : '🤖'}: ${msg.text}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function updatePausedUsers(paused) {
    if (!paused || paused.length === 0) {
        pausedUsersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <div>No hay usuarios pausados</div>
            </div>
        `;
        return;
    }
    
    pausedUsersList.innerHTML = paused.map(user => `
        <div class="paused-user-item">
            <div class="paused-user-info">
                <div class="paused-user-id">📱 ${formatUserId(user.userId)}</div>
                <div class="paused-user-time">
                    ⏸️ Pausado hace: ${user.minutosTranscurridos} min<br>
                    🔄 Auto-reactiva en: ${Math.max(0, Math.ceil(user.autoResumeIn / 60000))} min
                </div>
            </div>
            <div>
                <button class="btn btn-small btn-success" onclick="resumeUser('${user.userId}')">
                    ▶️ Reanudar
                </button>
            </div>
        </div>
    `).join('');
}

function updateLogs(logs) {
    if (!logs || logs.length === 0) {
        logsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div>No hay logs disponibles</div>
            </div>
        `;
        return;
    }
    
    logsList.innerHTML = logs.map(log => `
        <div class="log-item">
            <span class="log-timestamp">${log.timestamp}</span>
            <div>${log.message}</div>
        </div>
    `).join('');
    
    // Auto-scroll al final
    logsList.scrollTop = logsList.scrollHeight;
}

function updateSecurity(security) {
    if (!security || security.length === 0) {
        securityList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔒</div>
                <div>No hay intentos de hijacking</div>
            </div>
        `;
        return;
    }
    
    securityList.innerHTML = security.map(item => `
        <div class="security-item">
            <div class="security-header">
                <span class="security-type">${item.tipo}</span>
                <span class="security-time">${item.timestamp}</span>
            </div>
            <div class="security-user">👤 ${item.userId}</div>
            <div class="security-message">${item.mensaje}</div>
        </div>
    `).join('');
}

// ─── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

function formatUserId(userId) {
    return userId.replace(/@.*/, '').replace(/^54/, '+54 ');
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 60000);
    
    if (diffMinutes < 1) return 'Ahora';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return date.toLocaleDateString('es-AR');
}

function animateNumber(element, targetValue) {
    const currentValue = parseInt(element.textContent) || 0;
    const increment = targetValue > currentValue ? 1 : -1;
    const duration = 500;
    const steps = Math.abs(targetValue - currentValue);
    const stepDuration = steps > 0 ? duration / steps : 0;
    
    if (steps === 0) return;
    
    let current = currentValue;
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current;
        
        if (current === targetValue) {
            clearInterval(timer);
        }
    }, stepDuration);
}

// ─── API FUNCTIONS ────────────────────────────────────────────────────────────

async function loadInitialData() {
    try {
        const [stats, conversations, paused, logs, security] = await Promise.all([
            fetch('/api/stats').then(r => r.json()),
            fetch('/api/conversations').then(r => r.json()),
            fetch('/api/paused').then(r => r.json()),
            fetch('/api/logs').then(r => r.json()),
            fetch('/api/security').then(r => r.json())
        ]);
        
        updateStats(stats);
        updateConversations(conversations);
        updatePausedUsers(paused);
        updateLogs(logs);
        updateSecurity(security);
        updateLastUpdate();
        
    } catch (error) {
        console.error('❌ Error cargando datos iniciales:', error);
    }
}

async function refreshAllData() {
    if (!isConnected) return;
    
    try {
        const stats = await fetch('/api/stats').then(r => r.json());
        updateStats(stats);
        updateLastUpdate();
    } catch (error) {
        console.error('❌ Error actualizando datos:', error);
    }
}

async function refreshConversations() {
    try {
        const conversations = await fetch('/api/conversations').then(r => r.json());
        updateConversations(conversations);
    } catch (error) {
        console.error('❌ Error actualizando conversaciones:', error);
    }
}

async function refreshPausedUsers() {
    try {
        const paused = await fetch('/api/paused').then(r => r.json());
        updatePausedUsers(paused);
    } catch (error) {
        console.error('❌ Error actualizando usuarios pausados:', error);
    }
}

async function refreshLogs() {
    try {
        const logs = await fetch('/api/logs').then(r => r.json());
        updateLogs(logs);
    } catch (error) {
        console.error('❌ Error actualizando logs:', error);
    }
}

async function refreshSecurity() {
    try {
        const security = await fetch('/api/security').then(r => r.json());
        updateSecurity(security);
    } catch (error) {
        console.error('❌ Error actualizando seguridad:', error);
    }
}

// ─── MODAL FUNCTIONS ──────────────────────────────────────────────────────────

function showControlInfo() {
    controlModal.style.display = 'block';
}

function closeModal() {
    controlModal.style.display = 'none';
}

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
    if (event.target === controlModal) {
        closeModal();
    }
}

// ─── KEYBOARD SHORTCUTS ───────────────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
    // ESC para cerrar modal
    if (e.key === 'Escape') {
        closeModal();
    }
    
    // R para refresh
    if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        refreshAllData();
    }
});

// ─── ERROR HANDLING ───────────────────────────────────────────────────────────

window.addEventListener('error', (e) => {
    console.error('❌ Error en el dashboard:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Promesa rechazada:', e.reason);
});

// ─── CONTROL FUNCTIONS ────────────────────────────────────────────────────────

async function pauseUser(userId) {
    try {
        const response = await fetch(`/api/pause/${userId}`, { method: "POST" });
        const result = await response.json();
        if (result.success) {
            refreshPausedUsers();
            refreshStats();
        } else {
            alert("Error: " + (result.error || result.message));
        }
    } catch (error) {
        alert("Error de conexión: " + error.message);
    }
}

async function resumeUser(userId) {
    try {
        const response = await fetch(`/api/resume/${userId}`, { method: "POST" });
        const result = await response.json();
        if (result.success) {
            refreshPausedUsers();
            refreshStats();
        } else {
            alert("Error: " + (result.error || result.message));
        }
    } catch (error) {
        alert("Error de conexión: " + error.message);
    }
}

async function pauseGlobal() {
    try {
        const response = await fetch("/api/pause-global", { method: "POST" });
        const result = await response.json();
        if (result.success) {
            refreshStats();
            alert("✅ Bot pausado globalmente");
        }
    } catch (error) {
        alert("Error de conexión: " + error.message);
    }
}

async function resumeGlobal() {
    try {
        const response = await fetch("/api/resume-global", { method: "POST" });
        const result = await response.json();
        if (result.success) {
            refreshStats();
            alert("✅ Bot reanudado");
        }
    } catch (error) {
        alert("Error de conexión: " + error.message);
    }
}

async function refreshStats() {
    try {
        const stats = await fetch("/api/stats").then(r => r.json());
        updateStats(stats);
        
        // Cargar estadísticas detalladas
        loadDetailedStats();
    } catch (error) {
        console.error("Error refreshing stats:", error);
    }
}

async function loadDetailedStats() {
    try {
        const [detailed, searches, history] = await Promise.all([
            fetch("/api/stats/detailed").then(r => r.json()),
            fetch("/api/stats/searches?days=7").then(r => r.json()),
            fetch("/api/stats/history/7").then(r => r.json())
        ]);
        
        updateDetailedStats(detailed, searches, history);
    } catch (error) {
        console.error("Error loading detailed stats:", error);
    }
}

function updateDetailedStats(detailed, searches, history) {
    // Crear o actualizar sección de estadísticas detalladas
    let detailedContainer = document.getElementById('detailedStatsContainer');
    if (!detailedContainer) {
        detailedContainer = document.createElement('div');
        detailedContainer.id = 'detailedStatsContainer';
        detailedContainer.className = 'detailed-stats-container';
        
        // Insertar después de las estadísticas principales
        const mainStats = document.querySelector('.stats-section');
        mainStats.parentNode.insertBefore(detailedContainer, mainStats.nextSibling);
    }
    
    detailedContainer.innerHTML = `
        <div class="panel">
            <div class="panel-header">
                <h2>📊 Estadísticas Detalladas</h2>
            </div>
            <div class="panel-content">
                <div class="detailed-stats-grid">
                    <div class="stat-group">
                        <h3>📈 Tendencias (7 días)</h3>
                        <div class="trend-stats">
                            <div class="trend-item">
                                <span>Promedio mensajes/día:</span>
                                <strong>${detailed.semana.promedioDiario.mensajes}</strong>
                            </div>
                            <div class="trend-item">
                                <span>Promedio handoffs/día:</span>
                                <strong>${detailed.semana.promedioDiario.handoffs}</strong>
                            </div>
                            <div class="trend-item">
                                <span>Promedio búsquedas/día:</span>
                                <strong>${detailed.semana.promedioDiario.busquedas}</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-group">
                        <h3>🔍 Consultas Frecuentes</h3>
                        <div class="searches-list">
                            ${searches.slice(0, 5).map(search => `
                                <div class="search-item">
                                    <span class="search-query">"${search.consulta}"</span>
                                    <span class="search-count">${search.frecuencia}x</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="stat-group">
                        <h3>📅 Actividad Semanal</h3>
                        <div class="activity-chart">
                            ${history.map(day => {
                                const fecha = new Date(day.fecha);
                                const diaSemana = fecha.toLocaleDateString('es-AR', { weekday: 'short' });
                                const altura = Math.max(5, (day.mensajes.recibidos / Math.max(...history.map(d => d.mensajes.recibidos))) * 100);
                                return `
                                    <div class="activity-bar" style="height: ${altura}%" title="${day.mensajes.recibidos} mensajes">
                                        <div class="bar-label">${diaSemana}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ─── CONSOLE INFO ─────────────────────────────────────────────────────────────

console.log(`
🎈 ===== DOLCE PARTY DASHBOARD =====
📊 Dashboard iniciado correctamente
🔄 Actualizaciones automáticas cada 30s
⌨️  Atajos de teclado:
   • ESC: Cerrar modal
   • Ctrl+R: Actualizar datos
=====================================
`);