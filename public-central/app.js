// Dashboard Centralizado - Dolce Party
// Version limpia sin emojis para evitar problemas de encoding

let selectedAgent = null;
let agents = [];
let currentAgentId = null;
let phoneAliases = {};
let socket = null;
let webSocketReady = false;

// Inicializacion
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard centralizado cargando...');
    
    // Cargar aliases de telefonos
    fetch('/api/phone-aliases')
        .then(r => r.json())
        .then(data => {
            phoneAliases = data.aliases || {};
            console.log('Aliases cargados:', phoneAliases);
        })
        .catch(err => console.error('Error cargando aliases:', err));
    
    // Cargar agentes inicialmente
    loadAgents();
    
    // Inicializar WebSocket
    initializeSocket();
});

// WebSocket
function initializeSocket() {
    if (typeof io === 'undefined') {
        console.error('Socket.IO client no esta cargado');
        return;
    }
    
    socket = io();
    
    socket.on('connect', () => {
        console.log('Conectado al dashboard via WebSocket');
    });
    
    socket.on('disconnect', () => {
        console.log('Desconectado del dashboard');
    });
}

function setupWebSocketListeners() {
    agents.forEach(agent => {
        if (agent.enabled) {
            socket.on(`agent_${agent.id}_initial`, (data) => {
                console.log(`Datos iniciales para ${agent.id}:`, data);
                updateAgentCard(agent.id, data);
                if (currentAgentId === agent.id) {
                    updateModalData(data);
                }
            });
            
            socket.on(`agent_${agent.id}_update`, (data) => {
                console.log(`Actualizacion para ${agent.id}:`, data);
                updateAgentCard(agent.id, data);
                if (currentAgentId === agent.id) {
                    updateModalData(data);
                }
            });
        }
    });
}

async function loadAgents() {
    try {
        const response = await fetch('/api/agents');
        agents = await response.json();
        console.log('Agentes cargados:', agents);
        
        const grid = document.getElementById('agents-grid');
        if (!grid) {
            console.error('No se encontro agents-grid');
            return;
        }
        grid.innerHTML = '';
        
        for (const agent of agents) {
            try {
                const card = await createAgentCard(agent);
                grid.appendChild(card);
            } catch (error) {
                console.error(`Error creando tarjeta para ${agent.id}:`, error);
            }
        }
        
        updateSystemStatus();
        updateLastUpdate();
        
        if (!webSocketReady && socket) {
            setupWebSocketListeners();
            webSocketReady = true;
        }
    } catch (error) {
        console.error('Error cargando agentes:', error);
    }
}

