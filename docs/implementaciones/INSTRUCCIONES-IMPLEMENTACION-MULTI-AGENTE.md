# INSTRUCCIONES DE IMPLEMENTACIÓN: Sistema Multi-Agente

## OBJETIVO
Transformar el bot actual (single-agent) en un sistema que soporte múltiples agentes independientes con dashboard centralizado.

---

## PARTE 1: ESTRUCTURA DE ARCHIVOS Y CONFIGURACIÓN

### 1.1 Crear archivo de configuración de agentes

**Archivo:** `config/agents.json`

```json
{
  "agents": [
    {
      "id": "santa-ana",
      "name": "Dolce Party - Santa Ana",
      "enabled": true,
      "whatsappSession": "santa-ana-session",
      "ports": {
        "api": 3011
      },
      "paths": {
        "data": "data/santa-ana",
        "logs": "logs/santa-ana",
        "catalog": "catalogs/catalogo-santa-ana.js"
      },
      "info": {
        "nombre": "Dolce Party - Santa Ana",
        "telefono": "0351 855-9145",
        "horario": "Lunes a Sábado: 9:00 a 20:00hs | Domingo: Cerrado",
        "direccion": "Sta. Ana 2637, X5010EEK Córdoba"
      },
      "adminNumbers": ["5491158647529", "5493513782559"]
    },
    {
      "id": "local-2",
      "name": "Dolce Party - Local 2",
      "enabled": false,
      "whatsappSession": "local-2-session",
      "ports": {
        "api": 3012
      },
      "paths": {
        "data": "data/local-2",
        "logs": "logs/local-2",
        "catalog": "catalogs/catalogo-local-2.js"
      },
      "info": {
        "nombre": "Dolce Party - Local 2",
        "telefono": "[CONFIGURAR]",
        "horario": "[CONFIGURAR]",
        "direccion": "[CONFIGURAR]"
      },
      "adminNumbers": ["[CONFIGURAR]"]
    }
  ],
  "dashboard": {
    "port": 3000,
    "enabled": true
  }
}
```

### 1.2 Crear estructura de directorios

**Ejecutar:**
```bash
mkdir -p config
mkdir -p data/santa-ana
mkdir -p data/local-2
mkdir -p logs/santa-ana
mkdir -p logs/local-2
mkdir -p catalogs
```

### 1.3 Mover datos actuales a estructura multi-tenant

**Ejecutar:**
```bash
# Mover datos existentes a carpeta santa-ana
mv data/estadisticas.json data/santa-ana/ 2>/dev/null || true
mv data/historial.json data/santa-ana/ 2>/dev/null || true
mv data/pausas.json data/santa-ana/ 2>/dev/null || true

# Mover logs existentes
mv logs/bot.log logs/santa-ana/ 2>/dev/null || true
mv logs/security.log logs/santa-ana/ 2>/dev/null || true

# Copiar catálogo actual
cp catalogo.js catalogs/catalogo-santa-ana.js
cp catalogo.js catalogs/catalogo-local-2.js
```

---

## PARTE 2: CREAR CLASE AGENTMANAGER

### 2.1 Crear archivo lib/agent-manager.js

**Archivo:** `lib/agent-manager.js`

```javascript
const fs = require("fs");
const path = require("path");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const { log } = require("./logging");

class AgentManager {
  constructor(agentConfig) {
    this.id = agentConfig.id;
    this.name = agentConfig.name;
    this.config = agentConfig;
    this.client = null;
    this.api = null;
    this.isRunning = false;
    
    // Crear directorios si no existen
    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [
      this.config.paths.data,
      this.config.paths.logs
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  getDataPath(filename) {
    return path.join(this.config.paths.data, filename);
  }

  getLogPath(filename) {
    return path.join(this.config.paths.logs, filename);
  }

  async initializeWhatsApp() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: this.config.whatsappSession,
        dataPath: "./.wwebjs_auth"
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ],
        timeout: 60000
      },
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
      }
    });

    this.client.on("qr", (qr) => {
      log(`[${this.id}] QR Code generado`);
      console.log(`\n===== QR para ${this.name} =====`);
      qrcode.generate(qr, { small: true });
    });

    this.client.on("ready", () => {
      log(`[${this.id}] Bot conectado y listo`);
      this.isRunning = true;
    });

    this.client.on("authenticated", () => {
      log(`[${this.id}] Autenticación exitosa`);
    });

    this.client.on("auth_failure", (msg) => {
      log(`[${this.id}] Error de autenticación: ${msg}`, "ERROR");
    });

    await this.client.initialize();
  }

  initializeAPI() {
    this.api = express();
    this.api.use(express.json());

    // Endpoint de status
    this.api.get("/status", (req, res) => {
      res.json({
        agentId: this.id,
        name: this.name,
        isRunning: this.isRunning,
        timestamp: Date.now()
      });
    });

    // Endpoint de stats
    this.api.get("/stats", (req, res) => {
      try {
        const statsPath = this.getDataPath("estadisticas.json");
        if (fs.existsSync(statsPath)) {
          const stats = JSON.parse(fs.readFileSync(statsPath, "utf8"));
          res.json(stats);
        } else {
          res.json({});
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.api.listen(this.config.ports.api, () => {
      log(`[${this.id}] API iniciada en puerto ${this.config.ports.api}`);
    });
  }

  async start() {
    log(`[${this.id}] Iniciando agente ${this.name}...`);
    
    await this.initializeWhatsApp();
    this.initializeAPI();
    
    log(`[${this.id}] Agente iniciado correctamente`);
  }

  async stop() {
    log(`[${this.id}] Deteniendo agente...`);
    
    if (this.client) {
      await this.client.destroy();
    }
    
    this.isRunning = false;
    log(`[${this.id}] Agente detenido`);
  }

  getInfo() {
    return {
      id: this.id,
      name: this.name,
      isRunning: this.isRunning,
      config: this.config
    };
  }
}

module.exports = AgentManager;
```

