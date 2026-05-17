# REFERENCIA: Ideas para Panel de Agente Humano (WhatsApp Web-like)

## 📚 Fuentes de Referencia
- `D:\tareas\exp010-whatsappbot\.gsd\wwebjs-api` - API wrapper para WhatsApp Web
- `D:\tareas\exp010-whatsappbot\.gsd\FreeBirdsCrew_WhatsApp_AI_Bot` - Bot con dashboard React
- `D:\tareas\exp010-whatsappbot\.gsd\whatsapp-llm-alert-bot` - Bot de alertas simple

---

## 🔌 API Endpoints Útiles (wwebjs-api)

### Enviar Mensajes
```http
POST /api/agents/:id/send-message
Body: {
  "chatId": "5491158647529@c.us",
  "message": "Hola, soy el agente humano"
}
```
*Referencia: wwebjs-api/src/routes.js linea 89*

### Obtener Chats
```http
GET /api/agents/:id/chats
```
*Referencia: wwebjs-api/src/routes.js linea 71*

### Obtener Mensajes de un Chat
```http
POST /api/agents/:id/fetch-messages
Body: {
  "chatId": "5491158647529@c.us",
  "limit": 50
}
```
*Referencia: wwebjs-api/src/routes.js linea 136*

### Estado del Cliente
```http
GET /api/agents/:id/status
```
*Referencia: wwebjs-api/src/routes.js linea 84*

---

## 🎨 Patrones de UI (FreeBirdsCrew React Frontend)

### Estructura de Componentes
- **LiveLogs.jsx**: Muestra mensajes en tiempo real con animaciones (framer-motion)
  - Incluye diferenciación visual entre mensajes entrantes/salientes
  - Auto-scroll al último mensaje
  - Formateo de timestamps con `date-fns`
  
*Referencia: FreeBirdsCrew/frontend/src/components/LiveLogs.jsx*

### Patrón de WebSocket para Tiempo Real
```javascript
const socket = io('http://localhost:3001');
socket.on('message', (msg) => {
  setLogs(prev => [msg, ...prev].slice(0, 50));
});
```
*Referencia: FreeBirdsCrew/frontend/src/App.jsx lineas 12, 27-29*

### Estilos y Layout
- Uso de Tailwind CSS para estilos rápidos
- Patrón de "glass morphism" para tarjetas
- Grid responsive para dashboard
- Iconos con `lucide-react`

---

## 🤖 Lógica de Handoff (Nuestro Proyecto Actual)

### Detección de Handoff
```javascript
// En lib/agent-manager.js linea 463-474
if (message.body.toLowerCase().includes('agente humano') || 
    message.body.toLowerCase().includes('hablar con persona')) {
    pausarUsuario(userId, 'handoff_solicitado');
    this.statsManager.registrarHandoff(userId, 'handoff_solicitado');
}
```

### Estado de Usuarios Pausados
- Endpoint: `GET /api/agents/:id/paused`
- Devuelve lista de usuarios con: userId, tiempo pausado, razón
- Reanudar: `POST /api/agents/:id/resume/:userId`

---

## 💡 Ideas para Implementar

### 1. Estructura de la Página (human-panel.html)
```
┌─────────────────────────────────────────────────┐
│  Header: "Panel de Agente Humano - Dolce Party" │
├──────────┬──────────────────────────────────────┤
│          │                                     │
│ Lista    │    Chat Area (tipo WhatsApp Web)    │
│ de       │                                     │
│ Chats    │  ┌─────────────────────────────┐    │
│          │  │ Mensajes (usuario + bot)   │    │
│ - Handoff│  │ - usuario: "Hola"          │    │
│ - Activos│  │ - bot: "Hola, soy IA"     │    │
│ - Cerrados│  │ - HUMANO: "Te ayudo"      │    │
│          │  └─────────────────────────────┘    │
│          │  [Input para escribir mensaje]     │
└──────────┴──────────────────────────────────────┘
```

### 2. Backend (dashboard-central.js) - Nuevos Endpoints
- `GET /api/agents/:id/handoffs` - Lista handoffs activos
- `POST /api/agents/:id/send-human-message` - Enviar como humano
- `POST /api/agents/:id/resolve-handoff/:userId` - Resolver handoff

### 3. Frontend - Funcionalidades
- **Lista izquierda**: Chats con handoff solicitado (tiempo real vía WebSocket)
- **Chat central**: 
  - Mensajes históricos (usuario + bot + humano marcados como "🧑‍💼")
  - Input para que el humano escriba
  - Botón "Enviar" o Enter para enviar
- **Header del chat**: Info del usuario, botón "Resolver Handoff" (reanuda bot)

### 4. Integración WebSocket
- Escuchar evento `new-handoff` para notificaciones en tiempo real
- Escuchar `new-message` para actualizar chat abierto
- Emitir `human-message-sent` al enviar

### 5. Estilos Sugeridos (Basado en FreeBirdsCrew)
- Burbujas de mensajes diferenciadas por tipo:
  - 👤 Usuario: Alineado izquierda, fondo gris
  - 🤖 Bot: Alineado derecha, fondo azul/verde
  - 🧑‍💼 Humano: Alineado derecha, fondo naranja/destacado
- Scroll automático al último mensaje
- Timestamps relativos ("hace 2 min", "ahora")

---

## 📋 Próximos Pasos (Después de Mejorar esta Referencia)

1. **Mejorar este documento** agregando:
   - Esquemas de base de datos necesarios
   - Diagramas de flujo de handoff
   - Manejo de múltiples agentes humanos
   
2. **Planificar implementación detallada**
   
3. **Implementar paso a paso**

---

## 🔍 Notas Adicionales

### De whatsapp-llm-alert-bot
- Uso simple de `client.sendMessage(MY_ID, mensaje)` para alertas
- El bot puede enviar mensajes a cualquier número usando el cliente de WhatsApp
- *Referencia: whatsapp-llm-alert-bot/index.js lineas 84-90*

### De wwebjs-api (server.js)
- Soporta WebSocket para actualizaciones en tiempo real
- Manejo de múltiples sesiones simultáneas
- *Referencia: wwebjs-api/server.js lineas 22-25*

---

**Fecha de creación**: 2026-05-01  
**Autor**: Basado en investigación de proyectos de referencia
