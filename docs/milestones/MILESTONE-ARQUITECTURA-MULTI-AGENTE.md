# MILESTONE: Arquitectura Multi-Agente Escalable

## 🎯 OBJETIVO

Transformar el sistema actual de bot único a una arquitectura multi-agente escalable que soporte:
- Múltiples instancias de bot (1 por local)
- Dashboard centralizado con vista de todos los agentes
- Control y supervisión desde nivel superior
- Preparación para migración a modelo local

---

## 📊 SITUACIÓN ACTUAL

### **Sistema Actual (Single-Agent)**
```
┌─────────────────────────────────────┐
│         Bot Único (bot.js)          │
│  - Puerto 3002 (API interna)        │
│  - WhatsApp conectado               │
│  - Gemini AI                        │
│  - data/ (local)                    │
│  - logs/ (local)                    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Dashboard (dashboard.js)       │
│  - Puerto 3001                      │
│  - Lee data/ directamente           │
└─────────────────────────────────────┘
```

**Limitaciones:**
- ❌ Solo 1 local soportado
- ❌ No hay separación de datos por local
- ❌ Dashboard no puede ver múltiples agentes
- ❌ No hay control centralizado
- ❌ Acoplamiento fuerte entre componentes

---

## 🏗️ ARQUITECTURA PROPUESTA (Multi-Agent)

### **Fase 1: Arquitectura Multi-Agente**

```
┌─────────────────────────────────────────────────────────────┐
│              DASHBOARD CENTRALIZADO                         │
│                  (Puerto 3000)                              │
│                                                             │
│  - Vista de todos los agentes                              │
│  - Estadísticas consolidadas                               │
│  - Control global (pausar todos, etc.)                     │
│  - Gestión de configuración por agente                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
              ┌─────────────┴─────────────┐
              ↓                           ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│   AGENTE 1: Santa Ana    │  │   AGENTE 2: [Local 2]   │
│   (Puerto 3001)          │  │   (Puerto 3002)          │
│                          │  │                          │
│  - Bot WhatsApp          │  │  - Bot WhatsApp          │
│  - API interna           │  │  - API interna           │
│  - Gemini AI             │  │  - Gemini AI             │
│  - data/santa-ana/       │  │  - data/local-2/         │
│  - logs/santa-ana/       │  │  - logs/local-2/         │
│  - catalogo-santa-ana.js │  │  - catalogo-local-2.js   │
└──────────────────────────┘  └──────────────────────────┘
```

---

## 📋 FASES DE IMPLEMENTACIÓN

### **FASE 1: Preparación de Infraestructura**
**Objetivo:** Hacer el código actual multi-tenant ready

#### 1.1 Configuración por Agente
```javascript
// config/agents.json
{
  "agents": [
    {
      "id": "santa-ana",
      "name": "Dolce Party - Santa Ana",
      "phone": "5493518559145",
      "port": 3001,
      "apiPort": 3011,
      "dataDir": "data/santa-ana",
      "logsDir": "logs/santa-ana",
      "catalogFile": "catalogo-santa-ana.js",
      "enabled": true,
      "config": {
        "direccion": "Sta. Ana 2637, X5010EEK Córdoba",
        "telefono": "0351 855-9145",
        "horario": "Lunes a Sábado: 9:00 a 20:00hs | Domingo: Cerrado"
      }
    },
    {
      "id": "local-2",
      "name": "Dolce Party - [Nombre Local 2]",
      "phone": "549XXXXXXXXXX",
      "port": 3002,
      "apiPort": 3012,
      "dataDir": "data/local-2",
      "logsDir": "logs/local-2",
      "catalogFile": "catalogo-local-2.js",
      "enabled": false,
      "config": {
        "direccion": "[Dirección Local 2]",
        "telefono": "[Teléfono Local 2]",
        "horario": "[Horario Local 2]"
      }
    }
  ]
}
```

#### 1.2 Refactorización de Estructura de Datos
```
data/
├── santa-ana/
│   ├── estadisticas.json
│   ├── historial.json
│   └── pausas.json
├── local-2/
│   ├── estadisticas.json
│   ├── historial.json
│   └── pausas.json
└── global/
    └── config.json

logs/
├── santa-ana/
│   ├── bot.log
│   └── security.log
└── local-2/
    ├── bot.log
    └── security.log

catalogs/
├── catalogo-santa-ana.js
└── catalogo-local-2.js
```

