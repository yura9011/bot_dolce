# 🏗️ ARQUITECTURA VISUAL - Sistema Multi-Agente

## 📊 Diagrama de Arquitectura Completa

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         👤 USUARIO / ADMINISTRADOR                      │
│                                                                         │
└────────────────┬────────────────────────────────┬───────────────────────┘
                 │                                │
                 │ CLI                            │ Browser
                 │                                │
┌────────────────▼────────────────┐  ┌───────────▼────────────────────────┐
│                                 │  │                                    │
│      ORCHESTRATOR.JS            │  │     DASHBOARD CENTRAL              │
│      (Gestión de Agentes)       │  │     (Monitoreo Unificado)          │
│                                 │  │                                    │
│  • node orchestrator.js list    │  │  • http://localhost:3000           │
│  • node orchestrator.js start   │  │  • Vista de todos los agentes      │
│  • node orchestrator.js stop    │  │  • Estadísticas en tiempo real     │
│                                 │  │  • Auto-refresh cada 10s           │
│                                 │  │                                    │
└────────────────┬────────────────┘  └───────────┬────────────────────────┘
                 │                                │
                 │ Gestiona                       │ HTTP Requests
                 │                                │
        ┌────────┴────────┬──────────────────────┴─────────┐
        │                 │                                 │
        │                 │                                 │
┌───────▼────────┐ ┌──────▼─────────┐ ┌──────────────────▼──────────────┐
│                │ │                │ │                                 │
│  AGENTE 1      │ │  AGENTE 2      │ │  AGENTE N                       │
│  Santa Ana     │ │  Local 2       │ │  (Futuros locales)              │
│                │ │                │ │                                 │
│  Port: 3011    │ │  Port: 3012    │ │  Port: 301X                     │
│                │ │                │ │                                 │
└───────┬────────┘ └──────┬─────────┘ └──────────────────┬──────────────┘
        │                 │                                │
        │                 │                                │
        └─────────────────┴────────────────────────────────┘
                          │
                          │ Cada agente tiene:
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼                                   ▼
┌───────────────────┐            ┌──────────────────────┐
│                   │            │                      │
│  WHATSAPP CLIENT  │            │    API REST          │
│                   │            │                      │
│  • Sesión propia  │            │  GET  /status        │
│  • QR Code        │            │  GET  /stats         │
│  • Mensajes       │            │  POST /pause/:userId │
│  • Estados        │            │  POST /resume/:userId│
│                   │            │  POST /pause-global  │
└─────────┬─────────┘            │  POST /resume-global │
          │                      │                      │
          │                      └──────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              MÓDULOS INTERNOS DEL AGENTE                │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   LLM        │  │  Catálogo    │  │  Security    │ │
│  │  (Gemini)    │  │  (RAG)       │  │  (Hijacking) │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Moderation  │  │  Statistics  │  │  Control     │ │
│  │  (Contenido) │  │  (Métricas)  │  │  (Pausas)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Admin       │  │  Flujos      │  │  Logging     │ │
│  │  (Comandos)  │  │  (Estados)   │  │  (Registros) │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Almacena en:
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼                                   ▼
┌───────────────────┐            ┌──────────────────────┐
│                   │            │                      │
│   DATA/           │            │    LOGS/             │
│   [agent-id]/     │            │    [agent-id]/       │
│                   │            │                      │
│  • estadisticas   │            │  • bot.log           │
│  • historial      │            │  • security.log      │
│  • pausas         │            │                      │
│                   │            │                      │
└───────────────────┘            └──────────────────────┘
```

---

## 🔄 Flujo de Mensajes

```
┌──────────────┐
│   CLIENTE    │
│  (WhatsApp)  │
└──────┬───────┘
       │
       │ 1. Envía mensaje
       │
       ▼
┌──────────────────────────────────────────┐
│         WHATSAPP CLIENT                  │
│         (lib/agent-manager.js)           │
└──────┬───────────────────────────────────┘
       │
       │ 2. Evento "message"
       │
       ▼
┌──────────────────────────────────────────┐
│    handleIncomingMessage()               │
│                                          │
│  • Validar tipo de mensaje               │
│  • Control de debounce                   │
│  • Registrar en estadísticas             │
│  • Guardar en historial                  │
└──────┬───────────────────────────────────┘
       │
       │ 3. Verificar permisos
       │
       ▼
