# Onboarding — Agente nuevo al proyecto

## ¿Qué es este proyecto?

Un **dashboard centralizado** para gestionar múltiples bots de WhatsApp desde un solo lugar. Cada bot es un "agente" independiente. El dashboard permite monitorear conversaciones, ver estadísticas, gestionar pausas y operar un panel tipo WhatsApp Web para que un humano pueda intervenir en conversaciones activas.

---

## Arquitectura general

```
dashboard-central (Express + Socket.io)  ←→  Bot agente 1 (API interna)
     Puerto: 3000                         ←→  Bot agente 2 (API interna)
                                          ←→  Bot agente N (API interna)
```

- El **dashboard central** (puerto 3000) actúa como proxy/orquestador.
- Cada **agente bot** corre en su propio puerto y expone una API REST interna.
- La comunicación en tiempo real usa **WebSockets** (Socket.io).
- El frontend se sirve desde la carpeta `public-central/`.

---

## Estructura de archivos clave

```
/
├── dashboard-central.js        # Servidor principal (Express + Socket.io)
├── routes/
│   └── human-panel.js          # Endpoints del panel humano (handoffs, mensajes)
├── config/
│   ├── agents.json             # Configuración de todos los agentes
│   └── phone-aliases.json      # Alias amigables para números de teléfono
├── public-central/
│   ├── human-panel.html        # Vista del panel humano
│   ├── human-panel.js          # Lógica frontend del panel humano
│   └── agent-details.html      # Vista de detalles de un agente
└── .env                        # Variables de entorno
```

---

## Variables de entorno (.env)

| Variable | Descripción | Default |
|---|---|---|
| `DASHBOARD_CENTRAL_PORT` | Puerto del servidor | `3000` |
| `CORS_ORIGIN` | Origen permitido para CORS | `*` |
| `WS_UPDATE_INTERVAL` | Intervalo de actualización WebSocket en ms | `10000` |

---

## Configuración de agentes (config/agents.json)

Cada agente en el array debe tener esta estructura:

```json
{
  "id": "agente-1",
  "name": "Nombre visible",
  "enabled": true,
  "ports": {
    "api": 3001
  },
  "paths": {
    "data": "./data/agente-1"
  },
  "whatsappSession": "agente-1"
}
```

> **Importante:** El dashboard se comunica con cada agente via `http://localhost:{ports.api}`. Si un agente no está corriendo, sus endpoints devuelven valores vacíos silenciosamente (no rompen el servidor).

---

## Endpoints del dashboard central

### Agentes

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/agents` | Lista todos los agentes |
| GET | `/api/agents/:id/status` | Estado del agente (online/offline) |
| GET | `/api/agents/:id/stats` | Estadísticas desde archivo local |
| GET | `/api/agents/:id/stats/detailed` | Estadísticas desde API del agente |
| GET | `/api/agents/:id/conversations` | Conversaciones activas |
| GET | `/api/agents/:id/paused` | Usuarios pausados |
| GET | `/api/agents/:id/logs` | Logs recientes |
| GET | `/api/agents/:id/security` | Logs de seguridad |

### Control del bot

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/agents/:id/pause-global` | Pausar bot completo |
| POST | `/api/agents/:id/resume-global` | Reanudar bot completo |
| POST | `/api/agents/:id/resume/:userId` | Reanudar usuario específico |

### Panel humano (rutas en `/api/agents/`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/agents/:id/handoffs` | Usuarios esperando atención humana |
| POST | `/api/agents/:id/send-human-message` | Enviar mensaje como humano |
| POST | `/api/agents/:id/resolve-handoff/:userId` | Resolver handoff (reanudar usuario) |
| POST | `/api/agents/:id/fetch-messages` | Obtener mensajes de un chat |

### Vistas HTML

| Ruta | Descripción |
|---|---|
| `/human-panel/:id` | Panel tipo WhatsApp Web para el agente `:id` |
| `/agente/:id` | Detalles y estadísticas del agente `:id` |

