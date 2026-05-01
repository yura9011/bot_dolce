require("dotenv").config();
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
        try {
          await this.startAgent(agentConfig.id);
        } catch (error) {
          console.error(`❌ Error iniciando ${agentConfig.id}:`, error.message);
        }
      }
    }
    
    console.log("\n✅ Proceso de inicio de agentes completado");
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