#### 1.3 Clase AgentManager
```javascript
// lib/agent-manager.js
class AgentManager {
  constructor(agentConfig) {
    this.id = agentConfig.id;
    this.name = agentConfig.name;
    this.config = agentConfig.config;
    this.dataDir = agentConfig.dataDir;
    this.logsDir = agentConfig.logsDir;
    this.catalogFile = agentConfig.catalogFile;
    this.port = agentConfig.port;
    this.apiPort = agentConfig.apiPort;
  }

  async initialize() {
    // Crear directorios si no existen
    // Cargar catálogo específico
    // Inicializar cliente WhatsApp
    // Inicializar API interna
  }

  async start() {
    // Iniciar bot
    // Iniciar API
  }

  async stop() {
    // Detener bot
    // Cerrar conexiones
  }

  getStats() {
    // Retornar estadísticas del agente
  }
}
```

---

### **FASE 2: Dashboard Centralizado**
**Objetivo:** Dashboard que controle todos los agentes

#### 2.1 Dashboard Multi-Agente
```javascript
// dashboard-central.js (Puerto 3000)

// Vista consolidada
GET /api/agents                    // Lista de todos los agentes
GET /api/agents/:id/stats          // Stats de un agente específico
GET /api/stats/consolidated        // Stats de todos los agentes

// Control individual
POST /api/agents/:id/pause         // Pausar agente específico
POST /api/agents/:id/resume        // Reanudar agente específico
POST /api/agents/:id/restart       // Reiniciar agente

// Control global
POST /api/global/pause-all         // Pausar todos los agentes
POST /api/global/resume-all        // Reanudar todos los agentes

// Configuración
GET /api/agents/:id/config         // Ver config de agente
PUT /api/agents/:id/config         // Actualizar config de agente
```

#### 2.2 Frontend Multi-Agente
```html
<!-- Vista del Dashboard Central -->
<div class="dashboard-central">
  <!-- Selector de agente -->
  <select id="agent-selector">
    <option value="all">Todos los agentes</option>
    <option value="santa-ana">Santa Ana</option>
    <option value="local-2">Local 2</option>
  </select>

  <!-- Estadísticas consolidadas -->
  <div class="stats-consolidated">
    <div class="stat">Total Mensajes: 1,234</div>
    <div class="stat">Total Usuarios: 456</div>
    <div class="stat">Agentes Activos: 2/2</div>
  </div>

  <!-- Lista de agentes -->
  <div class="agents-list">
    <div class="agent-card" data-agent="santa-ana">
      <h3>Santa Ana</h3>
      <span class="status active">Activo</span>
      <div class="agent-stats">
        <p>Mensajes hoy: 567</p>
        <p>Usuarios: 123</p>
      </div>
      <button onclick="pauseAgent('santa-ana')">Pausar</button>
    </div>
    
    <div class="agent-card" data-agent="local-2">
      <h3>Local 2</h3>
      <span class="status inactive">Inactivo</span>
      <div class="agent-stats">
        <p>Mensajes hoy: 667</p>
        <p>Usuarios: 333</p>
      </div>
      <button onclick="resumeAgent('local-2')">Reanudar</button>
    </div>
  </div>
</div>
```

---

### **FASE 3: Sistema de Orquestación**
**Objetivo:** Gestionar múltiples instancias de bot

#### 3.1 Orchestrator Service
```javascript
// orchestrator.js
class BotOrchestrator {
  constructor() {
    this.agents = new Map();
    this.config = this.loadConfig();
  }

  async startAll() {
    for (const agentConfig of this.config.agents) {
      if (agentConfig.enabled) {
        await this.startAgent(agentConfig.id);
      }
    }
  }

  async startAgent(agentId) {
    const config = this.getAgentConfig(agentId);
    const agent = new AgentManager(config);
    await agent.initialize();
    await agent.start();
    this.agents.set(agentId, agent);
  }

  async stopAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      await agent.stop();
      this.agents.delete(agentId);
    }
  }

  async restartAgent(agentId) {
    await this.stopAgent(agentId);
    await this.startAgent(agentId);
  }

  getAgentStats(agentId) {
    const agent = this.agents.get(agentId);
    return agent ? agent.getStats() : null;
  }

  getAllStats() {
    const stats = {};
    for (const [id, agent] of this.agents) {
      stats[id] = agent.getStats();
    }
    return stats;
  }
}
```

#### 3.2 Scripts de Gestión
```bash
# start-all-agents.bat
node orchestrator.js start-all

# start-agent.bat [agent-id]
node orchestrator.js start santa-ana

# stop-agent.bat [agent-id]
node orchestrator.js stop santa-ana

# restart-agent.bat [agent-id]
node orchestrator.js restart santa-ana

# status.bat
node orchestrator.js status
```