---

## WebSocket — eventos en tiempo real

El servidor emite eventos con el patrón `agent_{id}_initial` (al conectar) y `agent_{id}_update` (cada N segundos).

**Payload de cada evento:**
```json
{
  "agentId": "agente-1",
  "stats": { ... },
  "conversations": [ ... ],
  "resumenPorNumero": [ ... ],
  "paused": [ ... ],
  "logs": [ ... ],
  "security": [ ... ]
}
```

El frontend escucha estos eventos y actualiza la UI sin recargar la página.

---

## Panel humano — cómo funciona

1. Se accede por `/human-panel/{id-del-agente}`
2. Carga las últimas **3 conversaciones** activas del agente
3. Al seleccionar un chat, muestra el historial de mensajes
4. El operador puede escribir mensajes que se envían con el prefijo `🧑‍💼 [Humano]:`
5. El bot queda pausado para ese usuario mientras hay un handoff activo

**Tipos de mensaje en el chat:**
- `user` → mensaje del cliente (burbuja derecha)
- `bot` → respuesta del bot (burbuja izquierda)
- `human` → intervención del operador humano (burbuja diferenciada)

---

## Bug conocido a resolver

En `public-central/human-panel.js`, el WebSocket hace `.slice(0, 3)` **antes** de buscar el chat seleccionado con `.find()`. Si el usuario activo no está entre los 3 primeros, sus mensajes nunca se actualizan en tiempo real.

**Líneas a corregir:**

```js
// ❌ ACTUAL — buggeado
socket.on(`agent_${selectedAgentId}_update`, (data) => {
    if (data.conversations) {
        updateChatsList(data.conversations.slice(0, 3));
        if (selectedUserId) {
            const chat = data.conversations.find(c => c.userId === selectedUserId);
            // Si el chat es el 4° o posterior, find() nunca lo encuentra
```

```js
// ✅ CORRECTO — guardar todas, truncar solo para la lista visual
socket.on(`agent_${selectedAgentId}_update`, (data) => {
    if (data.conversations) {
        updateChatsList(data.conversations.slice(0, 3)); // solo visual
        if (selectedUserId) {
            // Buscar en TODAS las conversaciones, no en las truncadas
            const chat = data.conversations.find(c => c.userId === selectedUserId);
            if (chat && chat.messages) {
                updateChatMessages(chat.messages);
            }
        }
    }
});
```

Lo mismo aplica al evento `_initial`.

---

## API que debe exponer cada agente bot

Para que el dashboard funcione, cada bot necesita estos endpoints en su puerto interno:

| Endpoint | Descripción |
|---|---|
| `GET /status` | `{ isRunning: boolean }` |
| `GET /stats` | Objeto con estadísticas |
| `GET /conversations?limit=0` | `{ conversaciones: [] }` |
| `GET /paused` | Array de usuarios pausados |
| `GET /logs?lines=N` | Array de líneas de log |
| `GET /security?lines=N` | Array de eventos de seguridad |
| `POST /pause-global` | Pausa el bot |
| `POST /resume-global` | Reanuda el bot |
| `POST /resume/:userId` | Reanuda usuario específico |
| `GET /stats/history/:days` | Historial de estadísticas |
| `GET /stats/searches?days=N` | Consultas frecuentes |
| `POST /message/sendMessage/:session` | Envía mensaje por WhatsApp |
| `POST /chat/fetchMessages/:session` | Obtiene mensajes de un chat |

---

## Primeros pasos al entrar al proyecto

1. **Leer** este documento completo
2. **Revisar** `config/agents.json` para entender qué agentes están configurados
3. **Arrancar** el servidor: `node dashboard-central.js`
4. **Verificar** que cada agente bot esté corriendo en su puerto correspondiente
5. **Abrir** `http://localhost:3000` para ver el dashboard
6. **Revisar** el bug del panel humano documentado arriba y corregirlo

---

*Última actualización basada en: `dashboard-central.js` y `routes/human-panel.js`*
