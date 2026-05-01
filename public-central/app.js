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
                
                const statsResponse = await fetch(`/api/agents/${agent.id}/stats`);
                const stats = await statsResponse.json();
                
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
                        <button onclick="showAgentDetails('${agent.id}')" class="btn btn-primary btn-small">
                            Ver Detalles
                        </button>
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
                <span class="status ${statusClass}">${statusText}</span>
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
        if (statsSection) {
            updateStatsHTML(statsSection, data.stats);
        }
    }
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
    const today = new Date().toISOString().split('T')[0];
    const todayStats = stats.mensajes?.[today] || { recibidos: 0, enviados: 0 };
    
    const container = document.getElementById('modalStats');
    if (container) {
        container.innerHTML = `
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
