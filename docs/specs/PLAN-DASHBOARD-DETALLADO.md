# PLAN DETALLADO: DASHBOARD WEB

## 📋 ANÁLISIS DEL ESTADO ACTUAL

### **DATOS YA DISPONIBLES EN BOT.JS:**
✅ `conversaciones` - Historial de mensajes por usuario
✅ `estadosUsuario` - Estado actual de cada usuario  
✅ `datosUsuario` - Nombres de usuarios
✅ `usuariosPausados` - Usuarios en atención manual
✅ `pausaGlobal` - Estado global del bot
✅ `LOG_FILE` - Logs ya estructurados
✅ `ARCHIVO_HISTORIAL` - Historial persistente
✅ Funciones de logging ya implementadas
✅ Sistema anti-hijacking con logs de seguridad

### **DEPENDENCIAS ACTUALES:**
- whatsapp-web.js ✅
- @google/generative-ai ✅  
- dotenv ✅
- qrcode-terminal ✅

### **DEPENDENCIAS NUEVAS NECESARIAS:**
- express (servidor web)
- socket.io (WebSocket tiempo real)
- cors (CORS para API)

## 🏗️ ARQUITECTURA SIMPLIFICADA

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   bot.js        │───►│  dashboard.js   │───►│  index.html     │
│ (datos origen)  │    │ (API + WebSocket)│    │ (interfaz web)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 ESTRUCTURA DE ARCHIVOS FINAL

```
proyecto/
├── bot.js                    # ✅ YA EXISTE
├── catalogo.js              # ✅ YA EXISTE  
├── flujos.js                # ✅ YA EXISTE
├── .env                     # ✅ YA EXISTE
├── package.json             # ✅ ACTUALIZAR
├── dashboard.js             # 🆕 CREAR
├── public/                  # 🆕 CREAR
│   ├── index.html          # 🆕 CREAR
│   ├── style.css           # 🆕 CREAR
│   └── app.js              # 🆕 CREAR
├── data/                    # ✅ YA EXISTE
│   ├── pausas.json         # ✅ YA EXISTE
│   └── historial.json      # ✅ YA EXISTE
└── logs/                    # ✅ YA EXISTE
    ├── bot.log             # ✅ YA EXISTE
    └── security.log        # ✅ YA EXISTE
```

## 🔧 IMPLEMENTACIÓN PASO A PASO

### **PASO 1: ACTUALIZAR PACKAGE.JSON** (2 min)
```json
{
  "dependencies": {
    "whatsapp-web.js": "^1.23.0",
    "qrcode-terminal": "^0.12.0", 
    "@google/generative-ai": "^0.21.0",
    "dotenv": "^16.4.5",
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "cors": "^2.8.5"
  },
  "scripts": {
    "start": "node bot.js",
    "dashboard": "node dashboard.js",
    "dev": "node bot.js & node dashboard.js"
  }
}
```

### **PASO 2: CREAR DASHBOARD.JS** (30 min)
```javascript
// dashboard.js - Servidor Express + Socket.IO
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Importar datos del bot (si es posible)
// O leer archivos JSON directamente

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Endpoints
app.get('/api/stats', getStats);
app.get('/api/conversations', getConversations);
app.get('/api/paused', getPausedUsers);
app.post('/api/pause/:userId', pauseUser);
app.post('/api/resume/:userId', resumeUser);
app.get('/api/logs', getLogs);
app.get('/api/security', getSecurityLogs);

// WebSocket para tiempo real
io.on('connection', (socket) => {
  console.log('Dashboard conectado');
  
  // Enviar datos iniciales
  socket.emit('initial_data', {
    stats: getStatsData(),
    conversations: getConversationsData(),
    paused: getPausedData()
  });
});

server.listen(3001, () => {
  console.log('Dashboard disponible en http://localhost:3001');
});
```

### **PASO 3: CREAR FRONTEND BÁSICO** (45 min)