async function createAgentCard(agent) {
    const card = document.createElement('div');
    card.className = 'agent-card';
    card.id = `agent-${agent.id}`;
    
    let statusClass = 'disabled';
    let statusText = 'Deshabilitado';
    
    if (agent.enabled) {
        try {
            const statusResponse = await fetch(`/api/agents/${agent.id}/status`);
            const status = await statusResponse.json();
            
            if (status.isRunning) {
                statusClass = 'running';
                statusText = 'Corriendo';
                
                const [statsResponse, pausedResponse] = await Promise.all([
                    fetch(`/api/agents/${agent.id}/stats`),
                    fetch(`/api/agents/${agent.id}/paused`)
                ]);
                const stats = await statsResponse.json();
                const pausedData = await pausedResponse.json();
                const pausedCount = Array.isArray(pausedData) ? pausedData.length : Object.keys(pausedData).length;
                
                const today = new Date().toISOString().split('T')[0];
                const todayStats = stats.mensajes?.[today] || { recibidos: 0, enviados: 0 };
                
                card.innerHTML = `
                    <div class="agent-header">
                        <h2>${agent.name}</h2>
                        <span class="status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="agent-info">
                        <p><strong>ID:</strong> ${agent.id}</p>
                        <p><strong>Direccion:</strong> ${agent.info.direccion}</p>
                        <p><strong>Telefono:</strong> ${agent.info.telefono}</p>
                        <p><strong>Horario:</strong> ${agent.info.horario}</p>
                    </div>
                    ${pausedCount > 0 ? `
                    <div class="pending-alert">
                        🔴 ${pausedCount} chat${pausedCount > 1 ? 's' : ''} esperando atención humana
                    </div>
                    ` : ''}
                    <input type="hidden" class="paused-count" value="${pausedCount}">
                    card.dataset.pausedCount = pausedCount;
                    <div class="stats-section">
                        <h3>Estadisticas de Hoy</h3>
                        <div class="stats-grid-mini">
                            <div class="stat-mini">
                                <div class="stat-number">${todayStats.recibidos}</div>
                                <div class="stat-label">Recibidos</div>
                            </div>
                            <div class="stat-mini">
                                <div class="stat-number">${todayStats.enviados}</div>
                                <div class="stat-label">Enviados</div>
                            </div>
                        </div>
                    </div>
                    <div class="agent-actions">
                        <button onclick="window.open('/agente/${agent.id}', '_blank')" class="btn btn-primary btn-small">
                            Ver Detalles
                        </button>
                        <a href="http://${window.location.hostname}:${agent.ports.dashboard}" target="_blank" class="btn ${pausedCount > 0 ? 'btn-danger' : 'btn-warning'} btn-small">
                            ${pausedCount > 0 ? `🔴 Atender (${pausedCount})` : '🧑‍💼 Panel Humano'}
                        </a>
                    </div>
                `;
            } else {
                statusClass = 'stopped';
                statusText = 'Detenido';
                card.innerHTML = `
                    <div class="agent-header">
                        <h2>${agent.name}</h2>
                        <span class="status ${statusClass}">${statusText}</span>
                    </div>
                `;
            }
        } catch (error) {
            console.error(`Error cargando estado de ${agent.id}:`, error);
            statusClass = 'stopped';
            statusText = 'Error';
            card.innerHTML = `
                <div class="agent-header">
                    <h2>${agent.name}</h2>
                    <span class="status ${statusClass}">${statusText}</span>
                </div>
            `;
        }
    } else {
        card.innerHTML = `
            <div class="agent-header">
                <h2>${agent.name}</h2>
                <span class="status ${statusClass}">⏸️ Pendiente activación</span>
            </div>
            <div class="agent-info">
                <p><strong>Dirección:</strong> ${agent.info?.direccion || 'No configurado'}</p>
                <p><strong>Teléfono:</strong> ${agent.info?.telefono || 'No configurado'}</p>
            </div>
            <div class="agent-note">
                <p>⚠️ Este agente está pendiente de activación. Configurar número de WhatsApp para habilitarlo.</p>
            </div>
        `;
    }
    
    return card;
}

function updateAgentCard(agentId, data) {
    const card = document.getElementById(`agent-${agentId}`);
    if (!card) return;
    
    if (data.stats) {
        const statsSection = card.querySelector('.stats-section');
        if (statsSection) updateStatsHTML(statsSection, data.stats);
    }
    
    // Actualizar indicador de chats pendientes
    const existingAlert = card.querySelector('.pending-alert');
    if (data.pausedCount !== undefined) {
        if (data.pausedCount > 0) {
            if (existingAlert) {
                existingAlert.textContent = `🔴 ${data.pausedCount} chat${data.pausedCount > 1 ? 's' : ''} esperando atención humana`;
            } else {
                const alert = document.createElement('div');
                alert.className = 'pending-alert';
                alert.textContent = `🔴 ${data.pausedCount} chat${data.pausedCount > 1 ? 's' : ''} esperando atención humana`;
                const info = card.querySelector('.agent-info');
                if (info) info.after(alert);
                else card.prepend(alert);
            }
        } else {
            if (existingAlert) existingAlert.remove();
        }
    }
    
    // Actualizar botón Panel Humano
    const actionsDiv = card.querySelector('.agent-actions');
    if (actionsDiv && data.pausedCount !== undefined) {
        const btn = actionsDiv.querySelector('.btn-warning, .btn-danger');
        if (btn) {
            btn.className = `btn ${data.pausedCount > 0 ? 'btn-danger' : 'btn-warning'} btn-small`;
            btn.textContent = data.pausedCount > 0 ? `🔴 Atender (${data.pausedCount})` : '🧑‍💼 Panel Humano';
        }
    }
    
    card.dataset.pausedCount = data.pausedCount;
    updateSystemStatus();
}

