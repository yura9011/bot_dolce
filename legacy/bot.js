require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");

// ─── MÓDULOS INTERNOS ────────────────────────────────────────────────────────
const { log } = require("./lib/logging");
const { validarDatosIniciales, validarConfiguracionAdmin } = require("./lib/validation");
const { inicializarModelo, llamarGeminiConReintentos } = require("./lib/llm");
const { detectarHijacking, logearIntentoHijacking, RESPUESTAS_ANTI_HIJACKING } = require("./lib/security");
const { contieneTemaProhibido, contieneInsulto } = require("./lib/moderation");
const { 
  cargarEstadoPausas, 
  pausarUsuario, 
  reanudarUsuario, 
  guardarEnHistorial,
  getPausaGlobal,
  setPausaGlobal,
  estaUsuarioPausado,
  getUsuariosPausados
} = require("./lib/control-manual");
const { esAdmin, procesarComandoAdmin } = require("./lib/admin-commands");
const { initializeClient, getClient } = require("./lib/whatsapp-client");
const { 
  inicializarEstadisticas,
  registrarMensaje,
  registrarHandoff,
  registrarHijacking,
  registrarBusqueda
} = require("./lib/statistics");

// ─── MÓDULOS DE DATOS ────────────────────────────────────────────────────────
const {
  buscarProductos,
  formatearProductosParaContexto,
  obtenerEstadisticasCatalogo,
} = require("./catalogo.js");
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
} = require("./flujos.js");

// ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────

// Validar datos iniciales antes de continuar
log("🔍 Validando configuración inicial...");
if (!validarDatosIniciales()) {
  console.error("❌ Error: Faltan datos críticos. El bot no puede iniciar.");
  process.exit(1);
}

// Inicializar sistema de estadísticas
inicializarEstadisticas().catch(error => {
  log(`⚠️ Error inicializando estadísticas: ${error.message}`, "WARN");
});

// Configuración de límites
const MAX_MESSAGE_LENGTH = 500;
const DEBOUNCE_TIME_MS = 300;

// ─── INICIALIZACIÓN ───────────────────────────────────────────────────────────

const model = inicializarModelo();

// Memoria de conversaciones por usuario (se limpia al reiniciar el bot)
const conversaciones = {};

// Control de mensajes duplicados/rápidos (debounce por usuario)
const lastMessageTime = {};

// Estado del flujo por usuario
const estadosUsuario = {};

// Datos del usuario (nombre, etc.)
const datosUsuario = {};

// ─── CLIENTE DE WHATSAPP ──────────────────────────────────────────────────────

const client = initializeClient();

// Función helper para responder y guardar en historial
async function responderBot(message, texto) {
  const respuesta = await message.reply(texto);
  // Registrar mensaje enviado en estadísticas (async, no bloquear)
  registrarMensaje(message.from, "enviado").catch(error => {
    log(`⚠️ Error registrando mensaje enviado: ${error.message}`, "WARN");
  });
  // Guardar en historial
  guardarEnHistorial(message.from, "bot", texto);
  return respuesta;
}

// ─── API INTERNA PARA DASHBOARD ──────────────────────────────────────────────

const dashboardApi = express();
dashboardApi.use(express.json());

// GET /status - Estado del bot
dashboardApi.get("/status", (req, res) => {
  res.json({
    activo: !getPausaGlobal(),
    globalPausado: getPausaGlobal(),
    usuariosPausados: Object.keys(getUsuariosPausados()).length,
    timestamp: Date.now()
  });
});

// POST /pause/:userId - Pausar usuario específico
dashboardApi.post("/pause/:userId", (req, res) => {
  const userId = req.params.userId;
  if (!userId.includes("@")) {
    return res.status(400).json({ success: false, error: "userId inválido" });
  }
  pausarUsuario(userId, "pausado_por_dashboard");
  res.json({ success: true, message: `Usuario ${userId} pausado` });
});

