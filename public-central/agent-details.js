// ─── DETALLES DEL AGENTE - DOLCE PARTY ─────────────────────────

let agentId = null;
let agentData = null;
let refreshInterval = null;
let phoneAliases = {};

// ─── INICIALIZACIÓN ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Obtener el ID del agente de la URL (formato /agente/:id)
    const pathParts = window.location.pathname.split('/');
    agentId = pathParts[pathParts.length - 1];
    
    if (!agentId) {
        alert('Error: No se especificó el ID del agente');
        goBack();
        return;
    }
    
    // Cargar aliases de teléfonos
    fetch('/api/phone-aliases')
        .then(r => r.json())
        .then(data => {
            phoneAliases = data.aliases || {};
        })
        .catch(err => console.error('Error cargando aliases:', err));
    
    loadAgentData();
    
    // Auto-refresh cada 10 segundos
    refreshInterval = setInterval(() => {
        loadAgentData();
    }, 10000);
});

// ─── NAVEGACIÓN ──────────────────────────────────────────────────────

function goBack() {
    if (refreshInterval) clearInterval(refreshInterval);
    window.location.href = '/';
}

// ─── TOGGLE PANELS ──────────────────────────────────────────────────

function togglePanel(panelName) {
    const content = document.getElementById(panelName + 'Content');
    const icon = document.getElementById(panelName + 'Icon');
    
    if (!content || !icon) return;
    
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        icon.classList.add('expanded');
        icon.textContent = '▼';
        
        // Cargar datos si es necesario
        if (panelName === 'conversations') loadConversations();
        else if (panelName === 'logs') loadLogs();
        else if (panelName === 'security') loadSecurity();
        else if (panelName === 'resumen') loadResumenNumeros();
    } else {
        content.classList.add('collapsed');
        icon.classList.remove('expanded');
        icon.textContent = '▶';
    }
}

// ─── CARGA DE DATOS ──────────────────────────────────────────────────

async function loadAgentData() {
    try {
        // Cargar información del agente
        const agentsResponse = await fetch('/api/agents');
        const agents = await agentsResponse.json();
        agentData = agents.find(a => a.id === agentId);
        
        if (!agentData) {
            alert('Error: Agente no encontrado');
            goBack();
            return;
        }
        
        // Cargar estado real del agente
        try {
            const statusResponse = await fetch(`/api/agents/${agentId}/status`);
            const status = await statusResponse.json();
            agentData.isRunning = status.isRunning || false;
        } catch (err) {
            console.error('Error cargando estado:', err);
            agentData.isRunning = false;
        }
        
        updateAgentInfo();
        
        // Cargar todos los datos en paralelo
        await Promise.all([
            loadStats(),
            loadConversations(),
            loadPausedUsers(),
            loadLogs(),
            loadSecurity(),
            loadResumenNumeros()
        ]);
        
        updateLastUpdate();
        
    } catch (error) {
        console.error('Error cargando datos del agente:', error);
    }
}

function updateAgentInfo() {
    const container = document.getElementById('agentInfo');
    
    let statusClass = 'disabled';
    let statusText = 'Deshabilitado';
    
    if (agentData.enabled) {
        statusClass = agentData.isRunning ? 'running' : 'stopped';
        statusText = agentData.isRunning ? 'Corriendo' : 'Detenido';
    }
    
    container.innerHTML = `
        <div class="agent-title">🎈 ${agentData.name}</div>
        <div class="agent-info-grid">
            <div class="info-item">
                <span class="info-label">ID:</span>
                <span class="info-value">${agentData.id}</span>
            </div>
            <div class="info-item">
                <span class="info-label">📍 Dirección:</span>
                <span class="info-value">${agentData.info.direccion}</span>
            </div>
            <div class="info-item">
                <span class="info-label">📞 Teléfono:</span>
                <span class="info-value">${agentData.info.telefono}</span>
            </div>
            <div class="info-item">
                <span class="info-label">🕐 Horario:</span>
                <span class="info-value">${agentData.info.horario}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Estado:</span>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
        </div>
    `;
}

// ─── ESTADÍSTICAS ─────────────────────────────────────────────────────