---

### **FASE 4: Preparación para Modelo Local**
**Objetivo:** Abstraer la capa de IA para fácil migración

#### 4.1 Interfaz de IA Abstracta
```javascript
// lib/ai-provider.js
class AIProvider {
  constructor(config) {
    this.type = config.type; // 'gemini', 'openrouter', 'local'
    this.config = config;
  }

  async generateResponse(prompt, context) {
    throw new Error('Must implement generateResponse');
  }
}

// lib/ai-providers/gemini-provider.js
class GeminiProvider extends AIProvider {
  async generateResponse(prompt, context) {
    // Implementación actual con Gemini
  }
}

// lib/ai-providers/local-provider.js
class LocalProvider extends AIProvider {
  constructor(config) {
    super(config);
    this.modelPath = config.modelPath;
    this.endpoint = config.endpoint; // http://localhost:11434 (Ollama)
  }

  async generateResponse(prompt, context) {
    // Implementación con modelo local (Ollama, LM Studio, etc.)
    const response = await fetch(`${this.endpoint}/api/generate`, {
      method: 'POST',
      body: JSON.stringify({
        model: this.modelPath,
        prompt: prompt,
        context: context
      })
    });
    return response.json();
  }
}

// Configuración por agente
{
  "agents": [
    {
      "id": "santa-ana",
      "ai": {
        "type": "gemini",
        "apiKey": "...",
        "model": "gemini-2.5-flash"
      }
    },
    {
      "id": "local-2",
      "ai": {
        "type": "local",
        "endpoint": "http://localhost:11434",
        "modelPath": "llama3:8b"
      }
    }
  ]
}
```

---

## 📊 ESTRUCTURA DE ARCHIVOS PROPUESTA

```
whatsapp-bot/
├── config/
│   ├── agents.json              # Configuración de todos los agentes
│   └── global.json              # Configuración global
├── lib/
│   ├── agent-manager.js         # Gestor de agente individual
│   ├── orchestrator.js          # Orquestador de múltiples agentes
│   ├── ai-provider.js           # Interfaz abstracta de IA
│   ├── ai-providers/
│   │   ├── gemini-provider.js   # Implementación Gemini
│   │   ├── openrouter-provider.js
│   │   └── local-provider.js    # Implementación modelo local
│   ├── statistics.js            # Sistema de estadísticas (multi-tenant)
│   ├── file-manager.js          # Gestión de archivos (multi-tenant)
│   └── ...
├── data/
│   ├── santa-ana/               # Datos del agente 1
│   ├── local-2/                 # Datos del agente 2
│   └── global/                  # Datos globales
├── logs/
│   ├── santa-ana/               # Logs del agente 1
│   ├── local-2/                 # Logs del agente 2
│   └── orchestrator.log         # Logs del orquestador
├── catalogs/
│   ├── catalogo-santa-ana.js    # Catálogo específico
│   └── catalogo-local-2.js      # Catálogo específico
├── public/
│   ├── dashboard-central/       # Dashboard centralizado
│   └── dashboard-agent/         # Dashboard por agente (legacy)
├── orchestrator.js              # Punto de entrada del orquestador
├── dashboard-central.js         # Dashboard centralizado
└── package.json
```

---

## 🎯 ROADMAP DE IMPLEMENTACIÓN

### **Sprint 1: Preparación (1-2 días)**
- [ ] Crear estructura de carpetas multi-tenant
- [ ] Crear `config/agents.json`
- [ ] Refactorizar rutas de archivos para soportar múltiples agentes
- [ ] Crear clase `AgentManager`

### **Sprint 2: Multi-Agente Básico (2-3 días)**
- [ ] Implementar `orchestrator.js`
- [ ] Adaptar `bot.js` para recibir configuración de agente
- [ ] Probar 2 instancias corriendo simultáneamente
- [ ] Scripts de gestión (start, stop, restart)

### **Sprint 3: Dashboard Centralizado (2-3 días)**
- [ ] Crear `dashboard-central.js`
- [ ] API para gestión de múltiples agentes
- [ ] Frontend con vista consolidada
- [ ] Control individual y global de agentes

### **Sprint 4: Abstracción de IA (1-2 días)**
- [ ] Crear interfaz `AIProvider`
- [ ] Implementar `GeminiProvider` (migrar código actual)
- [ ] Implementar `LocalProvider` (preparación)
- [ ] Configuración de IA por agente