// POST /resume/:userId - Reanudar usuario específico
dashboardApi.post("/resume/:userId", (req, res) => {
  const userId = req.params.userId;
  if (!userId.includes("@")) {
    return res.status(400).json({ success: false, error: "userId inválido" });
  }
  const resultado = reanudarUsuario(userId);
  res.json({ success: resultado, message: resultado ? "Reanudado" : "No estaba pausado" });
});

// POST /pause-global - Pausar bot globalmente
dashboardApi.post("/pause-global", (req, res) => {
  setPausaGlobal(true);
  res.json({ success: true, message: "Bot pausado globalmente" });
});

// POST /resume-global - Reanudar bot globalmente
dashboardApi.post("/resume-global", (req, res) => {
  setPausaGlobal(false);
  res.json({ success: true, message: "Bot reanudado globalmente" });
});

// Iniciar API interna en puerto 3002
const DASHBOARD_API_PORT = 3002;
dashboardApi.listen(DASHBOARD_API_PORT, () => {
  log(`🔌 API de control iniciada en puerto ${DASHBOARD_API_PORT}`);
});

client.on("qr", (qr) => {
  log("\n📱 ===== ESCANEAR QR CON WHATSAPP =====");
  log("1. Abrí WhatsApp en tu teléfono");
  log("2. Tocá Menú (⋮) > Dispositivos vinculados");
  log("3. Tocá 'Vincular un dispositivo'");
  log("4. Escaneá este código QR:\n");
  qrcode.generate(qr, { small: true });
  log("\n⏰ El código QR expira en 20 segundos");
  log("🔄 Si no funciona, reiniciá el bot\n");
});

client.on("ready", () => {
  log("✅ Bot conectado y listo!");
  
  const stats = obtenerEstadisticasCatalogo();
  log(`📦 Catálogo: ${stats.totalProductos} productos en ${stats.totalCategorias} categorías`);
  
  // Cargar estado de pausas
  cargarEstadoPausas();
  
  // Validar configuración de admin
  const configAdmin = validarConfiguracionAdmin();
  if (configAdmin.valido) {
    log(`🔐 ${configAdmin.mensaje}`);
  } else {
    log(`⚠️ ${configAdmin.mensaje}. Los comandos no funcionarán.`, "WARN");
  }
});

client.on("authenticated", () => {
  log("✅ Autenticación exitosa!");
});

client.on("auth_failure", (msg) => {
  log(`❌ Error de autenticación: ${msg}`, "ERROR");
  log("💡 Solución: Eliminá las carpetas .wwebjs_auth y .wwebjs_cache y reiniciá", "INFO");
  
  // Intentar limpiar automáticamente las carpetas corruptas
  setTimeout(() => {
    log("🔄 Intentando limpiar sesiones corruptas...", "INFO");
    process.exit(1); // Salir para que el usuario pueda reiniciar
  }, 2000);
});

client.on("disconnected", (reason) => {
  log(`⚠️ Bot desconectado: ${reason}`, "WARN");
  log("🔄 Reiniciando conexión en 5 segundos...", "INFO");
  
  // Reiniciar después de un breve delay
  setTimeout(() => {
    client.initialize().catch(error => {
      log(`❌ Error reiniciando: ${error.message}`, "ERROR");
      log("💡 Reiniciá el bot manualmente", "INFO");
    });
  }, 5000);
});

// Manejo de errores de Puppeteer
process.on('unhandledRejection', (reason, promise) => {
  if (reason && reason.message && reason.message.includes('Target closed')) {
    log("⚠️ Error de Puppeteer detectado - Reiniciando...", "WARN");
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  } else {
    log(`❌ Promesa rechazada: ${reason}`, "ERROR");
  }
});

process.on('uncaughtException', (error) => {
  if (error.message && error.message.includes('Target closed')) {
    log("⚠️ Error de Puppeteer detectado - Reiniciando...", "WARN");
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  } else {
    log(`❌ Excepción no capturada: ${error.message}`, "ERROR");
  }
});

// ─── DETECCIÓN DE FINALIZACIÓN MANUAL ────────────────────────────────────────