async function loadStats() {
    try {
        const response = await fetch(`/api/agents/${agentId}/stats`);
        const stats = await response.json();
        
        updateStatsDisplay(stats);
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

function updateStatsDisplay(stats) {
    if (!stats) {
        console.log('No hay estadísticas disponibles');
        return;
    }
    
    // Obtener el dia mas reciente con datos si hoy no tiene
    const fechasMensajes = stats.mensajes ? Object.keys(stats.mensajes).sort().reverse() : [];
    const today = new Date().toISOString().split('T')[0];
    const fechaReciente = fechasMensajes.length > 0 ? fechasMensajes[0] : null;
    
    let mensajesRecibidos = 0;
    let mensajesEnviados = 0;
    let handoffsHoy = 0;
    let hijackingHoy = 0;
    let busquedasHoy = 0;
    
    // Formato simple (lo que devuelve el agente actualmente)
    if (stats.mensajesHoy !== undefined) {
        mensajesRecibidos = stats.mensajesHoy || 0;
        handoffsHoy = stats.handoffs || 0;
        hijackingHoy = stats.hijackingHoy || 0;
        busquedasHoy = stats.busquedasHoy || 0;
    }
    // Formato detallado (con fechas) - NUEVO FORMATO
    else if (stats.mensajes) {
        const todayStats = stats.mensajes[today] || { recibidos: 0, enviados: 0 };
        const recentStats = fechaReciente ? stats.mensajes[fechaReciente] : { recibidos: 0, enviados: 0 };
        
        // Usar stats de hoy si hay, sino las mas recientes
        const displayStats = (todayStats.recibidos > 0 || todayStats.enviados > 0) ? todayStats : recentStats;
        const displayDate = (todayStats.recibidos > 0 || todayStats.enviados > 0) ? today : fechaReciente;
        
        mensajesRecibidos = displayStats.recibidos || 0;
        mensajesEnviados = displayStats.enviados || 0;
        handoffsHoy = stats.handoffs?.[displayDate]?.total || stats.handoffs?.[displayDate] || 0;
        hijackingHoy = stats.hijacking?.[displayDate]?.total || stats.hijacking?.[displayDate] || 0;
        busquedasHoy = stats.busquedas?.[displayDate]?.total || stats.busquedas?.[displayDate] || 0;
    }
    
    // Animar números
    animateNumber('mensajesRecibidos', mensajesRecibidos);
    animateNumber('mensajesEnviados', mensajesEnviados);
    animateNumber('handoffsHoy', handoffsHoy);
    animateNumber('hijackingHoy', hijackingHoy);
    animateNumber('busquedasHoy', busquedasHoy);
    
    // Mostrar el grid
    document.getElementById('statsGrid').style.display = 'grid';
}

function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
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

// ─── CONVERSACIONES (HISTORIAL COMPLETO) ─────────────────────────

async function loadConversations() {
    try {
        const response = await fetch(`/api/agents/${agentId}/conversations?limit=0`);
        const data = await response.json();
        
        updateConversations(data.conversaciones || data);
    } catch (error) {
        console.error('Error cargando conversaciones:', error);
    }
}

function updateConversations(conversations) {
    const container = document.getElementById('conversationsList');
    
    if (!conversations || conversations.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay conversaciones</div>';
        return;
    }
    
    container.innerHTML = conversations.map(conv => {
        const mensajesMostrados = conv.messages?.length || 0;
        const totalMensajes = conv.totalMensajes || mensajesMostrados;
        const numeroFormateado = conv.numero ? formatNumber(conv.numero) : formatUserId(conv.userId);
        
        return `
        <div class="conversation-item">
            <div class="conversation-header">
                <span class="conversation-user">👤 ${numeroFormateado}</span>
                <span class="conversation-count">${totalMensajes} mensajes en total</span>
                <span class="conversation-time">🕐 Último: ${formatTime(conv.lastMessage)}</span>
            </div>
            <div class="messages">
                ${(conv.messages || []).map(msg => `
                    <div class="message ${msg.type}">
                        <span class="msg-time">${formatTime(msg.timestamp)}</span>
                        ${msg.type === 'user' ? '👤' : '🤖'}: ${msg.text}
                    </div>
                `).join('')}
            </div>
        </div>
    `}).join('');
}

// ─── USUARIOS PAUSADOS ─────────────────────────────────────────────

async function loadPausedUsers() {
    try {
        const response = await fetch(`/api/agents/${agentId}/paused`);
        const paused = await response.json();
        
        updatePausedUsers(paused);
    } catch (error) {
        console.error('Error cargando usuarios pausados:', error);
    }
}

function updatePausedUsers(paused) {
    const container = document.getElementById('pausedUsersList');
    
    if (!paused || paused.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay usuarios pausados</div>';
        return;
    }
    
    container.innerHTML = paused.map(user => `
        <div class="paused-user-item">
            <div class="paused-user-info">
                <div class="paused-user-id">📱 ${formatUserId(user.userId)}</div>
            </div>
            <div>
                <button class="btn btn-small btn-success" onclick="resumeUser('${user.userId}')">
                    ▶️ Reanudar
                </button>
            </div>
        </div>
    `).join('');
}

// ─── LOGS ─────────────────────────────────────────────────────────

async function loadLogs() {
    try {
        const response = await fetch(`/api/agents/${agentId}/logs?lines=50`);
        const logs = await response.json();
        
        updateLogs(logs);
    } catch (error) {
        console.error('Error cargando logs:', error);
    }
}

function updateLogs(logs) {
    const container = document.getElementById('logsList');
    
    if (!logs || logs.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay logs disponibles</div>';
        return;
    }
    
    container.innerHTML = logs.map(log => `
        <div class="log-item">
            <span class="log-timestamp">${log.timestamp}</span>
            <div>${log.message}</div>
        </div>
    `).join('');
}

// ─── SEGURIDAD ───────────────────────────────────────────────────

async function loadSecurity() {
    try {
        const response = await fetch(`/api/agents/${agentId}/security?lines=30`);
        const security = await response.json();
        
        updateSecurity(security);
    } catch (error) {
        console.error('Error cargando seguridad:', error);
    }
}

function updateSecurity(security) {
    const container = document.getElementById('securityList');
    
    if (!security || security.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay intentos de seguridad</div>';
        return;
    }
    
    container.innerHTML = security.map(item => `
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

// ─── RESUMEN POR NÚMERO ──────────────────────────────────────────

async function loadResumenNumeros() {
    try {
        const response = await fetch(`/api/agents/${agentId}/conversations?limit=0`);
        const data = await response.json();
        
        updateResumenNumeros(data.resumenPorNumero || []);
    } catch (error) {
        console.error('Error cargando resumen:', error);
    }
}

function updateResumenNumeros(resumen) {
    const container = document.getElementById('resumenNumeros');
    
    if (!resumen || resumen.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay datos</div>';
        return;
    }
    
    container.innerHTML = resumen.map(item => `
        <div class="resumen-numero-item">
            <span class="numero">📱 ${formatNumber(item.numero)}</span>
            <span class="mensaje-count">${item.totalMensajes} mensajes</span>
            <span class="ultimo">${formatTime(item.ultimoMensaje)}</span>
        </div>
    `).join('');
}

// ─── CONTROLES ─────────────────────────────────────────────────────

async function pauseGlobal() {
    try {
        const response = await fetch(`/api/agents/${agentId}/pause-global`, { 
            method: "POST" 
        });
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ Bot ${agentData.name} pausado globalmente`);
            loadAgentData();
        } else {
            alert("Error: " + (result.error || result.message));
        }
    } catch (error) {
        alert("Error de conexión: " + error.message);
    }
}