#### **public/index.html**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Dolce Party - Bot Dashboard</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="dashboard">
        <header>
            <h1>🎈 Dolce Party - Bot Dashboard</h1>
            <div class="status" id="botStatus">✅ Activo</div>
        </header>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Mensajes Hoy</h3>
                <div class="stat-number" id="mensajesHoy">0</div>
            </div>
            <div class="stat-card">
                <h3>Handoffs</h3>
                <div class="stat-number" id="handoffs">0</div>
            </div>
            <div class="stat-card">
                <h3>Usuarios Activos</h3>
                <div class="stat-number" id="usuariosActivos">0</div>
            </div>
            <div class="stat-card">
                <h3>Pausados</h3>
                <div class="stat-number" id="usuariosPausados">0</div>
            </div>
        </div>
        
        <div class="main-content">
            <div class="conversations-panel">
                <h2>💬 Conversaciones Activas</h2>
                <div id="conversationsList"></div>
            </div>
            
            <div class="control-panel">
                <h2>⏸️ Control Manual</h2>
                <div id="pausedUsersList"></div>
                <div class="global-controls">
                    <button id="pauseBot">⏸️ Pausar Bot</button>
                    <button id="resumeBot">▶️ Reanudar Bot</button>
                </div>
            </div>
        </div>
        
        <div class="logs-panel">
            <h2>📝 Logs Recientes</h2>
            <div id="logsList"></div>
        </div>
    </div>
    
    <script src="/socket.io/socket.io.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

#### **public/style.css**
```css
/* CSS básico pero funcional */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f5f5f5;
    color: #333;
}

.dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}

.stat-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-number {
    font-size: 2em;
    font-weight: bold;
    color: #007bff;
    margin-top: 10px;
}

.main-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
}

.conversations-panel, .control-panel, .logs-panel {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.conversation-item {
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 10px;
}

.conversation-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-weight: bold;
}

.message {
    margin: 5px 0;
    padding: 8px;
    border-radius: 4px;
}

.message.user {
    background: #e3f2fd;
    text-align: right;
}

.message.bot {
    background: #f3e5f5;
}

button {
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    margin: 5px;
}

button:hover {
    background: #0056b3;
}

.status {
    padding: 5px 10px;
    border-radius: 4px;
    font-weight: bold;
}

.status.active {
    background: #d4edda;
    color: #155724;
}

.status.paused {
    background: #f8d7da;
    color: #721c24;
}

@media (max-width: 768px) {
    .main-content {
        grid-template-columns: 1fr;
    }
    
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
```

#### **public/app.js**
```javascript
// WebSocket connection
const socket = io();

// DOM elements
const botStatus = document.getElementById('botStatus');
const mensajesHoy = document.getElementById('mensajesHoy');
const handoffs = document.getElementById('handoffs');
const usuariosActivos = document.getElementById('usuariosActivos');
const usuariosPausados = document.getElementById('usuariosPausados');
const conversationsList = document.getElementById('conversationsList');
const pausedUsersList = document.getElementById('pausedUsersList');
const logsList = document.getElementById('logsList');

// Socket events
socket.on('connect', () => {
    console.log('Conectado al dashboard');
});

socket.on('initial_data', (data) => {
    updateStats(data.stats);
    updateConversations(data.conversations);
    updatePausedUsers(data.paused);
});

socket.on('stats_update', (stats) => {
    updateStats(stats);
});

socket.on('new_message', (message) => {
    addMessageToConversation(message);
});

socket.on('user_paused', (user) => {
    addPausedUser(user);
});

socket.on('user_resumed', (userId) => {
    removePausedUser(userId);
});

// Update functions
function updateStats(stats) {
    mensajesHoy.textContent = stats.mensajesHoy || 0;
    handoffs.textContent = stats.handoffs || 0;
    usuariosActivos.textContent = stats.usuariosActivos || 0;
    usuariosPausados.textContent = stats.usuariosPausados || 0;
    
    botStatus.textContent = stats.botActivo ? '✅ Activo' : '⏸️ Pausado';
    botStatus.className = stats.botActivo ? 'status active' : 'status paused';
}

function updateConversations(conversations) {
    conversationsList.innerHTML = '';
    conversations.forEach(conv => {
        const div = document.createElement('div');
        div.className = 'conversation-item';
        div.innerHTML = `
            <div class="conversation-header">
                <span>👤 ${conv.userId.replace(/@.*/, '')}</span>
                <span>🕐 ${formatTime(conv.lastMessage)}</span>
            </div>
            <div class="messages">
                ${conv.messages.map(msg => `
                    <div class="message ${msg.type}">
                        ${msg.type === 'user' ? '👤' : '🤖'}: ${msg.text}
                    </div>
                `).join('')}
            </div>
            <div class="conversation-actions">
                <button onclick="pauseUser('${conv.userId}')">⏸️ Pausar</button>
                <button onclick="viewHistory('${conv.userId}')">📝 Historial</button>
            </div>
        `;
        conversationsList.appendChild(div);
    });
}

function updatePausedUsers(paused) {
    pausedUsersList.innerHTML = '';
    paused.forEach(user => {
        const div = document.createElement('div');
        div.className = 'paused-user-item';
        div.innerHTML = `
            <div>
                <strong>📱 ${user.userId.replace(/@.*/, '')}</strong>
                <br>⏸️ Pausado hace: ${formatDuration(Date.now() - user.timestamp)}
                <br>🔄 Auto-reactiva en: ${formatDuration(user.autoResumeIn)}
            </div>
            <div>
                <button onclick="resumeUser('${user.userId}')">▶️ Reanudar</button>
            </div>
        `;
        pausedUsersList.appendChild(div);
    });
}

// Helper functions
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    return `${minutes} min`;
}

// Action functions
function pauseUser(userId) {
    fetch(`/api/pause/${encodeURIComponent(userId)}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => console.log('Usuario pausado:', data));
}