┌──────────────────────────────────────────┐
│    Verificaciones de Seguridad           │
│                                          │
│  • ¿Es comando admin?                    │
│  • ¿Bot pausado globalmente?             │
│  • ¿Usuario pausado?                     │
└──────┬───────────────────────────────────┘
       │
       │ 4. Procesar según estado
       │
       ▼
┌──────────────────────────────────────────┐
│    Máquina de Estados                    │
│                                          │
│  • INICIAL → Bienvenida                  │
│  • ESPERANDO_NOMBRE → Registrar          │
│  • MENU_PRINCIPAL → Opciones             │
│  • PEDIDO → Procesar con IA              │
│  • MENU_PAQUETERIA → Info envíos         │
└──────┬───────────────────────────────────┘
       │
       │ 5. Si es PEDIDO:
       │
       ▼
┌──────────────────────────────────────────┐
│    handlePedidoFlow()                    │
│                                          │
│  1. Anti-hijacking                       │
│  2. Moderación de contenido              │
│  3. Detección de handoff                 │
│  4. Búsqueda en catálogo (RAG)           │
│  5. Llamada a LLM (Gemini)               │
│  6. Generar respuesta                    │
└──────┬───────────────────────────────────┘
       │
       │ 6. Responder
       │
       ▼
┌──────────────────────────────────────────┐
│    responderBot()                        │
│                                          │
│  • Enviar mensaje a WhatsApp             │
│  • Registrar en estadísticas             │
│  • Guardar en historial                  │
└──────┬───────────────────────────────────┘
       │
       │ 7. Mensaje enviado
       │
       ▼
┌──────────────┐
│   CLIENTE    │
│  (WhatsApp)  │
└──────────────┘
```

---

## 📁 Estructura de Datos por Agente

```
data/[agent-id]/
│
├── estadisticas.json
│   └── {
│         "mensajes": {
│           "2026-04-30": {
│             "recibidos": 45,
│             "enviados": 52
│           }
│         },
│         "handoffs": { ... },
│         "hijacking": { ... },
│         "busquedas": { ... }
│       }
│
├── historial.json
│   └── {
│         "5491158647529@c.us": [
│           {
│             "timestamp": "2026-04-30T10:30:00Z",
│             "role": "user",
│             "message": "Hola"
│           },
│           {
│             "timestamp": "2026-04-30T10:30:01Z",
│             "role": "bot",
│             "message": "¡Hola! Bienvenido..."
│           }
│         ]
│       }
│
└── pausas.json
    └── {
          "global": false,
          "usuarios": {
            "5491158647529@c.us": {
              "pausado": true,
              "razon": "handoff_solicitado",
              "timestamp": "2026-04-30T10:35:00Z"
            }
          }
        }
```

---

## 🔌 API REST de Cada Agente

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              API REST (Express.js)                      │
│              Puerto: 301X                               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  GET /status                                            │
│  ├─ Retorna: { agentId, name, isRunning, timestamp }   │
│  └─ Uso: Verificar si el agente está activo            │
│                                                         │
│  GET /stats                                             │
│  ├─ Retorna: { mensajes, handoffs, hijacking, ... }    │
│  └─ Uso: Obtener estadísticas del agente               │
│                                                         │
│  POST /pause/:userId                                    │
│  ├─ Parámetro: userId (ej: 5491158647529@c.us)         │
│  ├─ Retorna: { success, message }                      │
│  └─ Uso: Pausar usuario específico                     │
│                                                         │
│  POST /resume/:userId                                   │
│  ├─ Parámetro: userId                                  │
│  ├─ Retorna: { success, message }                      │
│  └─ Uso: Reanudar usuario específico                   │
│                                                         │
│  POST /pause-global                                     │
│  ├─ Retorna: { success, message }                      │
│  └─ Uso: Pausar bot globalmente                        │
│                                                         │
│  POST /resume-global                                    │
│  ├─ Retorna: { success, message }                      │
│  └─ Uso: Reanudar bot globalmente                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Flujo de Inicio de Agente

```
┌──────────────────────────────────────────┐
│  node orchestrator.js start santa-ana    │
└──────┬───────────────────────────────────┘
       │
       │ 1. Cargar config/agents.json
       │
       ▼