async function resumeGlobal() {
    try {
        const response = await fetch(`/api/agents/${agentId}/resume-global`, { 
            method: "POST" 
        });
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ Bot ${agentData.name} reanudado`);
            loadAgentData();
        } else {
            alert("Error: " + (result.error || result.message));
        }
    } catch (error) {
        alert("Error de conexión: " + error.message);
    }
}

async function resumeUser(userId) {
    try {
        const response = await fetch(`/api/agents/${agentId}/resume/${userId}`, { 
            method: "POST" 
        });
        const result = await response.json();
        
        if (result.success) {
            loadPausedUsers();
        } else {
            alert("Error: " + (result.error || result.message));
        }
    } catch (error) {
        alert("Error de conexión: " + error.message);
    }
}

// ─── FUNCIONES AUXILIARES ─────────────────────────────────────────

function formatUserId(userId) {
    const number = userId.replace(/@.*/, '').replace(/^54/, '+54 ');
    const alias = phoneAliases[userId.replace(/@.*/, '')];
    return alias ? `${number} (${alias})` : number;
}

function formatNumber(numero) {
    const alias = phoneAliases[numero];
    return alias ? `${numero} (${alias})` : numero;
}

function formatTime(timestamp) {
    if (!timestamp) return 'Desconocido';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 60000);
    
    if (diffMinutes < 1) return 'Ahora';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
    return date.toLocaleDateString('es-AR');
}

function updateLastUpdate() {
    const lastUpdate = document.getElementById('lastUpdate');
    if (lastUpdate) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-AR', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        lastUpdate.textContent = `Última actualización: ${timeString}`;
    }
}

// ─── LIMPIEZA ──────────────────────────────────────────────────────

window.addEventListener('beforeunload', () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});

// ─── CONSOLE INFO ─────────────────────────────────────────────────

console.log(`
🎈 ===== DETALLES DEL AGENTE - DOLCE PARTY =====
📊 Página de detalles iniciada
🔄 Actualizaciones automáticas cada 10s
===============================================
`);