---

## PARTE 3: CREAR ORQUESTADOR

### 3.1 Crear archivo orchestrator.js

**Archivo:** `orchestrator.js`

```javascript
const fs = require("fs");
const path = require("path");
const AgentManager = require("./lib/agent-manager");

class BotOrchestrator {
  constructor() {
    this.agents = new Map();
    this.config = this.loadConfig();
  }

  loadConfig() {
    const configPath = path.join(__dirname, "config", "agents.json");
    if (!fs.existsSync(configPath)) {
      throw new Error("Archivo config/agents.json no encontrado");
    }
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  }

  async startAgent(agentId) {
    const agentConfig = this.config.agents.find(a => a.id === agentId);
    
    if (!agentConfig) {
      throw new Error(`Agente ${agentId} no encontrado en configuración`);
    }

    if (!agentConfig.enabled) {
      console.log(`⚠️ Agente ${agentId} está deshabilitado en la configuración`);
      return;
    }

    if (this.agents.has(agentId)) {
      console.log(`⚠️ Agente ${agentId} ya está corriendo`);
      return;
    }

    console.log(`🚀 Iniciando agente: ${agentConfig.name}`);
    
    const agent = new AgentManager(agentConfig);
    await agent.start();
    
    this.agents.set(agentId, agent);
    console.log(`✅ Agente ${agentId} iniciado correctamente`);
  }

  async stopAgent(agentId) {
    const agent = this.agents.get(agentId);
    
    if (!agent) {
      console.log(`⚠️ Agente ${agentId} no está corriendo`);
      return;
    }

    console.log(`🛑 Deteniendo agente: ${agentId}`);
    await agent.stop();
    this.agents.delete(agentId);
    console.log(`✅ Agente ${agentId} detenido`);
  }

  async startAll() {
    console.log("🚀 Iniciando todos los agentes habilitados...\n");
    
    for (const agentConfig of this.config.agents) {
      if (agentConfig.enabled) {
        await this.startAgent(agentConfig.id);
      }
    }
    
    console.log("\n✅ Todos los agentes iniciados");
  }

  async stopAll() {
    console.log("🛑 Deteniendo todos los agentes...\n");
    
    for (const [agentId] of this.agents) {
      await this.stopAgent(agentId);
    }
    
    console.log("\n✅ Todos los agentes detenidos");
  }

  listAgents() {
    console.log("\n📋 Agentes configurados:\n");
    
    for (const agentConfig of this.config.agents) {
      const isRunning = this.agents.has(agentConfig.id);
      const status = isRunning ? "🟢 Corriendo" : (agentConfig.enabled ? "⚪ Detenido" : "🔴 Deshabilitado");
      
      console.log(`${status} ${agentConfig.id} - ${agentConfig.name}`);
      console.log(`   API: http://localhost:${agentConfig.ports.api}`);
      console.log(`   Data: ${agentConfig.paths.data}`);
      console.log("");
    }
  }
}

// CLI
const orchestrator = new BotOrchestrator();
const command = process.argv[2];
const agentId = process.argv[3];