┌──────────────────────────────────────────┐
│  Validar configuración del agente        │
│  • ¿Existe en config?                    │
│  • ¿Está habilitado?                     │
│  • ¿Ya está corriendo?                   │
└──────┬───────────────────────────────────┘
       │
       │ 2. Crear instancia de AgentManager
       │
       ▼
┌──────────────────────────────────────────┐
│  new AgentManager(agentConfig)           │
│  • Cargar configuración                  │
│  • Crear directorios                     │
│  • Cargar catálogo                       │
│  • Inicializar estado                    │
└──────┬───────────────────────────────────┘
       │
       │ 3. Inicializar WhatsApp
       │
       ▼
┌──────────────────────────────────────────┐
│  initializeWhatsApp()                    │
│  • Crear cliente WhatsApp                │
│  • Configurar eventos                    │
│  • Inicializar sesión                    │
└──────┬───────────────────────────────────┘
       │
       │ 4. Generar QR Code
       │
       ▼
┌──────────────────────────────────────────┐
│  Evento "qr"                             │
│  • Mostrar QR en consola                 │
│  • Esperar escaneo                       │
└──────┬───────────────────────────────────┘
       │
       │ 5. Usuario escanea QR
       │
       ▼
┌──────────────────────────────────────────┐
│  Evento "authenticated"                  │
│  • Sesión autenticada                    │
│  • Guardar credenciales                  │
└──────┬───────────────────────────────────┘
       │
       │ 6. Conexión establecida
       │
       ▼
┌──────────────────────────────────────────┐
│  Evento "ready"                          │
│  • Bot conectado                         │
│  • Cargar estadísticas catálogo          │
│  • Cargar estado de pausas               │
│  • Configurar manejadores de mensajes    │
└──────┬───────────────────────────────────┘
       │
       │ 7. Inicializar API REST
       │
       ▼
┌──────────────────────────────────────────┐
│  initializeAPI()                         │
│  • Crear servidor Express                │
│  • Configurar endpoints                  │
│  • Iniciar en puerto configurado         │
└──────┬───────────────────────────────────┘
       │
       │ 8. Agente listo
       │
       ▼
┌──────────────────────────────────────────┐
│  ✅ Agente corriendo                     │
│  • Escuchando mensajes de WhatsApp       │
│  • API REST disponible                   │
│  • Estadísticas activas                  │
└──────────────────────────────────────────┘
```

---

## 🎨 Dashboard Central - Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              DASHBOARD CENTRAL                          │
│              http://localhost:3000                      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  BACKEND (dashboard-central.js)                         │
│  ├─ Express.js server                                   │
│  ├─ GET /api/agents                                     │
│  │  └─ Lee config/agents.json                          │
│  ├─ GET /api/agents/:id/stats                           │
│  │  └─ Fetch a http://localhost:301X/stats             │
│  └─ GET /api/agents/:id/status                          │
│     └─ Fetch a http://localhost:301X/status            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  FRONTEND (public-central/index.html)                   │
│  ├─ HTML + CSS + JavaScript                            │
│  ├─ loadAgents()                                        │
│  │  └─ Fetch /api/agents                               │
│  ├─ createAgentCard(agent)                             │
│  │  ├─ Fetch /api/agents/:id/status                    │
│  │  └─ Fetch /api/agents/:id/stats                     │
│  └─ setInterval(loadAgents, 10000)                     │
│     └─ Auto-refresh cada 10 segundos                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Flujo de Seguridad

```
┌──────────────────────────────────────────┐
│  Mensaje entrante                        │
└──────┬───────────────────────────────────┘
       │
       │ 1. Validaciones básicas
       │
       ▼
┌──────────────────────────────────────────┐
│  • ¿Es de grupo? → Ignorar               │
│  • ¿Es estado de WhatsApp? → Ignorar     │
│  • ¿Es audio? → Rechazar                 │
│  • ¿Es notificación? → Ignorar           │
└──────┬───────────────────────────────────┘
       │
       │ 2. Control de spam
       │
       ▼
