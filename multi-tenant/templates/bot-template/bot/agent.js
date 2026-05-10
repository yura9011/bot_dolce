const fs = require("fs");
const path = require("path");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");

// ─── MÓDULOS INTERNOS ────────────────────────────────────────────────────────
const { log } = require("./logging");
const { inicializarModelo, llamarGeminiConReintentos } = require("./llm");
const { detectarHijacking, logearIntentoHijacking, RESPUESTAS_ANTI_HIJACKING } = require("./security");
const { contieneTemaProhibido, contieneInsulto } = require("./moderation");
const { createControlManager } = require("./control-manual");
const { esAdmin, procesarComandoAdmin } = require("./admin-commands");
const { createStatisticsManager } = require("./statistics");

// ─── MÓDULOS DE DATOS ────────────────────────────────────────────────────────
const {
  ESTADOS,
  getMensajeBienvenida,
  getMenuPrincipal,
  getMenuPaqueteria,
  getMenuCorreoArgentino,
  getInfoCorreoArgentinoRetirar,
  getInfoCorreoArgentinoEnviar,
  getInfoAndreani,
  getInfoMercadoLibre,
  getMensajePedirNombre,
  getMensajeNoEntiendo,
} = require("../flujos.js");

// ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────
const MAX_MESSAGE_LENGTH = 500;
const DEBOUNCE_TIME_MS = 300;

class AgentManager {
  constructor(agentConfig) {
    this.id = agentConfig.id;
    this.name = agentConfig.name;
    this.config = agentConfig;
    this.client = null;
    this.api = null;
    this.isRunning = false;
    this.model = null;
    this.catalogo = null;
    
    // Estado del agente
    this.conversaciones = {};
    this.lastMessageTime = {};
    this.estadosUsuario = {};
    this.datosUsuario = {};
    
    // Crear directorios si no existen
    this.ensureDirectories();
    
    // Configurar rutas base
    this.baseDataPath = process.env.DATA_DIR || this.config.paths.data || "../data";
    this.baseLogsPath = process.env.LOGS_DIR || this.config.paths.logs || "../logs";
    this.catalogPath = process.env.CATALOG_PATH || this.config.paths.catalog || "../catalogs/catalogo.js";

    // Crear gestor de estadísticas para este agente
    const statsPath = this.getDataPath("estadisticas.json");
    this.statsManager = createStatisticsManager(statsPath);
    
    // Crear gestor de control (pausas/historial) aislado para este agente
    const dataDirPath = path.resolve(this.baseDataPath);
    this.controlManager = createControlManager(dataDirPath);
    
    // Cargar catálogo específico del agente
    this.loadCatalog();
  }

