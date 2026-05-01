// human-panel.js - Panel de Agente Humano
// Interfaz tipo WhatsApp Web para gestionar conversaciones

let selectedAgentId = null;
let selectedUserId = null;
let phoneAliases = {};
let socket = null;
let refreshInterval = null;

// Inicializacion

document.addEventListener('DOMContentLoaded', () => {
    const pathParts = window.location.pathname.split('/');
    selectedAgentId = pathParts[pathParts.length - 1] || null;

    if (!selectedAgentId) {
        alert('Error: No se especifico el ID del agente');
        return;
    }

    fetch('/api/phone-aliases')
        .then(r => r.json())
        .then(data => { phoneAliases = data.aliases || {}; })
        .catch(err => console.error('Error cargando aliases:', err));

    initializeSocket();
    loadAgentInfo();
    loadConversations();

    refreshInterval = setInterval(() => {
        loadConversations();
    }, 10000);
});

// WebSocket

function initializeSocket() {
    if (typeof io === 'undefined') return;

    socket = io();

    socket.on('connect', () => {
        console.log('Panel Humano conectado');
    });

    // Datos iniciales
    socket.on(`agent_${selectedAgentId}_initial`, (data) => {
        if (data.conversations) {
            updateChatsList(data.conversations);
            if (selectedUserId) {
                const chat = data.conversations.find(c => c.userId === selectedUserId);
                if (chat && chat.messages) {
                    updateChatMessages(chat.messages);
                }
            }
        }
        if (data.paused) {
            updateHandoffStatus(data.paused);
        }
    });

    // Actualizar en tiempo real
    socket.on(`agent_${selectedAgentId}_update`, (data) => {
        if (data.conversations) {
            updateChatsList(data.conversations);
            if (selectedUserId) {
                const chat = data.conversations.find(c => c.userId === selectedUserId);
                if (chat && chat.messages) {
                    updateChatMessages(chat.messages);
                }
            }
        }
        if (data.paused) {
            updateHandoffStatus(data.paused);
        }
    });
}

function updateHandoffStatus(pausedUsers) {
    if (!selectedUserId) return;
    
    let pausedArray = pausedUsers;
    if (!Array.isArray(pausedUsers)) {
        pausedArray = Object.entries(pausedUsers).map(([userId, data]) => ({
            userId,
            ...data
        }));
    }

    const isPaused = pausedArray.find(u => u.userId === selectedUserId && u.pausado);
    const btnResolve = document.getElementById('btnResolve');
    if (btnResolve) {
        btnResolve.style.display = isPaused ? 'block' : 'none';
    }
}

// Cargar info del agente

async function loadAgentInfo() {
    try {
        const response = await fetch('/api/agents');
        const agents = await response.json();
        const agent = agents.find(a => a.id === selectedAgentId);
        if (agent) {
            document.getElementById('agentName').textContent = agent.name;
        }
    } catch (error) {
        console.error('Error cargando info del agente:', error);
    }
}

// Cargar conversaciones

async function loadConversations() {
    try {
        const response = await fetch(`/api/agents/${selectedAgentId}/conversations?limit=0`);
        const data = await response.json();
        let conversaciones = data.conversaciones || data;
        updateChatsList(conversaciones);
    } catch (error) {
        console.error('Error cargando conversaciones:', error);
    }
}

function updateChatsList(conversaciones) {
    const container = document.getElementById('chatsList');

    if (!conversaciones || conversaciones.length === 0) {
        container.innerHTML = '<div class="empty-state"><div>No hay conversaciones</div></div>';
        return;
    }

    container.innerHTML = conversaciones.map(conv => {
        const ultimoMsg = conv.messages && conv.messages.length > 0
            ? conv.messages[conv.messages.length - 1]
            : null;
        const preview = ultimoMsg
            ? (ultimoMsg.text.length > 50 ? ultimoMsg.text.substring(0, 50) + '...' : ultimoMsg.text)
            : 'Sin mensajes';
        const time = ultimoMsg ? formatTime(ultimoMsg.timestamp) : '';

        return `
        <div class="chat-item ${selectedUserId === conv.userId ? 'active' : ''}"
             onclick="selectChat('${conv.userId}', this)">
            <div class="chat-item-info">
                <span class="chat-item-name">${formatUserId(conv.userId)}</span>
                <span class="chat-item-time">${time}</span>
            </div>
            <div class="chat-item-preview">${preview}</div>
        </div>
        `;
    }).join('');
}

// Seleccionar chat

