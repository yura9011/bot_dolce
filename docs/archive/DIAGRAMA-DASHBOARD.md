# DIAGRAMA ARQUITECTURA DASHBOARD

## 🏗️ ARQUITECTURA GENERAL

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   NAVEGADOR     │◄──►│  DASHBOARD      │◄──►│    BOT.JS       │
│   (Frontend)    │    │   SERVER        │    │  (WhatsApp)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  HTML/CSS/JS    │    │ Express + WS    │    │ WhatsApp-Web.js │
│  Chart.js       │    │ REST API        │    │ Gemini API      │
│  WebSocket      │    │ Real-time       │    │ Logs/Data       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 FLUJO DE DATOS

```
WhatsApp → Bot.js → Dashboard Server → WebSocket → Frontend
    ↓         ↓            ↓              ↓          ↓
 Mensaje   Procesa    Almacena       Transmite   Muestra
          Responde    Estadísticas   Tiempo Real  en UI
```

## 🖥️ PANTALLAS DEL DASHBOARD

### **PANTALLA 1: OVERVIEW**
```
┌─────────────────────────────────────────────────────────────┐
│ 🏠 DOLCE PARTY - BOT DASHBOARD                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📊 ESTADÍSTICAS HOY          🚨 ALERTAS                     │
│ ┌─────────────────────┐      ┌─────────────────────┐       │
│ │ Mensajes: 45        │      │ ⚠️ 2 Errores API    │       │
│ │ Handoffs: 3         │      │ ⏸️ 1 Usuario pausado │       │
│ │ Activos: 12         │      │ 🔒 0 Hijacking      │       │
│ │ Status: ✅ Activo   │      │                     │       │
│ └─────────────────────┘      └─────────────────────┘       │
│                                                             │
│ 📈 ACTIVIDAD (24H)                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │     ▄                                                   │ │
│ │   ▄ █ ▄     ▄▄                                         │ │
│ │ ▄ █ █ █ ▄ ▄ ██ ▄                                       │ │
│ │ █ █ █ █ █ █ ██ █                                       │ │
│ │ 00 06 12 18 24                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [💬 CHAT] [⏸️ CONTROL] [📊 STATS] [🔒 SECURITY] [📝 LOGS] │
└─────────────────────────────────────────────────────────────┘
```

### **PANTALLA 2: CHAT EN VIVO**
```
┌─────────────────────────────────────────────────────────────┐
│ 💬 CONVERSACIONES EN TIEMPO REAL                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 👤 +54911234567                           🕐 Hace 2 min    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 👤: Necesito globos de cumpleaños                      │ │
│ │ 🤖: ¡Perfecto! Tengo varias opciones...                │ │
│ │ 👤: ¿Qué colores tenés?                                 │ │
│ │ 🤖: Tengo rojos, azules, dorados...                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│ [⏸️ PAUSAR] [📝 HISTORIAL] [🔍 DETALLES]                   │
│                                                             │
│ 👤 +54911987654                           🕐 Hace 5 min    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 👤: Hola                                                │ │
│ │ 🤖: ¡Hola! Bienvenido a Dolce Party...                 │ │
│ │ 👤: 1                                                   │ │
│ │ 🤖: Perfecto! ¿Qué productos necesitás...              │ │
│ └─────────────────────────────────────────────────────────┘ │
│ [⏸️ PAUSAR] [📝 HISTORIAL] [🔍 DETALLES]                   │
│                                                             │
│ 🔄 Auto-refresh: ON    📊 Total conversaciones: 12         │
└─────────────────────────────────────────────────────────────┘
```