function resumeUser(userId) {
    fetch(`/api/resume/${encodeURIComponent(userId)}`, { method: 'POST' })
        .then(response => response.json())
        .then(data => console.log('Usuario reanudado:', data));
}

function viewHistory(userId) {
    // Implementar modal o nueva página para historial
    console.log('Ver historial de:', userId);
}

// Global controls
document.getElementById('pauseBot').addEventListener('click', () => {
    fetch('/api/pause-global', { method: 'POST' })
        .then(response => response.json())
        .then(data => console.log('Bot pausado globalmente:', data));
});

document.getElementById('resumeBot').addEventListener('click', () => {
    fetch('/api/resume-global', { method: 'POST' })
        .then(response => response.json())
        .then(data => console.log('Bot reanudado globalmente:', data));
});

// Auto-refresh every 30 seconds
setInterval(() => {
    fetch('/api/stats')
        .then(response => response.json())
        .then(stats => updateStats(stats));
}, 30000);
```

### **PASO 4: INTEGRAR CON BOT.JS** (30 min)

Agregar al final de bot.js:
```javascript
// ─── INTEGRACIÓN CON DASHBOARD ───────────────────────────────────────────────

let dashboardSocket = null;

// Función para enviar datos al dashboard
function emitToDashboard(event, data) {
  if (dashboardSocket) {
    dashboardSocket.emit(event, data);
  }
}

// Exportar datos para el dashboard
function getDashboardData() {
  return {
    stats: {
      mensajesHoy: Object.keys(conversaciones).length,
      handoffs: Object.values(usuariosPausados).length,
      usuariosActivos: Object.keys(estadosUsuario).length,
      usuariosPausados: Object.keys(usuariosPausados).length,
      botActivo: !pausaGlobal
    },
    conversations: Object.entries(conversaciones).map(([userId, msgs]) => ({
      userId,
      messages: msgs.slice(-3), // Últimos 3 mensajes
      lastMessage: Date.now()
    })),
    paused: Object.entries(usuariosPausados).map(([userId, pausa]) => ({
      userId,
      timestamp: pausa.timestamp,
      reason: pausa.razon,
      autoResumeIn: AUTO_RESUME_TIMEOUT_MS - (Date.now() - pausa.timestamp)
    }))
  };
}

// Hacer disponible para dashboard.js
global.botData = {
  getDashboardData,
  pausarUsuario,
  reanudarUsuario,
  pausaGlobal,
  setPausaGlobal: (estado) => { pausaGlobal = estado; guardarEstadoPausas(); }
};
```

## ⏱️ TIEMPO ESTIMADO TOTAL

- **Paso 1**: 2 minutos (actualizar package.json)
- **Paso 2**: 30 minutos (dashboard.js)
- **Paso 3**: 45 minutos (frontend)
- **Paso 4**: 30 minutos (integración)
- **Testing**: 15 minutos

**TOTAL: ~2 horas** para dashboard funcional básico

## 🚀 COMANDOS PARA EJECUTAR

```bash
# 1. Instalar nuevas dependencias
npm install express socket.io cors

# 2. Ejecutar bot (terminal 1)
npm start

# 3. Ejecutar dashboard (terminal 2)  
npm run dashboard

# 4. Abrir navegador
http://localhost:3001
```

## ✅ RESULTADO FINAL

Dashboard web funcional con:
- ✅ Estadísticas en tiempo real
- ✅ Lista de conversaciones activas
- ✅ Control de usuarios pausados
- ✅ Logs recientes
- ✅ Controles globales del bot
- ✅ Interfaz responsive
- ✅ WebSocket para tiempo real

¿Te parece bien este plan? Es mucho más realista y aprovecha todo lo que ya tenemos implementado.