  ensureDirectories() {
    const dataDir = process.env.DATA_DIR || (this.config.paths && this.config.paths.data) || "../data";
    const logsDir = process.env.LOGS_DIR || (this.config.paths && this.config.paths.logs) || "../logs";
    
    const dirs = [dataDir, logsDir];
    
    dirs.forEach(dir => {
      if (dir && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  loadCatalog() {
    try {
      const catalogPath = path.resolve(this.catalogPath);
      if (fs.existsSync(catalogPath)) {
        this.catalogo = require(catalogPath);
        log(`[${this.id}] Catálogo cargado: ${catalogPath}`);
      } else {
        log(`[${this.id}] ⚠️ Catálogo no encontrado: ${catalogPath}`, "WARN");
      }
    } catch (error) {
      log(`[${this.id}] ❌ Error cargando catálogo: ${error.message}`, "ERROR");
    }
  }

  getDataPath(filename) {
    return path.join(this.baseDataPath, filename);
  }

  getLogPath(filename) {
    return path.join(this.baseLogsPath, filename);
  }

  async responderBot(message, texto) {
    const respuesta = await message.reply(texto);
    // Registrar mensaje enviado en estadísticas
    this.statsManager.registrarMensaje(message.from, "enviado").catch(error => {
      log(`[${this.id}] ⚠️ Error registrando mensaje enviado: ${error.message}`, "WARN");
    });
    // Guardar en historial usando el control manager de la instancia
    this.controlManager.guardarEnHistorial(message.from, "bot", texto);
    return respuesta;
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
      
      if (this.catalogo && this.catalogo.obtenerEstadisticasCatalogo) {
        const stats = this.catalogo.obtenerEstadisticasCatalogo();
        log(`[${this.id}] 📦 Catálogo: ${stats.totalProductos} productos en ${stats.totalCategorias} categorías`);
      }
      
      // Cargar estado de pausas usando el control manager de la instancia
      this.controlManager.cargarEstadoPausas();
    });

    this.client.on("authenticated", () => {
      log(`[${this.id}] Autenticación exitosa`);
    });

    this.client.on("auth_failure", (msg) => {
      log(`[${this.id}] Error de autenticación: ${msg}`, "ERROR");
    });

    this.client.on("disconnected", (reason) => {
      log(`[${this.id}] ⚠️ Bot desconectado: ${reason}`, "WARN");
      this.isRunning = false;
    });

    // Configurar manejadores de mensajes
    this.setupMessageHandlers();

    await this.client.initialize();
  }

  setupMessageHandlers() {
    // Detección de finalización manual
    this.client.on("message_create", async (message) => {
      if (!message.fromMe) return;
      if (message.to.includes("@g.us")) return;
      
      const tiposIgnorados = ["revoked", "e2e_notification", "notification_template"];
      if (tiposIgnorados.includes(message.type)) return;
      
      const clienteId = message.to;
      const textoMensaje = message.body.trim();
      
      if (textoMensaje.toUpperCase() === "MUCHAS GRACIAS") {
        if (this.controlManager.estaUsuarioPausado(clienteId)) {
          log(`[${this.id}] 🎯 Finalización detectada: Personal escribió "MUCHAS GRACIAS" a ${clienteId}`);
          
          const mensajeDespedida = "¡Muchas gracias por contactarnos! 😊\n\n" +
            "Esperamos haberte ayudado. Si necesitás algo más, no dudes en escribirnos.\n\n" +
            "¡Que tengas un excelente día! 🎈";
          
          try {
            await this.client.sendMessage(clienteId, mensajeDespedida);
            log(`[${this.id}] 📤 Mensaje de despedida enviado a ${clienteId}`);
          } catch (error) {
            log(`[${this.id}] ❌ Error enviando despedida: ${error.message}`, "ERROR");
          }
          
          this.controlManager.reanudarUsuario(clienteId);
          log(`[${this.id}] ✅ Conversación finalizada con ${clienteId.replace(/@(c\.us|lid)$/, "")}`);
        }
      }
    });

    // Procesamiento de mensajes entrantes
    this.client.on("message", async (message) => {
      await this.handleIncomingMessage(message);
    });
  }

  async handleIncomingMessage(message) {
    // Ignorar mensajes de grupos
    if (message.from.includes("@g.us")) return;

    // Ignorar estados de WhatsApp
    if (message.from === 'status@broadcast' || message.isStatus) {
      log(`[${this.id}] 📱 Estado de WhatsApp ignorado`);
      return;
    }

    // Ignorar mensajes de estado y notificaciones
    const tiposIgnorados = ["revoked", "e2e_notification", "notification_template"];
    if (tiposIgnorados.includes(message.type)) return;

    // Ignorar audios y llamadas
    if (message.type === "ptt" || message.type === "audio") {
      await message.reply("⚠️ No recibimos audios en este momento. Por favor, escribí tu consulta por mensaje de texto.");
      return;
    }

    const userId = message.from;
    const texto = message.body.trim();

    // Control de debounce (anti-spam)
    const ahora = Date.now();
    if (this.lastMessageTime[userId] && (ahora - this.lastMessageTime[userId]) < DEBOUNCE_TIME_MS) {
      log(`[${this.id}] ⏭️ Mensaje ignorado (debounce): ${userId}`);
      return;
    }
    this.lastMessageTime[userId] = ahora;

    log(`[${this.id}] 📩 [${userId}]: ${texto}`);
    
    // Registrar mensaje en estadísticas
    this.statsManager.registrarMensaje(userId, "recibido").catch(error => {
      log(`[${this.id}] ⚠️ Error registrando mensaje: ${error.message}`, "WARN");
    });
    
    // Guardar mensaje del usuario en historial
    this.controlManager.guardarEnHistorial(userId, "user", texto);

    // Comandos administrativos
    if (esAdmin(userId)) {
      log(`[${this.id}] 🔐 Comando admin detectado de ${userId}`);
      const esComando = await procesarComandoAdmin(message, texto, this.estadosUsuario);
      if (esComando) return;
    }

    // Verificar pausa global
    if (this.controlManager.getPausaGlobal()) {
      log(`[${this.id}] ⏸️ Bot pausado globalmente - Mensaje ignorado de ${userId}`);
      return;
    }

    // Verificar pausa por usuario
    if (this.controlManager.estaUsuarioPausado(userId)) {
      log(`[${this.id}] ⏸️ Usuario ${userId} en atención manual - Bot no responde`);
      return;
    }

    log(`[${this.id}] ✅ Procesando mensaje de ${userId}: "${texto}"`);

    // Primera interacción
    if (!this.estadosUsuario[userId]) {
      this.estadosUsuario[userId] = ESTADOS.INICIAL;
      await this.responderBot(message, getMensajeBienvenida());
      await this.responderBot(message, getMensajePedirNombre());
      this.estadosUsuario[userId] = ESTADOS.ESPERANDO_NOMBRE;
      log(`[${this.id}] 👋 Nuevo usuario: ${userId} - Enviando bienvenida`);
      return;
    }

    // Esperando nombre
    if (this.estadosUsuario[userId] === ESTADOS.ESPERANDO_NOMBRE) {
      let nombre = texto;
      
      const patronNombre = /(?:mi nombre es|me llamo|soy|claro,?\s*mi nombre es)\s+([a-záéíóúñ]+)/i;
      const match = texto.match(patronNombre);
      if (match) {
        nombre = match[1];
      } else {
        const palabras = texto.split(' ');
        for (const palabra of palabras) {
          if (palabra.length >= 2 && /^[a-záéíóúñ]+$/i.test(palabra)) {
            nombre = palabra;
            break;
          }
        }
      }
      
      nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
      
      this.datosUsuario[userId] = { nombre: nombre };
      await this.responderBot(message, `Encantado de conocerte, ${nombre}! 😊`);
      await this.responderBot(message, getMenuPrincipal());
      this.estadosUsuario[userId] = ESTADOS.MENU_PRINCIPAL;
      log(`[${this.id}] ✅ Usuario ${userId} registrado como: ${nombre}`);
      return;
    }

    // Volver al menú principal (opción 0)
    if (texto === "0") {
      await this.responderBot(message, getMenuPrincipal());
      this.estadosUsuario[userId] = ESTADOS.MENU_PRINCIPAL;
      return;
    }

    // Menú principal
    if (this.estadosUsuario[userId] === ESTADOS.MENU_PRINCIPAL) {
      if (texto === "1") {
        this.estadosUsuario[userId] = ESTADOS.PEDIDO;
        await this.responderBot(message, "Perfecto! ¿Qué productos necesitás para tu pedido? También podés consultarme sobre nuestro catálogo de globos y decoración.");
        log(`[${this.id}] 🛒 Usuario ${userId} inició pedido`);
        return;
      }
      
      if (texto === "2") {
        await this.responderBot(message, getMenuPaqueteria());
        this.estadosUsuario[userId] = ESTADOS.MENU_PAQUETERIA;
        return;
      }
      
      await this.responderBot(message, getMensajeNoEntiendo());
      await this.responderBot(message, getMenuPrincipal());
      return;
    }

    // Menú paquetería
    if (this.estadosUsuario[userId] === ESTADOS.MENU_PAQUETERIA) {
      if (texto === "1") {
        await this.responderBot(message, getMenuCorreoArgentino());
        this.estadosUsuario[userId] = ESTADOS.MENU_CORREO_ARGENTINO;
        return;
      }
      
      if (texto === "2") {
        await this.responderBot(message, getInfoAndreani());
        this.estadosUsuario[userId] = ESTADOS.INFO_ANDREANI;
        return;
      }
      
      if (texto === "3") {
        await this.responderBot(message, getInfoMercadoLibre());
        this.estadosUsuario[userId] = ESTADOS.INFO_MERCADOLIBRE;
        return;
      }
      
      await this.responderBot(message, getMensajeNoEntiendo());
      await this.responderBot(message, getMenuPaqueteria());
      return;
    }

    // Submenú Correo Argentino
    if (this.estadosUsuario[userId] === ESTADOS.MENU_CORREO_ARGENTINO) {
      if (texto === "1") {
        await this.responderBot(message, getInfoCorreoArgentinoRetirar());
        this.estadosUsuario[userId] = ESTADOS.INFO_CORREO_RETIRAR;
        return;
      }
      
      if (texto === "2") {
        await this.responderBot(message, getInfoCorreoArgentinoEnviar());
        this.estadosUsuario[userId] = ESTADOS.INFO_CORREO_ENVIAR;
        return;
      }
      
      if (texto === "0") {
        await this.responderBot(message, getMenuPaqueteria());
        this.estadosUsuario[userId] = ESTADOS.MENU_PAQUETERIA;
        return;
      }
      
      await this.responderBot(message, getMensajeNoEntiendo());
      await this.responderBot(message, getMenuCorreoArgentino());
      return;
    }

    // Viendo info de paquetería
    if (this.estadosUsuario[userId] === ESTADOS.INFO_CORREO_RETIRAR ||
        this.estadosUsuario[userId] === ESTADOS.INFO_CORREO_ENVIAR ||
        this.estadosUsuario[userId] === ESTADOS.INFO_ANDREANI || 
        this.estadosUsuario[userId] === ESTADOS.INFO_MERCADOLIBRE) {
      if (texto === "0") {
        await this.responderBot(message, getMenuPrincipal());
        this.estadosUsuario[userId] = ESTADOS.MENU_PRINCIPAL;
        return;
      }
      
      await this.responderBot(message, "¿Querés consultar otro servicio de envío?");
      await this.responderBot(message, getMenuPaqueteria());
      this.estadosUsuario[userId] = ESTADOS.MENU_PAQUETERIA;
      return;
    }

    // Flujo de pedido
    if (this.estadosUsuario[userId] === ESTADOS.PEDIDO) {
      await this.handlePedidoFlow(message, texto, userId);
      return;
    }

    // Cualquier otro estado
    await this.responderBot(message, getMenuPrincipal());
    this.estadosUsuario[userId] = ESTADOS.MENU_PRINCIPAL;
  }

  async handlePedidoFlow(message, texto, userId) {
    // Verificación anti-hijacking
    const tipoAtaque = detectarHijacking(texto);
    if (tipoAtaque) {
      logearIntentoHijacking(userId, texto, tipoAtaque);
      this.statsManager.registrarHijacking(userId, tipoAtaque).catch(error => {
        log(`[${this.id}] ⚠️ Error registrando hijacking: ${error.message}`, "WARN");
      });
      await this.responderBot(message, RESPUESTAS_ANTI_HIJACKING[tipoAtaque]);
      return;
    }

    // Validar longitud del mensaje
    if (texto.length > MAX_MESSAGE_LENGTH) {
      log(`[${this.id}] ⚠️ Mensaje muy largo: ${userId} (${texto.length} caracteres)`);
      await this.responderBot(message,
        `Tu mensaje es muy largo (${texto.length} caracteres). Por favor, enviá un mensaje de máximo ${MAX_MESSAGE_LENGTH} caracteres.`
      );
      return;
    }

    // Moderación de contenido
    const temaProhibido = contieneTemaProhibido(texto);
    if (temaProhibido) {
      log(`[${this.id}] 🚫 Tema prohibido bloqueado: "${temaProhibido}" de ${userId}`, "WARN");
      await this.responderBot(message,
        "Disculpá, solo puedo ayudarte con temas de la tienda. ¿Te puedo ayudar con algo más sobre productos o pedidos?"
      );
      return;
    }

    const insulto = contieneInsulto(texto);
    if (insulto) {
      log(`[${this.id}] ⚠️ Lenguaje ofensivo detectado: "${insulto}" de ${userId}`, "WARN");
    }

    // Detección de handoff
    const textoLower = texto.toLowerCase();
    if (textoLower.includes("humano") || 
        textoLower.includes("encargado") || 
        textoLower.includes("operador") ||
        textoLower.includes("persona") ||
        textoLower.includes("alguien") ||
        textoLower.includes("agente")) {
      this.controlManager.pausarUsuario(userId, "handoff_solicitado");
      
      this.statsManager.registrarHandoff(userId, "handoff_solicitado").catch(error => {
        log(`[${this.id}] ⚠️ Error registrando handoff: ${error.message}`, "WARN");
      });
      
      await this.responderBot(message,
        "Entendido 👋 Un agente se va a comunicar con vos a la brevedad. ¡Gracias por tu paciencia!"
      );
      
      log(`[${this.id}] 🚨 HANDOFF solicitado por ${userId}`);
      return;
    }

    // Historial de conversación
    if (!this.conversaciones[userId]) {
      this.conversaciones[userId] = [];
    }

    this.conversaciones[userId].push({
      role: "user",
      parts: [{ text: texto }],
    });

    if (this.conversaciones[userId].length > 10) {
      this.conversaciones[userId] = this.conversaciones[userId].slice(-10);
    }

    // Búsqueda en catálogo (RAG)
    log(`[${this.id}] 🔍 Buscando productos: "${texto}"`);

    let productosEncontrados = [];
    let contextoProductos = "";
    
    if (this.catalogo && this.catalogo.buscarProductos) {
      try {
        productosEncontrados = this.catalogo.buscarProductos(texto, 5);
        log(`[${this.id}] 📦 Productos encontrados: ${productosEncontrados.length}`);
        
        this.statsManager.registrarBusqueda(texto, productosEncontrados.length).catch(error => {
          log(`[${this.id}] ⚠️ Error registrando búsqueda: ${error.message}`, "WARN");
        });
        
        if (productosEncontrados.length > 0 && this.catalogo.formatearProductosParaContexto) {
          contextoProductos = this.catalogo.formatearProductosParaContexto(productosEncontrados);
        }
      } catch (error) {
        log(`[${this.id}] ⚠️ Error buscando productos: ${error.message}`, "WARN");
        this.statsManager.registrarBusqueda(texto, 0).catch(error => {
          log(`[${this.id}] ⚠️ Error registrando búsqueda fallida: ${error.message}`, "WARN");
        });
      }
    }

    // Llamada al LLM
    try {
      if (!this.model) {
        this.model = inicializarModelo();
      }

      const chat = this.model.startChat({
        history: this.conversaciones[userId].slice(0, -1),
      });

      let mensajeConContexto = texto;
      if (contextoProductos) {
        mensajeConContexto = `${contextoProductos}\n\n---\n\nPregunta del cliente: ${texto}\n\nInstrucciones especiales:\n1. Si el cliente usa lenguaje coloquial como "cositos", "flecos", "para colgar", INTERPRETÁ qué está buscando\n2. Los productos listados arriba son los más relevantes para su consulta\n3. Si no hay productos exactos, SUGERÍ productos similares o relacionados\n4. PREGUNTÁ para clarificar si es necesario (colores, ocasión, tamaño)\n5. Sé conversacional y ayudá al cliente a encontrar lo que necesita`;
      } else {
        mensajeConContexto = `Pregunta del cliente: ${texto}\n\nNo se encontraron productos específicos para esta consulta, pero:\n1. INTERPRETÁ qué podría estar buscando el cliente\n2. SUGERÍ categorías de productos que podrían interesarle\n3. PREGUNTÁ para clarificar qué necesita exactamente\n4. Mencioná que tenés amplio catálogo de cotillón y decoración`;
      }

      const respuesta = await llamarGeminiConReintentos(chat, mensajeConContexto);

      this.conversaciones[userId].push({
        role: "model",
        parts: [{ text: respuesta }],
      });

      log(`[${this.id}] 🤖 Bot: ${respuesta}`);
      await this.responderBot(message, respuesta);
      
      await this.responderBot(message, "\n¿Necesitás algo más? Respondé *0* para volver al menú principal.");
      
    } catch (error) {
      log(`[${this.id}] ❌ Error después de reintentos: ${error.message}`, "ERROR");
      await this.responderBot(message,
        "Ups, tuve un problema técnico. Por favor intentá de nuevo en un momento."
      );
    }
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
        globalPausado: this.controlManager.getPausaGlobal(),
        usuariosPausados: Object.keys(this.controlManager.getUsuariosPausados()).length,
        timestamp: Date.now()
      });
    });

    // Endpoint de stats
    this.api.get("/stats", async (req, res) => {
      try {
        const stats = await this.statsManager.leerEstadisticas();
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Endpoint de usuarios pausados
    this.api.get("/paused", (req, res) => {
      try {
        const pausados = this.controlManager.getUsuariosPausados();
        res.json(pausados);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Endpoints de control
    this.api.post("/pause/:userId", (req, res) => {
      const userId = req.params.userId;
      if (!userId.includes("@")) {
        return res.status(400).json({ success: false, error: "userId inválido" });
      }
      this.controlManager.pausarUsuario(userId, "pausado_por_api");
      res.json({ success: true, message: `Usuario ${userId} pausado` });
    });

    this.api.post("/resume/:userId", (req, res) => {
      const userId = req.params.userId;
      if (!userId.includes("@")) {
        return res.status(400).json({ success: false, error: "userId inválido" });
      }
      const resultado = this.controlManager.reanudarUsuario(userId);
      res.json({ success: resultado, message: resultado ? "Reanudado" : "No estaba pausado" });
    });

    this.api.post("/pause-global", (req, res) => {
      this.controlManager.setPausaGlobal(true);
      res.json({ success: true, message: "Bot pausado globalmente" });
    });

    this.api.post("/resume-global", (req, res) => {
      this.controlManager.setPausaGlobal(false);
      res.json({ success: true, message: "Bot reanudado globalmente" });
    });

    // --- NUEVOS ENDPOINTS PARA PANEL HUMANO ---

    // Enviar mensaje como humano (usado por dashboard-central)
    this.api.post("/message/sendMessage/:sessionId", async (req, res) => {
      const { chatId, message } = req.body;
      if (!chatId || !message) {
        return res.status(400).json({ error: "Faltan datos" });
      }

      try {
        log(`[${this.id}] 🧑‍💼 Enviando mensaje humano a ${chatId}: "${message}"`);
        await this.client.sendMessage(chatId, message);
        
        // Registrar en historial como humano
        this.controlManager.guardarEnHistorial(chatId, "human", message);
        
        res.json({ success: true });
      } catch (error) {
        log(`[${this.id}] ❌ Error enviando mensaje humano: ${error.message}`, "ERROR");
        res.status(500).json({ error: error.message });
      }
    });

    // Obtener mensajes recientes de un chat específico
    this.api.post("/chat/fetchMessages/:sessionId", async (req, res) => {
      const { chatId, limit = 50 } = req.body;
      if (!chatId) {
        return res.status(400).json({ error: "Falta chatId" });
      }

      try {
        const chat = await this.client.getChatById(chatId);
        const messages = await chat.fetchMessages({ limit });
        
        // Formatear para que coincida con lo esperado por el panel
        const formatted = messages.map(m => ({
          body: m.body,
          from: m.from,
          fromMe: m.fromMe,
          timestamp: m.timestamp * 1000,
          type: m.type
        }));
        
        res.json(formatted);
      } catch (error) {
        log(`[${this.id}] ❌ Error obteniendo mensajes: ${error.message}`, "ERROR");
        res.status(500).json({ error: error.message });
      }
    });

    // Endpoint de conversaciones
    this.api.get("/conversations", (req, res) => {
      try {
        const historialPath = this.getDataPath("historial.json");
        if (fs.existsSync(historialPath)) {
          const historial = JSON.parse(fs.readFileSync(historialPath, "utf8"));
          const conversaciones = [];
          const resumenPorNumero = {};
          const limit = parseInt(req.query.limit) || 0; // 0 = sin límite
          
          for (const [userId, mensajes] of Object.entries(historial)) {
            if (mensajes && mensajes.length > 0) {
              const numeroLimpio = userId.replace(/@.*/, '').replace(/^54/, '+54 ');
              resumenPorNumero[numeroLimpio] = {
                userId,
                numero: numeroLimpio,
                totalMensajes: mensajes.length,
                ultimoMensaje: mensajes[mensajes.length - 1]?.timestamp || 0
              };
              
              let mensajesParaMostrar = mensajes;
              if (limit > 0 && mensajes.length > limit) {
                mensajesParaMostrar = mensajes.slice(-limit);
              }
              
              const mensajesFormateados = mensajesParaMostrar.map(msg => ({
                type: msg.role === 'user' ? 'user' : 
                      msg.role === 'human' ? 'human' : 'bot',
                text: msg.text,
                timestamp: msg.timestamp
              }));
              
              conversaciones.push({
                userId,
                numero: numeroLimpio,
                messages: mensajesFormateados,
                lastMessage: mensajes[mensajes.length - 1]?.timestamp || 0,
                totalMensajes: mensajes.length
              });
            }
          }
          
          const sorted = conversaciones.sort((a, b) => b.lastMessage - a.lastMessage);
          const resumen = Object.values(resumenPorNumero).sort((a, b) => b.ultimoMensaje - a.ultimoMensaje);
          
          res.json({
            conversaciones: sorted,
            resumenPorNumero: resumen
          });
        } else {
          res.json({ conversaciones: [], resumenPorNumero: [] });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Endpoint de logs
    this.api.get("/logs", (req, res) => {
      try {
        const lineas = parseInt(req.query.lines) || 50;
        const logPath = this.getLogPath("bot.log");
        
        if (fs.existsSync(logPath)) {
          const data = fs.readFileSync(logPath, "utf8");
          const logs = data.split('\n').filter(l => l.trim()).slice(-lineas).map(log => ({
            timestamp: log.match(/\[(.+?)\]/)?.[1] || 'Unknown',
            message: log
          }));
          res.json(logs);
        } else {
          res.json([]);
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Endpoint de seguridad
    this.api.get("/security", (req, res) => {
      try {
        const lineas = parseInt(req.query.lines) || 20;
        const logPath = this.getLogPath("security.log");
        
        if (fs.existsSync(logPath)) {
          const data = fs.readFileSync(logPath, "utf8");
          const logs = data.split('\n').filter(l => l.trim()).slice(-lineas).map(log => {
            const match = log.match(/\[(.+?)\].*Usuario: (.+?) - Tipo: (.+?) - Mensaje: "(.+?)"/);
            if (match) {
              const [, timestamp, userId, tipo, mensaje] = match;
              return {
                timestamp,
                userId: userId.replace(/@(c\.us|lid)$/, ''),
                tipo,
                mensaje: mensaje.substring(0, 50) + (mensaje.length > 50 ? '...' : '')
              };
            }
            return { timestamp: 'Unknown', userId: 'Unknown', tipo: 'Unknown', mensaje: log };
          });
          res.json(logs);
        } else {
          res.json([]);
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.api.listen(this.config.ports.api, () => {
      log(`[${this.id}] 🔌 API iniciada en puerto ${this.config.ports.api}`);
    });
  }

  async start() {
    log(`[${this.id}] Iniciando agente ${this.name}...`);
    await this.statsManager.inicializar().catch(error => {
      log(`[${this.id}] ⚠️ Error inicializando estadísticas: ${error.message}`, "WARN");
    });
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