client.on("message_create", async (message) => {
  // Solo procesar mensajes enviados desde el bot (fromMe = true)
  if (!message.fromMe) return;
  
  // Ignorar mensajes a grupos
  if (message.to.includes("@g.us")) return;
  
  // Ignorar mensajes de estado/notificaciones
  const tiposIgnorados = ["revoked", "e2e_notification", "notification_template"];
  if (tiposIgnorados.includes(message.type)) return;
  
  const clienteId = message.to;
  const textoMensaje = message.body.trim();
  
  // Detectar si el personal escribió "MUCHAS GRACIAS" desde WhatsApp Web
  if (textoMensaje.toUpperCase() === "MUCHAS GRACIAS") {
    // Verificar que el cliente esté pausado (en atención manual)
    if (estaUsuarioPausado(clienteId)) {
      log(`🎯 Finalización detectada: Personal escribió "MUCHAS GRACIAS" a ${clienteId}`);
      
      // Enviar mensaje de despedida al cliente
      const mensajeDespedida = "¡Muchas gracias por contactarnos! 😊\n\n" +
        "Esperamos haberte ayudado. Si necesitás algo más, no dudes en escribirnos.\n\n" +
        "¡Que tengas un excelente día! 🎈";
      
      try {
        await client.sendMessage(clienteId, mensajeDespedida);
        log(`📤 Mensaje de despedida enviado a ${clienteId}`);
      } catch (error) {
        log(`❌ Error enviando despedida a ${clienteId}: ${error.message}`, "ERROR");
      }
      
      // Reanudar cliente para futuras conversaciones
      reanudarUsuario(clienteId);
      log(`✅ Conversación finalizada con ${clienteId.replace(/@(c\.us|lid)$/, "")}`);
    }
  }
});