function updateStatsHTML(section, stats) {
    const today = new Date().toISOString().split('T')[0];
    const todayStats = stats.mensajes?.[today] || { recibidos: 0, enviados: 0 };
    
    const statsGrid = section.querySelector('.stats-grid-mini');
    if (statsGrid) {
        statsGrid.innerHTML = `
            <div class="stat-mini">
                <div class="stat-number">${todayStats.recibidos}</div>
                <div class="stat-label">Recibidos</div>
            </div>
            <div class="stat-mini">
                <div class="stat-number">${todayStats.enviados}</div>
                <div class="stat-label">Enviados</div>
            </div>
        `;
    }
}

function showAgentDetails(agentId) {
    currentAgentId = agentId;
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;
    
    document.getElementById('modalAgentName').textContent = `${agent.name} - Detalles`;
    loadAgentModalData(agentId);
    document.getElementById('agentModal').style.display = 'block';
}

async function loadAgentModalData(agentId) {
    try {
        const [stats, convData, paused, logs, security] = await Promise.all([
            fetch(`/api/agents/${agentId}/stats`).then(r => r.json()),
            fetch(`/api/agents/${agentId}/conversations?limit=0`).then(r => r.json()),
            fetch(`/api/agents/${agentId}/paused`).then(r => r.json()),
            fetch(`/api/agents/${agentId}/logs?lines=50`).then(r => r.json()),
            fetch(`/api/agents/${agentId}/security?lines=30`).then(r => r.json())
        ]);
        
        updateModalStats(stats);
        updateModalConversations(convData.conversaciones || convData);
        updateModalPausedUsers(paused);
        updateModalLogs(logs);
        updateModalSecurity(security);
    } catch (error) {
        console.error('Error cargando datos del agente:', error);
    }
}

function updateModalStats(stats) {
    // Obtener el dia mas reciente con datos
    const fechasMensajes = stats.mensajes ? Object.keys(stats.mensajes).sort().reverse() : [];
    const fechaReciente = fechasMensajes.length > 0 ? fechasMensajes[0] : null;
    
    const today = new Date().toISOString().split('T')[0];
    const todayStats = stats.mensajes?.[today] || { recibidos: 0, enviados: 0 };
    const recentStats = fechaReciente ? stats.mensajes[fechaReciente] : { recibidos: 0, enviados: 0 };
    
    // Usar stats de hoy si hay, sino las mas recientes
    const displayStats = todayStats.recibidos > 0 || todayStats.enviados > 0 ? todayStats : recentStats;
    const displayDate = todayStats.recibidos > 0 || todayStats.enviados > 0 ? today : fechaReciente;
    
    // Get additional stats for the display date
    const handoffs = (stats.handoffs?.[displayDate]?.total || stats.handoffs?.[displayDate] || 0);
    const hijacking = (stats.hijacking?.[displayDate]?.total || stats.hijacking?.[displayDate] || 0);
    const busquedas = (stats.busquedas?.[displayDate]?.total || stats.busquedas?.[displayDate] || 0);

    const container = document.getElementById('modalStats');
    if (container) {
        container.innerHTML = `
            <div class="stat-mini">
                <div class="stat-number">${displayStats.recibidos || 0}</div>
                <div class="stat-label">Recibidos</div>
            </div>
            <div class="stat-mini">
                <div class="stat-number">${displayStats.enviados || 0}</div>
                <div class="stat-label">Enviados</div>
            </div>
            <div class="stat-mini">
                <div class="stat-number">${handoffs}</div>
                <div class="stat-label">Handoffs</div>
            </div>
            <div class="stat-mini">
                <div class="stat-number">${hijacking}</div>
                <div class="stat-label">Hijacking</div>
            </div>
            <div class="stat-mini">
                <div class="stat-number">${busquedas}</div>
                <div class="stat-label">Busquedas</div>
            </div>
        `;
    }
}