### **Sprint 5: Testing y Documentación (1-2 días)**
- [ ] Testing de múltiples agentes simultáneos
- [ ] Testing de dashboard centralizado
- [ ] Documentación de configuración
- [ ] Guía de despliegue

---

## 🔧 CONFIGURACIÓN DE EJEMPLO

### **Escenario: 2 Locales**

```json
// config/agents.json
{
  "agents": [
    {
      "id": "santa-ana",
      "name": "Dolce Party - Santa Ana",
      "phone": "5493518559145",
      "port": 3001,
      "apiPort": 3011,
      "dataDir": "data/santa-ana",
      "logsDir": "logs/santa-ana",
      "catalogFile": "catalogs/catalogo-santa-ana.js",
      "enabled": true,
      "ai": {
        "type": "gemini",
        "apiKey": "${GEMINI_API_KEY}",
        "model": "gemini-2.5-flash"
      },
      "config": {
        "direccion": "Sta. Ana 2637, X5010EEK Córdoba",
        "telefono": "0351 855-9145",
        "horario": "Lunes a Sábado: 9:00 a 20:00hs | Domingo: Cerrado",
        "adminNumbers": ["5491158647529", "5493513782559"]
      }
    },
    {
      "id": "centro",
      "name": "Dolce Party - Centro",
      "phone": "549351XXXXXXX",
      "port": 3002,
      "apiPort": 3012,
      "dataDir": "data/centro",
      "logsDir": "logs/centro",
      "catalogFile": "catalogs/catalogo-centro.js",
      "enabled": true,
      "ai": {
        "type": "gemini",
        "apiKey": "${GEMINI_API_KEY}",
        "model": "gemini-2.5-flash"
      },
      "config": {
        "direccion": "[Dirección Centro]",
        "telefono": "[Teléfono Centro]",
        "horario": "Lunes a Sábado: 10:00 a 21:00hs | Domingo: Cerrado",
        "adminNumbers": ["549XXXXXXXXXX"]
      }
    }
  ],
  "dashboard": {
    "port": 3000,
    "enabled": true
  }
}
```

---

## 📊 MÉTRICAS DE ÉXITO

### **Funcionales:**
- ✅ 2+ agentes corriendo simultáneamente
- ✅ Dashboard centralizado mostrando todos los agentes
- ✅ Control individual y global funcionando
- ✅ Datos separados por agente
- ✅ Logs separados por agente

### **Técnicas:**
- ✅ Sin conflictos de puertos
- ✅ Sin conflictos de datos
- ✅ Fácil agregar nuevos agentes
- ✅ Fácil migrar a modelo local
- ✅ Código mantenible y escalable

### **Operacionales:**
- ✅ Scripts de gestión funcionando
- ✅ Documentación completa
- ✅ Fácil despliegue
- ✅ Monitoreo centralizado

---

## 🚀 MIGRACIÓN DESDE SISTEMA ACTUAL

### **Paso 1: Backup**
```bash
# Backup de datos actuales
cp -r data/ data-backup/
cp -r logs/ logs-backup/
```

### **Paso 2: Migración de Datos**
```bash
# Mover datos a estructura multi-tenant
mkdir -p data/santa-ana
mv data/*.json data/santa-ana/
mkdir -p logs/santa-ana
mv logs/*.log logs/santa-ana/
```

### **Paso 3: Actualizar Configuración**
```bash
# Crear config/agents.json con datos del agente actual
# Actualizar .env si es necesario
```

### **Paso 4: Probar**
```bash
# Iniciar con nuevo sistema
node orchestrator.js start santa-ana

# Verificar que funciona igual que antes
# Verificar dashboard en puerto 3000
```

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **Revisar y aprobar este milestone**
2. **Definir nombre y configuración del segundo local**
3. **Decidir prioridad de implementación**
4. **Asignar recursos y tiempo**

---

## 📝 NOTAS ADICIONALES

### **Consideraciones de Modelo Local:**
- **Ollama**: Fácil de instalar, soporta Llama 3, Mistral, etc.
- **LM Studio**: GUI amigable, buen rendimiento
- **Requisitos**: GPU recomendada (8GB+ VRAM para modelos 7B-13B)
- **Latencia**: Modelo local será más lento que Gemini
- **Costo**: $0 después de setup inicial

### **Escalabilidad Futura:**
- Sistema preparado para 10+ agentes
- Posibilidad de clustering (múltiples servidores)
- Load balancing si es necesario
- Monitoreo centralizado con métricas

---

**Milestone creado el 28/04/2026**  
*Arquitectura Multi-Agente Escalable para Dolce Party*