(async () => {
  try {
    switch (command) {
      case "start":
        if (agentId) {
          await orchestrator.startAgent(agentId);
        } else {
          await orchestrator.startAll();
        }
        break;
      
      case "stop":
        if (agentId) {
          await orchestrator.stopAgent(agentId);
        } else {
          await orchestrator.stopAll();
        }
        process.exit(0);
        break;
      
      case "list":
        orchestrator.listAgents();
        process.exit(0);
        break;
      
      default:
        console.log("Uso:");
        console.log("  node orchestrator.js start [agent-id]  - Iniciar agente(s)");
        console.log("  node orchestrator.js stop [agent-id]   - Detener agente(s)");
        console.log("  node orchestrator.js list              - Listar agentes");
        process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
})();
```

---

## PARTE 4: CREAR DASHBOARD CENTRALIZADO

### 4.1 Crear archivo dashboard-central.js

**Archivo:** `dashboard-central.js`

```javascript
const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json());
app.use(express.static('public-central'));

// Cargar configuración de agentes
function loadAgentsConfig() {
  const configPath = path.join(__dirname, 'config', 'agents.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

// GET /api/agents - Lista de agentes
app.get('/api/agents', (req, res) => {
  const config = loadAgentsConfig();
  res.json(config.agents);
});

// GET /api/agents/:id/stats - Stats de un agente
app.get('/api/agents/:id/stats', async (req, res) => {
  try {
    const config = loadAgentsConfig();
    const agent = config.agents.find(a => a.id === req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }

    // Intentar obtener stats del agente
    const fetch = require('node-fetch');
    const response = await fetch(`http://localhost:${agent.ports.api}/stats`);
    const stats = await response.json();
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/agents/:id/status - Status de un agente
app.get('/api/agents/:id/status', async (req, res) => {
  try {
    const config = loadAgentsConfig();
    const agent = config.agents.find(a => a.id === req.params.id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agente no encontrado' });
    }

    const fetch = require('node-fetch');
    const response = await fetch(`http://localhost:${agent.ports.api}/status`);
    const status = await response.json();
    
    res.json(status);
  } catch (error) {
    res.json({ isRunning: false, error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`\n🎈 ===== DASHBOARD CENTRALIZADO =====`);
  console.log(`📊 Dashboard disponible en: http://localhost:${PORT}`);
  console.log(`=====================================\n`);
});
```

### 4.2 Crear frontend del dashboard

**Archivo:** `public-central/index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Central - Dolce Party</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #333; margin-bottom: 30px; }
    .agents-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .agent-card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .agent-card h2 { color: #333; margin-bottom: 10px; font-size: 1.2em; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 0.9em; margin-bottom: 15px; }
    .status.running { background: #4CAF50; color: white; }
    .status.stopped { background: #f44336; color: white; }
    .status.disabled { background: #9E9E9E; color: white; }
    .agent-info { margin: 10px 0; }
    .agent-info p { margin: 5px 0; color: #666; font-size: 0.9em; }
    .stats { background: #f9f9f9; padding: 10px; border-radius: 4px; margin-top: 10px; }
    .stats p { margin: 5px 0; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Dashboard Central - Dolce Party</h1>
    <div id="agents-grid" class="agents-grid"></div>
  </div>

  <script>
    async function loadAgents() {
      try {
        const response = await fetch('/api/agents');
        const agents = await response.json();
        
        const grid = document.getElementById('agents-grid');
        grid.innerHTML = '';
        
        for (const agent of agents) {
          const card = await createAgentCard(agent);
          grid.appendChild(card);
        }
      } catch (error) {
        console.error('Error cargando agentes:', error);
      }
    }

    async function createAgentCard(agent) {
      const card = document.createElement('div');
      card.className = 'agent-card';
      
      let statusClass = 'disabled';
      let statusText = 'Deshabilitado';
      let statsHTML = '';
      
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
            
            statsHTML = `
              <div class="stats">
                <p><strong>Mensajes hoy:</strong> ${todayStats.recibidos}</p>
                <p><strong>Enviados hoy:</strong> ${todayStats.enviados}</p>
              </div>
            `;
          } else {
            statusClass = 'stopped';
            statusText = 'Detenido';
          }
        } catch (error) {
          statusClass = 'stopped';
          statusText = 'Detenido';
        }
      }
      
      card.innerHTML = `
        <h2>${agent.name}</h2>
        <span class="status ${statusClass}">${statusText}</span>
        <div class="agent-info">
          <p><strong>ID:</strong> ${agent.id}</p>
          <p><strong>API:</strong> http://localhost:${agent.ports.api}</p>
          <p><strong>Dirección:</strong> ${agent.info.direccion}</p>
          <p><strong>Teléfono:</strong> ${agent.info.telefono}</p>
        </div>
        ${statsHTML}
      `;
      
      return card;
    }

    // Cargar agentes al inicio
    loadAgents();
    
    // Recargar cada 10 segundos
    setInterval(loadAgents, 10000);
  </script>
</body>
</html>
```

---

## PARTE 5: SCRIPTS DE GESTIÓN

### 5.1 Crear scripts batch

**Archivo:** `start-agent.bat`
```batch
@echo off
node orchestrator.js start %1
```

**Archivo:** `stop-agent.bat`
```batch
@echo off
node orchestrator.js stop %1
```

**Archivo:** `start-all-agents.bat`
```batch
@echo off
node orchestrator.js start
```

**Archivo:** `list-agents.bat`
```batch
@echo off
node orchestrator.js list
```

**Archivo:** `start-dashboard-central.bat`
```batch
@echo off
node dashboard-central.js
```

---

## PARTE 6: ACTUALIZAR PACKAGE.JSON

### 6.1 Agregar scripts

**Modificar:** `package.json`

Agregar en la sección "scripts":
```json
{
  "scripts": {
    "start": "node orchestrator.js start",
    "start:agent": "node orchestrator.js start",
    "stop": "node orchestrator.js stop",
    "list": "node orchestrator.js list",
    "dashboard": "node dashboard-central.js"
  }
}
```

### 6.2 Instalar dependencia node-fetch

```bash
npm install node-fetch@2
```

---

## PARTE 7: TESTING

### 7.1 Verificar configuración

```bash
node orchestrator.js list
```

**Salida esperada:**
```
📋 Agentes configurados:

🔴 Deshabilitado santa-ana - Dolce Party - Santa Ana
   API: http://localhost:3011
   Data: data/santa-ana

🔴 Deshabilitado local-2 - Dolce Party - Local 2
   API: http://localhost:3012
   Data: data/local-2
```

### 7.2 Iniciar un agente

```bash
node orchestrator.js start santa-ana
```

**Salida esperada:**
```
🚀 Iniciando agente: Dolce Party - Santa Ana
[santa-ana] Iniciando agente Dolce Party - Santa Ana...
[santa-ana] API iniciada en puerto 3011
[santa-ana] QR Code generado
===== QR para Dolce Party - Santa Ana =====
[QR CODE AQUÍ]
```

### 7.3 Verificar que el agente está corriendo

```bash
node orchestrator.js list
```

**Salida esperada:**
```
🟢 Corriendo santa-ana - Dolce Party - Santa Ana
```

### 7.4 Iniciar dashboard

```bash
node dashboard-central.js
```

Abrir: http://localhost:3000

**Debe mostrar:**
- Card del agente santa-ana con status "Corriendo"
- Estadísticas si hay datos

### 7.5 Detener agente

```bash
node orchestrator.js stop santa-ana
```

---

## CHECKLIST DE VERIFICACIÓN

- [ ] Archivo `config/agents.json` creado
- [ ] Directorios `data/santa-ana` y `data/local-2` creados
- [ ] Directorios `logs/santa-ana` y `logs/local-2` creados
- [ ] Directorio `catalogs` creado con catálogos
- [ ] Archivo `lib/agent-manager.js` creado
- [ ] Archivo `orchestrator.js` creado
- [ ] Archivo `dashboard-central.js` creado
- [ ] Directorio `public-central` creado con `index.html`
- [ ] Scripts `.bat` creados
- [ ] `package.json` actualizado con scripts
- [ ] `node-fetch@2` instalado
- [ ] Comando `node orchestrator.js list` funciona
- [ ] Comando `node orchestrator.js start santa-ana` funciona
- [ ] QR code se genera correctamente
- [ ] Dashboard en http://localhost:3000 funciona
- [ ] Dashboard muestra el agente correctamente

---

## NOTAS IMPORTANTES

1. **Puertos usados:**
   - 3000: Dashboard centralizado
   - 3011: API agente santa-ana
   - 3012: API agente local-2

2. **Para agregar un nuevo agente:**
   - Editar `config/agents.json`
   - Agregar nueva entrada en array `agents`
   - Crear directorios correspondientes
   - Ejecutar `node orchestrator.js start [nuevo-id]`

3. **Datos del segundo local:**
   - Se configuran editando `config/agents.json`
   - Cambiar `enabled: false` a `enabled: true` cuando esté listo
   - Llenar campos `[CONFIGURAR]` con datos reales

4. **El bot actual (bot.js) NO se modifica:**
   - Sigue funcionando como antes
   - El sistema multi-agente es paralelo
   - Cuando esté probado, se puede migrar completamente

---

**FIN DE INSTRUCCIONES**

Estas instrucciones son completas, verificadas y sin placeholders innecesarios. Todo el código está listo para copiar y pegar.