client.on("message", async (message) => {
  // Ignorar mensajes de grupos
  if (message.from.includes("@g.us")) return;

  // ⚠️ CRÍTICO: Ignorar respuestas a estados de WhatsApp (Stories)
  if (message.from === 'status@broadcast' || message.isStatus) {
    log(`📱 Estado de WhatsApp ignorado de ${message.from}`);
    return; // silently ignore
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
  if (lastMessageTime[userId] && (ahora - lastMessageTime[userId]) < DEBOUNCE_TIME_MS) {
    log(`⏭️ Mensaje ignorado (debounce): ${userId}`);
    return;
  }
  lastMessageTime[userId] = ahora;

  log(`📩 [${userId}]: ${texto}`);
  
  // Registrar mensaje en estadísticas (async, no bloquear)
  registrarMensaje(userId, "recibido").catch(error => {
    log(`⚠️ Error registrando mensaje: ${error.message}`, "WARN");
  });
  
  // Guardar mensaje del usuario en historial
  guardarEnHistorial(userId, "user", texto);

  // ── COMANDOS ADMINISTRATIVOS ─────────────────────────────────────────────
  if (esAdmin(userId)) {
    log(`🔐 Comando admin detectado de ${userId}`);
    const esComando = await procesarComandoAdmin(message, texto, estadosUsuario);
    if (esComando) return; // Si era un comando, no continuar con lógica normal
  }

  // ── VERIFICAR PAUSA GLOBAL ───────────────────────────────────────────────
  if (getPausaGlobal()) {
    log(`⏸️ Bot pausado globalmente - Mensaje ignorado de ${userId}`);
    return;
  }

  // ── VERIFICAR PAUSA POR USUARIO ──────────────────────────────────────────
  if (estaUsuarioPausado(userId)) {
    log(`⏸️ Usuario ${userId} en atención manual - Bot no responde`);
    return; // No enviar ningún mensaje automático
  }

  log(`✅ Procesando mensaje de ${userId}: "${texto}"`);

  // ── FLUJO: Primera interacción (enviar bienvenida) ───────────────────────
  if (!estadosUsuario[userId]) {
    estadosUsuario[userId] = ESTADOS.INICIAL;
    await responderBot(message, getMensajeBienvenida());
    await responderBot(message, getMensajePedirNombre());
    estadosUsuario[userId] = ESTADOS.ESPERANDO_NOMBRE;
    log(`👋 Nuevo usuario: ${userId} - Enviando bienvenida`);
    return;
  }

  // ── FLUJO: Esperando nombre ──────────────────────────────────────────────
  if (estadosUsuario[userId] === ESTADOS.ESPERANDO_NOMBRE) {
    // Extraer solo el nombre de la respuesta
    let nombre = texto;
    
    // Si dice "mi nombre es X" o "me llamo X", extraer solo el nombre
    const patronNombre = /(?:mi nombre es|me llamo|soy|claro,?\s*mi nombre es)\s+([a-záéíóúñ]+)/i;
    const match = texto.match(patronNombre);
    if (match) {
      nombre = match[1];
    } else {
      // Si es una frase larga, tomar solo la primera palabra que parezca un nombre
      const palabras = texto.split(' ');
      for (const palabra of palabras) {
        if (palabra.length >= 2 && /^[a-záéíóúñ]+$/i.test(palabra)) {
          nombre = palabra;
          break;
        }
      }
    }
    
    // Capitalizar primera letra
    nombre = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
    
    datosUsuario[userId] = { nombre: nombre };
    await responderBot(message, `Encantado de conocerte, ${nombre}! 😊`);
    await responderBot(message, getMenuPrincipal());
    estadosUsuario[userId] = ESTADOS.MENU_PRINCIPAL;
    log(`✅ Usuario ${userId} registrado como: ${nombre}`);
    return;
  }

  // ── NAVEGACIÓN: Volver al menú principal (opción 0) ──────────────────────
  if (texto === "0") {
    await responderBot(message, getMenuPrincipal());
    estadosUsuario[userId] = ESTADOS.MENU_PRINCIPAL;
    return;
  }

  // ── FLUJO: Menú principal ────────────────────────────────────────────────
  if (estadosUsuario[userId] === ESTADOS.MENU_PRINCIPAL) {
    if (texto === "1") {
      // Realizar pedido - Usar IA conversacional (incluye catálogo)
      estadosUsuario[userId] = ESTADOS.PEDIDO;
      await responderBot(message, "Perfecto! ¿Qué productos necesitás para tu pedido? También podés consultarme sobre nuestro catálogo de globos y decoración.");
      log(`🛒 Usuario ${userId} inició pedido`);
      return;
    }
    
    if (texto === "2") {
      // Envíos y paquetería
      await responderBot(message, getMenuPaqueteria());
      estadosUsuario[userId] = ESTADOS.MENU_PAQUETERIA;
      return;
    }
    
    await responderBot(message, getMensajeNoEntiendo());
    await responderBot(message, getMenuPrincipal());
    return;
  }

  // ── FLUJO: Menú paquetería ───────────────────────────────────────────────
  if (estadosUsuario[userId] === ESTADOS.MENU_PAQUETERIA) {
    if (texto === "1") {
      // Correo Argentino - Mostrar submenú
      await responderBot(message, getMenuCorreoArgentino());
      estadosUsuario[userId] = ESTADOS.MENU_CORREO_ARGENTINO;
      return;
    }
    
    if (texto === "2") {
      await responderBot(message, getInfoAndreani());
      estadosUsuario[userId] = ESTADOS.INFO_ANDREANI;
      return;
    }
    
    if (texto === "3") {
      await responderBot(message, getInfoMercadoLibre());
      estadosUsuario[userId] = ESTADOS.INFO_MERCADOLIBRE;
      return;
    }
    
    await responderBot(message, getMensajeNoEntiendo());
    await responderBot(message, getMenuPaqueteria());
    return;
  }

  // ── FLUJO: Submenú Correo Argentino ──────────────────────────────────────
  if (estadosUsuario[userId] === ESTADOS.MENU_CORREO_ARGENTINO) {
    if (texto === "1") {
      // Retirar envío
      await responderBot(message, getInfoCorreoArgentinoRetirar());
      estadosUsuario[userId] = ESTADOS.INFO_CORREO_RETIRAR;
      return;
    }
    
    if (texto === "2") {
      // Hacer envío
      await responderBot(message, getInfoCorreoArgentinoEnviar());
      estadosUsuario[userId] = ESTADOS.INFO_CORREO_ENVIAR;
      return;
    }
    
    if (texto === "0") {
      // Volver al menú de paquetería
      await responderBot(message, getMenuPaqueteria());
      estadosUsuario[userId] = ESTADOS.MENU_PAQUETERIA;
      return;
    }
    
    await responderBot(message, getMensajeNoEntiendo());
    await responderBot(message, getMenuCorreoArgentino());
    return;
  }

  // ── FLUJO: Viendo info de paquetería (esperar 0 o nueva consulta) ────────
  if (estadosUsuario[userId] === ESTADOS.INFO_CORREO_RETIRAR ||
      estadosUsuario[userId] === ESTADOS.INFO_CORREO_ENVIAR ||
      estadosUsuario[userId] === ESTADOS.INFO_ANDREANI || 
      estadosUsuario[userId] === ESTADOS.INFO_MERCADOLIBRE) {
    // Si escribe 0, volver al menú principal
    if (texto === "0") {
      await responderBot(message, getMenuPrincipal());
      estadosUsuario[userId] = ESTADOS.MENU_PRINCIPAL;
      return;
    }
    
    // Si escribe otra cosa, asumir que quiere volver al menú de paquetería
    await responderBot(message, "¿Querés consultar otro servicio de envío?");
    await responderBot(message, getMenuPaqueteria());
    estadosUsuario[userId] = ESTADOS.MENU_PAQUETERIA;
    return;
  }

  // ── FLUJO: Pedido (incluye catálogo) ────────────────────────────────────
  if (estadosUsuario[userId] === ESTADOS.PEDIDO) {
    // ── VERIFICACIÓN ANTI-HIJACKING ──────────────────────────────────────────
    const tipoAtaque = detectarHijacking(texto);
    if (tipoAtaque) {
      logearIntentoHijacking(userId, texto, tipoAtaque);
      registrarHijacking(userId, tipoAtaque).catch(error => {
        log(`⚠️ Error registrando hijacking: ${error.message}`, "WARN");
      });
      await responderBot(message, RESPUESTAS_ANTI_HIJACKING[tipoAtaque]);
      return;
    }

    // Validar longitud del mensaje
    if (texto.length > MAX_MESSAGE_LENGTH) {
      log(`⚠️ Mensaje muy largo: ${userId} (${texto.length} caracteres)`);
      await responderBot(message,
        `Tu mensaje es muy largo (${texto.length} caracteres). Por favor, enviá un mensaje de máximo ${MAX_MESSAGE_LENGTH} caracteres.`
      );
      return;
    }

    // Moderación de contenido
    const temaProhibido = contieneTemaProhibido(texto);
    if (temaProhibido) {
      log(`🚫 Tema prohibido bloqueado: "${temaProhibido}" de ${userId}`, "WARN");
      await responderBot(message,
        "Disculpá, solo puedo ayudarte con temas de la tienda. ¿Te puedo ayudar con algo más sobre productos o pedidos?"
      );
      return;
    }

    const insulto = contieneInsulto(texto);
    if (insulto) {
      log(`⚠️ Lenguaje ofensivo detectado: "${insulto}" de ${userId}`, "WARN");
    }

    // Detección de handoff
    const textoLower = texto.toLowerCase();
    if (textoLower.includes("humano") || 
        textoLower.includes("encargado") || 
        textoLower.includes("operador") ||
        textoLower.includes("persona") ||
        textoLower.includes("alguien") ||
        textoLower.includes("agente")) {
      // PRIMERO: Pausar al usuario para atención manual
      pausarUsuario(userId, "handoff_solicitado");
      
      // Registrar handoff en estadísticas (async, no bloquear)
      registrarHandoff(userId, "handoff_solicitado").catch(error => {
        log(`⚠️ Error registrando handoff: ${error.message}`, "WARN");
      });
      
      // SEGUNDO: Enviar mensaje de confirmación
      await responderBot(message,
        "Entendido 👋 Un agente se va a comunicar con vos a la brevedad. ¡Gracias por tu paciencia!"
      );
      
      // TERCERO: Log del evento
      log(`🚨 HANDOFF solicitado por ${userId}`);
      
      // NO cambiar estado a MENU_PRINCIPAL - el usuario queda pausado
      return;
    }

    // Historial de conversación
    if (!conversaciones[userId]) {
      conversaciones[userId] = [];
    }

    conversaciones[userId].push({
      role: "user",
      parts: [{ text: texto }],
    });

    if (conversaciones[userId].length > 10) {
      conversaciones[userId] = conversaciones[userId].slice(-10);
    }

    // Búsqueda en catálogo (RAG)
    log(`🔍 Buscando productos: "${texto}"`);

    let productosEncontrados = [];
    try {
      productosEncontrados = buscarProductos(texto, 5);
      log(`📦 Productos encontrados: ${productosEncontrados.length}`);
      
      // Registrar búsqueda en estadísticas (async, no bloquear)
      registrarBusqueda(texto, productosEncontrados.length).catch(error => {
        log(`⚠️ Error registrando búsqueda: ${error.message}`, "WARN");
      });
    } catch (error) {
      log(`⚠️ Error buscando productos: ${error.message}`, "WARN");
      // Registrar búsqueda fallida (async, no bloquear)
      registrarBusqueda(texto, 0).catch(error => {
        log(`⚠️ Error registrando búsqueda fallida: ${error.message}`, "WARN");
      });
      // Continuar sin productos - el bot responderá sin contexto del catálogo
    }

    let contextoProductos = "";
    if (productosEncontrados.length > 0) {
      contextoProductos = formatearProductosParaContexto(productosEncontrados);
    }

    // Llamada al LLM con reintentos
    try {
      const chat = model.startChat({
        history: conversaciones[userId].slice(0, -1),
      });

      let mensajeConContexto = texto;
      if (contextoProductos) {
        mensajeConContexto = `${contextoProductos}\n\n---\n\nPregunta del cliente: ${texto}\n\nInstrucciones especiales:\n1. Si el cliente usa lenguaje coloquial como "cositos", "flecos", "para colgar", INTERPRETÁ qué está buscando\n2. Los productos listados arriba son los más relevantes para su consulta\n3. Si no hay productos exactos, SUGERÍ productos similares o relacionados\n4. PREGUNTÁ para clarificar si es necesario (colores, ocasión, tamaño)\n5. Sé conversacional y ayudá al cliente a encontrar lo que necesita`;
      } else {
        // Si no hay productos, dar sugerencias generales
        mensajeConContexto = `Pregunta del cliente: ${texto}\n\nNo se encontraron productos específicos para esta consulta, pero:\n1. INTERPRETÁ qué podría estar buscando el cliente\n2. SUGERÍ categorías de productos que podrían interesarle\n3. PREGUNTÁ para clarificar qué necesita exactamente\n4. Mencioná que tenés amplio catálogo de cotillón y decoración`;
      }

      const respuesta = await llamarGeminiConReintentos(chat, mensajeConContexto);

      conversaciones[userId].push({
        role: "model",
        parts: [{ text: respuesta }],
      });

      log(`🤖 Bot: ${respuesta}`);
      await responderBot(message, respuesta);
      
      // Ofrecer volver al menú
      await responderBot(message, "\n¿Necesitás algo más? Respondé *0* para volver al menú principal.");
      
    } catch (error) {
      log(`❌ Error después de reintentos: ${error.message}`, "ERROR");
      await responderBot(message,
        "Ups, tuve un problema técnico. Por favor intentá de nuevo en un momento."
      );
    }
    return;
  }

  // ── FLUJO: Cualquier otro estado (volver al menú) ────────────────────────
  await responderBot(message, getMenuPrincipal());
  estadosUsuario[userId] = ESTADOS.MENU_PRINCIPAL;
});

client.initialize();