async function selectChat(userId, element) {
    selectedUserId = userId;

    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    if (element) {
        element.classList.add('active');
    }

    const chatHeader = document.getElementById('chatHeader');
    chatHeader.style.display = 'flex';
    document.getElementById('chatUserName').textContent = formatUserId(userId);
    document.getElementById('chatUserStatus').textContent = 'Conversacion activa';

    document.getElementById('chatInputContainer').style.display = 'flex';

    await loadChatMessages(userId);
    
    // Verificar estado de pausa inicial para este usuario
    try {
        const response = await fetch(`/api/agents/${selectedAgentId}/paused`);
        const paused = await response.json();
        updateHandoffStatus(paused);
    } catch (e) {}
}

// Cargar mensajes del chat

async function loadChatMessages(userId) {
    try {
        const histResponse = await fetch(`/api/agents/${selectedAgentId}/conversations?limit=0`);
        const histData = await histResponse.json();
        const conversaciones = histData.conversaciones || histData;

        const chat = conversaciones.find(c => c.userId === userId);

        if (chat && chat.messages) {
            updateChatMessages(chat.messages);
        } else {
            document.getElementById('chatMessages').innerHTML =
                '<div class="empty-state">No hay mensajes en el historial</div>';
        }
    } catch (error) {
        console.error('Error cargando mensajes:', error);
    }
}

function updateChatMessages(messages) {
    const container = document.getElementById('chatMessages');

    if (!messages || messages.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay mensajes</div>';
        return;
    }

    container.innerHTML = messages.map(msg => {
        const type = msg.type || 'user';
        const cssClass = type === 'user' ? 'message-user' :
            type === 'human' ? 'message-human' : 'message-bot';

        return `
            <div class="message-bubble ${cssClass}">
                ${msg.text}
                <div class="message-time">${formatTime(msg.timestamp)}</div>
            </div>
        `;
    }).join('');

    container.scrollTop = container.scrollHeight;
}

// Enviar mensaje como humano

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (!message || !selectedUserId) return;

    try {
        const response = await fetch(`/api/agents/${selectedAgentId}/send-human-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: selectedUserId,
                message
            })
        });

        const result = await response.json();

        if (result.success) {
            input.value = '';
            // El mensaje aparecerá via WebSocket, pero lo agregamos localmente para inmediatez
            const chatMessages = document.getElementById('chatMessages');
            const msgDiv = document.createElement('div');
            msgDiv.className = 'message-bubble message-human';
            msgDiv.innerHTML = `
                ${message}
                <div class="message-time">ahora</div>
            `;
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
            alert('Error enviando mensaje: ' + (result.error || 'Desconocido'));
        }
    } catch (error) {
        alert('Error de conexion: ' + error.message);
    }
}

// Resolver handoff

async function forceHandoff() {
    if (!selectedAgentId || !selectedUserId) return;

    try {
        const response = await fetch(`/api/agents/${selectedAgentId}/pause/${selectedUserId}`, {
            method: 'POST'
        });
        const result = await response.json();

        if (result.success) {
            console.log('Intervención manual activada');
            // El estado se actualizará via WebSocket o podemos forzarlo
            loadConversations();
        } else {
            alert('Error al intervenir: ' + (result.error || 'Desconocido'));
        }
    } catch (error) {
        alert('Error de conexion: ' + error.message);
    }
}

async function resolveHandoff() {
    if (!selectedAgentId || !selectedUserId) return;

    try {
        const response = await fetch(`/api/agents/${selectedAgentId}/resolve-handoff/${selectedUserId}`, {
            method: 'POST'
        });
        const result = await response.json();

        if (result.success) {
            alert('Handoff resuelto. El bot volverá a responder.');
            document.getElementById('btnResolve').style.display = 'none';
            loadConversations();
        } else {
            alert('Error al resolver: ' + (result.error || 'Desconocido'));
        }
    } catch (error) {
        alert('Error de conexion: ' + error.message);
    }
}

// Funciones auxiliares

function formatUserId(userId) {
    const number = userId.replace(/@.*/, '').replace(/^54/, '+54 ');
    const alias = phoneAliases[userId.replace(/@.*/, '')];
    return alias ? `${number} (${alias})` : number;
}

function formatTime(timestamp) {
    if (!timestamp) return 'Desconocido';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / 60000);

    if (diffMinutes < 1) return 'ahora';
    if (diffMinutes < 60) return `hace ${diffMinutes} min`;
    if (diffMinutes < 1440) return `hace ${Math.floor(diffMinutes / 60)}h`;
    return date.toLocaleDateString('es-AR');
}

// Limpieza

window.addEventListener('beforeunload', () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});

console.log(`Panel de Agente Humano - ${selectedAgentId || 'N/A'}`);