┌──────────────────────────────────────────┐
│  Debounce (300ms)                        │
│  • ¿Mensaje muy rápido? → Ignorar        │
└──────┬───────────────────────────────────┘
       │
       │ 3. Verificar permisos
       │
       ▼
┌──────────────────────────────────────────┐
│  • ¿Es admin? → Procesar comandos        │
│  • ¿Bot pausado? → Ignorar               │
│  • ¿Usuario pausado? → Ignorar           │
└──────┬───────────────────────────────────┘
       │
       │ 4. Si es pedido:
       │
       ▼
┌──────────────────────────────────────────┐
│  Anti-hijacking                          │
│  • Detectar prompt injection             │
│  • Detectar role manipulation            │
│  • Detectar system override              │
│  → Si detecta: Respuesta genérica        │
└──────┬───────────────────────────────────┘
       │
       │ 5. Moderación
       │
       ▼
┌──────────────────────────────────────────┐
│  Moderación de contenido                 │
│  • Temas prohibidos                      │
│  • Lenguaje ofensivo                     │
│  → Si detecta: Mensaje de advertencia    │
└──────┬───────────────────────────────────┘
       │
       │ 6. Validación de longitud
       │
       ▼
┌──────────────────────────────────────────┐
│  • ¿Mensaje muy largo? (>500 chars)      │
│  → Si: Pedir mensaje más corto           │
└──────┬───────────────────────────────────┘
       │
       │ 7. Procesar mensaje
       │
       ▼
┌──────────────────────────────────────────┐
│  ✅ Mensaje seguro, procesar             │
└──────────────────────────────────────────┘
```

---

## 📊 Flujo de Estadísticas

```
┌──────────────────────────────────────────┐
│  Evento (mensaje, handoff, hijacking)    │
└──────┬───────────────────────────────────┘
       │
       │ 1. Registrar evento
       │
       ▼
┌──────────────────────────────────────────┐
│  lib/statistics.js                       │
│  • registrarMensaje()                    │
│  • registrarHandoff()                    │
│  • registrarHijacking()                  │
│  • registrarBusqueda()                   │
└──────┬───────────────────────────────────┘
       │
       │ 2. Leer archivo actual
       │
       ▼
┌──────────────────────────────────────────┐
│  data/[agent-id]/estadisticas.json       │
│  • Leer JSON existente                   │
│  • Si no existe, crear estructura        │
└──────┬───────────────────────────────────┘
       │
       │ 3. Actualizar contador
       │
       ▼
┌──────────────────────────────────────────┐
│  Incrementar contador del día            │
│  • Fecha: YYYY-MM-DD                     │
│  • Tipo: recibidos/enviados/handoffs    │
│  • Incrementar en 1                      │
└──────┬───────────────────────────────────┘
       │
       │ 4. Guardar archivo
       │
       ▼
┌──────────────────────────────────────────┐
│  fs.writeFileSync()                      │
│  • Escribir JSON actualizado             │
│  • Formato: JSON.stringify(data, null, 2)│
└──────┬───────────────────────────────────┘
       │
       │ 5. Disponible para consulta
       │
       ▼
┌──────────────────────────────────────────┐
│  GET /stats                              │
│  • Dashboard puede leer estadísticas     │
│  • Mostrar en tiempo real                │
└──────────────────────────────────────────┘
```

---

## 🎯 Resumen de Componentes

### Componentes Principales
1. **Orchestrator** - Gestión de agentes
2. **AgentManager** - Lógica de cada agente
3. **Dashboard Central** - Monitoreo unificado
4. **WhatsApp Client** - Conexión a WhatsApp
5. **API REST** - Control y estadísticas
6. **Módulos Internos** - LLM, Catálogo, Security, etc.

### Archivos de Configuración
1. **config/agents.json** - Configuración de agentes
2. **.env** - Variables de entorno
3. **catalogs/*.js** - Catálogos de productos

### Almacenamiento
1. **data/[agent-id]/** - Datos por agente
2. **logs/[agent-id]/** - Logs por agente
3. **.wwebjs_auth/** - Sesiones de WhatsApp

---

**Esta arquitectura permite escalabilidad infinita y gestión simplificada de múltiples locales. 🎈**