### **PANTALLA 3: CONTROL MANUAL**
```
┌─────────────────────────────────────────────────────────────┐
│ ⏸️ CONTROL MANUAL DE USUARIOS                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🎛️ CONTROLES GLOBALES                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Bot Status: ✅ ACTIVO                                   │ │
│ │ [⏸️ PAUSAR BOT GLOBAL] [▶️ REANUDAR BOT GLOBAL]         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 👥 USUARIOS PAUSADOS (1)                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📱 +54911234567                                         │ │
│ │ ⏸️ Pausado hace: 15 minutos                             │ │
│ │ 🔄 Auto-reactiva en: 15 minutos                         │ │
│ │ 📝 Razón: handoff_solicitado                            │ │
│ │ [▶️ REANUDAR] [📝 HISTORIAL] [🗑️ ELIMINAR]              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 🔍 BUSCAR USUARIO                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Número: [_______________] [🔍 BUSCAR]                   │ │
│ │ [⏸️ PAUSAR] [▶️ REANUDAR] [📝 HISTORIAL]                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 📊 Usuarios activos: 11  |  Pausados: 1  |  Total: 12     │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 COMPONENTES TÉCNICOS

### **BACKEND COMPONENTS**
```javascript
dashboard/
├── server/
│   ├── app.js              # Express server principal
│   ├── routes/
│   │   ├── api.js          # REST API endpoints
│   │   ├── stats.js        # Estadísticas
│   │   ├── chat.js         # Chat management
│   │   └── security.js     # Security logs
│   ├── websocket.js        # WebSocket server
│   ├── middleware/
│   │   ├── auth.js         # Autenticación
│   │   └── cors.js         # CORS config
│   └── utils/
│       ├── botIntegration.js # Integración con bot.js
│       └── dataProcessor.js  # Procesamiento de datos
```

### **FRONTEND COMPONENTS**
```javascript
public/
├── index.html              # Página principal
├── assets/
│   ├── css/
│   │   ├── dashboard.css   # Estilos principales
│   │   ├── components.css  # Componentes UI
│   │   └── responsive.css  # Mobile responsive
│   ├── js/
│   │   ├── app.js          # JavaScript principal
│   │   ├── websocket.js    # WebSocket client
│   │   ├── charts.js       # Gráficos Chart.js
│   │   ├── components/
│   │   │   ├── chat.js     # Componente chat
│   │   │   ├── stats.js    # Componente estadísticas
│   │   │   └── controls.js # Componente controles
│   │   └── utils/
│   │       ├── api.js      # API client
│   │       └── helpers.js  # Funciones helper
│   └── images/
│       ├── logo.png        # Logo Dolce Party
│       └── icons/          # Iconos UI
```

## 🔄 INTEGRACIÓN CON BOT.JS

### **EVENTOS QUE EL BOT ENVIARÁ AL DASHBOARD**
```javascript
// En bot.js - agregar estas emisiones:
dashboard.emit('new_message', {
  userId: userId,
  message: texto,
  timestamp: Date.now(),
  type: 'inbound'
});

dashboard.emit('bot_response', {
  userId: userId,
  response: respuesta,
  timestamp: Date.now(),
  type: 'outbound'
});

dashboard.emit('user_paused', {
  userId: userId,
  reason: razon,
  timestamp: Date.now()
});

dashboard.emit('security_alert', {
  userId: userId,
  attackType: tipoAtaque,
  message: mensaje,
  timestamp: Date.now()
});
```

## 📱 RESPONSIVE DESIGN

### **DESKTOP (1200px+)**
- Layout de 3 columnas
- Sidebar con navegación
- Gráficos grandes
- Chat en tiempo real

### **TABLET (768px - 1199px)**
- Layout de 2 columnas
- Navegación top
- Gráficos medianos
- Chat colapsible

### **MOBILE (< 768px)**
- Layout de 1 columna
- Navegación hamburger
- Gráficos pequeños
- Chat modal

## 🚀 PLAN DE DESARROLLO

### **DÍA 1: BACKEND**
- ✅ Setup Express server
- ✅ REST API básica
- ✅ WebSocket server
- ✅ Integración con bot.js

### **DÍA 2: FRONTEND BÁSICO**
- ✅ HTML estructura
- ✅ CSS básico
- ✅ JavaScript core
- ✅ WebSocket client

### **DÍA 3: FEATURES CORE**
- ✅ Chat en tiempo real
- ✅ Control de pausas
- ✅ Estadísticas básicas

### **DÍA 4: POLISH**
- ✅ Gráficos Chart.js
- ✅ Responsive design
- ✅ Testing y bugs

¿Empezamos con el backend del dashboard?