function updateModalConversations(conversations) {
    const container = document.getElementById('modalConversations');
    if (!container) return;
    
    if (!conversations || conversations.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay conversaciones</div>';
        return;
    }
    
    container.innerHTML = conversations.map(conv => `
        <div class="conversation-item">
            <div class="conversation-header">
                <span class="conversation-user">${formatUserId(conv.userId)}</span>
                <span class="conversation-time">${formatTime(conv.lastMessage)}</span>
            </div>
            ${conv.messages && conv.messages.length ? `
            <div class="messages">
                ${conv.messages.slice(-3).map(msg => `
                    <div class="message ${msg.type}">
                        ${msg.type === 'user' ? '👤' : '🤖'}: ${msg.text}
                    </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
    `).join('');
}

function updateModalPausedUsers(paused) {
    const container = document.getElementById('modalPausedUsers');
    if (!container) return;
    
    // Convertir a array si es objeto {userId: data, ...}
    let pausedArray = paused;
    if (!Array.isArray(paused)) {
        pausedArray = Object.entries(paused).map(([userId, data]) => ({
            userId,
            ...data
        }));
    }
    
    if (!pausedArray || pausedArray.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay usuarios pausados</div>';
        return;
    }
    
    container.innerHTML = pausedArray.map(user => `
        <div class="paused-user-item">
            <div class="paused-user-id">${formatUserId(user.userId)}</div>
            <button class="btn btn-small btn-success" onclick="resumeAgentUser('${currentAgentId}', '${user.userId}')">
                Reanudar
            </button>
        </div>
    `).join('');
}

function updateModalLogs(logs) {
    const container = document.getElementById('modalLogs');
    if (!container) return;
    
    if (!logs || logs.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay logs</div>';
        return;
    }
    
    container.innerHTML = logs.map(log => `
        <div class="log-item">
            <span class="log-timestamp">${log.timestamp || 'N/A'}</span>
            <div>${log.message || log}</div>
        </div>
    `).join('');
}

function updateModalSecurity(security) {
    const container = document.getElementById('modalSecurity');
    if (!container) return;
    
    if (!security || security.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay alertas</div>';
        return;
    }
    
    container.innerHTML = security.map(item => `
        <div class="security-item">
            <div class="security-header">
                <span class="security-type">${item.tipo || 'N/A'}</span>
            </div>
            <div class="security-user">${item.userId || 'N/A'}</div>
        </div>
    `).join('');
}

function updateModalData(data) {
    if (data.stats) updateModalStats(data.stats);
    if (data.conversations) updateModalConversations(data.conversations);
    if (data.paused) updateModalPausedUsers(data.paused);
    if (data.logs) updateModalLogs(data.logs);
    if (data.security) updateModalSecurity(data.security);
}

function closeAgentModal() {
    document.getElementById('agentModal').style.display = 'none';
    currentAgentId = null;
}

function formatUserId(userId) {
    const number = userId.replace(/@.*/, '').replace(/^54/, '+54 ');
    const alias = phoneAliases[userId.replace(/@.*/, '')];
    return alias ? `${number} (${alias})` : number;
}

function formatTime(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
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
        lastUpdate.textContent = `Ultima actualizacion: ${timeString}`;
    }
}

function updateSystemStatus() {
    const botsOnline = agents.filter(a => a.enabled).length;
    let totalPending = 0;
    agents.forEach(a => {
        const card = document.getElementById(`agent-${a.id}`);
        if (card && card.dataset.pausedCount) {
            totalPending += parseInt(card.dataset.pausedCount) || 0;
        }
    });
    document.getElementById('statusBots').textContent = `🤖 Bots online: ${botsOnline}`;
    document.getElementById('statusPending').textContent = `⏳ Pendientes: ${totalPending}`;
}

// Controles
async function pauseAgentGlobal(agentId) {
    try {
        const response = await fetch(`/api/agents/${agentId}/pause-global`, { 
            method: 'POST' 
        });
        const result = await response.json();
        if (result.success) {
            alert(`Bot pausado`);
            loadAgents();
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function resumeAgentGlobal(agentId) {
    try {
        const response = await fetch(`/api/agents/${agentId}/resume-global`, { 
            method: 'POST' 
        });
        const result = await response.json();
        if (result.success) {
            alert(`Bot reanudado`);
            loadAgents();
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function resumeAgentUser(agentId, userId) {
    try {
        const response = await fetch(`/api/agents/${agentId}/resume/${userId}`, { 
            method: 'POST' 
        });
        const result = await response.json();
        if (result.success) {
            if (currentAgentId === agentId) {
                loadAgentModalData(agentId);
            }
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
    const modal = document.getElementById('agentModal');
    if (event.target === modal) {
        closeAgentModal();
    }
}

console.log('Dashboard centralizado script cargado');
