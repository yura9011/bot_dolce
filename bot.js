require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
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
  getInfoCorreoArgentino,
  getInfoAndreani,
  getInfoMercadoLibre,
  getMenuEnvios,
  getInfoPreparacionPaquete,
  getInfoPaqueteListo,
  getMensajePedirNombre,
  getMensajeNoEntiendo,
} = require("./flujos.js");

// ─── UTILIDADES DE LOGGING ────────────────────────────────────────────────────

const LOG_FILE = path.join(__dirname, "logs", "bot.log");

// Crear carpeta de logs si no existe
if (!fs.existsSync(path.join(__dirname, "logs"))) {
  fs.mkdirSync(path.join(__dirname, "logs"), { recursive: true });
}

// Función para obtener timestamp formateado [DD/MM/YYYY HH:mm:ss]
function getTimestamp() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `[${day}/${month}/${year} ${hours}:${minutes}:${seconds}]`;
}

// Función para hacer log (consola + archivo)
function log(mensaje, nivel = "INFO") {
  const timestamp = getTimestamp();
  const logLine = `${timestamp} [${nivel}] ${mensaje}`;
  
  // Consola
  console.log(logLine);
  
  // Archivo
  try {
    fs.appendFileSync(LOG_FILE, logLine + "\n");
  } catch (error) {
    console.error(`Error escribiendo log: ${error.message}`);
  }
}

// ─── CONFIGURACIÓN ───────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT;

// Números autorizados para comandos administrativos
const ADMIN_NUMBERS = process.env.ADMIN_NUMBERS 
  ? process.env.ADMIN_NUMBERS.split(',').map(n => n.trim())
  : [];

// Validar que las variables de entorno estén configuradas
if (!GEMINI_API_KEY) {
  console.error("❌ Error: GEMINI_API_KEY no está configurada en el archivo .env");
  process.exit(1);
}

if (!SYSTEM_PROMPT) {
  console.error("❌ Error: SYSTEM_PROMPT no está configurada en el archivo .env");
  process.exit(1);
}

// Configuración de límites y reintentos
const MAX_MESSAGE_LENGTH = 500;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const DEBOUNCE_TIME_MS = 1000;

// ─── INICIALIZACIÓN ───────────────────────────────────────────────────────────

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // Modelo estable recomendado para producción
  systemInstruction: SYSTEM_PROMPT,
});

// Memoria de conversaciones por usuario (se limpia al reiniciar el bot)
const conversaciones = {};

// Control de mensajes duplicados/rápidos (debounce por usuario)
const lastMessageTime = {};

// Estado del flujo por usuario
const estadosUsuario = {};

// Datos del usuario (nombre, etc.)
const datosUsuario = {};

// ─── SISTEMA DE CONTROL MANUAL ───────────────────────────────────────────────

// IDs de mensajes enviados por el bot (para distinguir bot vs manual)
const mensajesDelBot = new Set();

// Usuarios pausados (atención manual activa)
let usuariosPausados = {};

// Pausa global
let pausaGlobal = false;

// Archivos de persistencia
const ARCHIVO_PAUSAS = path.join(__dirname, "data", "pausas.json");
const ARCHIVO_HISTORIAL = path.join(__dirname, "data", "historial.json");

// Crear carpeta data si no existe
if (!fs.existsSync(path.join(__dirname, "data"))) {
  fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
}

// Cargar estado de pausas al iniciar
function cargarEstadoPausas() {
  try {
    if (fs.existsSync(ARCHIVO_PAUSAS)) {
      const data = fs.readFileSync(ARCHIVO_PAUSAS, "utf8");
      const estado = JSON.parse(data);
      usuariosPausados = estado.usuarios || {};
      pausaGlobal = estado.global || false;
      log(`📂 Estado de pausas cargado: ${Object.keys(usuariosPausados).length} usuarios pausados`);
    }
  } catch (error) {
    log(`⚠️ Error cargando estado de pausas: ${error.message}`, "WARN");
  }
}

// Guardar estado de pausas
function guardarEstadoPausas() {
  try {
    const estado = {
      global: pausaGlobal,
      usuarios: usuariosPausados,
      timestamp: Date.now()
    };
    fs.writeFileSync(ARCHIVO_PAUSAS, JSON.stringify(estado, null, 2));
  } catch (error) {
    log(`⚠️ Error guardando estado de pausas: ${error.message}`, "WARN");
  }
}

// Pausar usuario
function pausarUsuario(userId, razon) {
  usuariosPausados[userId] = {
    pausado: true,
    timestamp: Date.now(),
    razon: razon,
    notificado: false  // Para enviar notificación en próximo mensaje
  };
  guardarEstadoPausas();
  log(`⏸️ Usuario ${userId} pausado (${razon})`);
}

// Reanudar usuario
function reanudarUsuario(userId) {
  if (usuariosPausados[userId]) {
    delete usuariosPausados[userId];
    guardarEstadoPausas();
    log(`▶️ Usuario ${userId} reanudado`);
    return true;
  }
  return false;
}

// Guardar mensaje en historial
function guardarEnHistorial(userId, role, texto) {
  try {
    let historial = {};
    
    // Cargar historial existente
    if (fs.existsSync(ARCHIVO_HISTORIAL)) {
      const data = fs.readFileSync(ARCHIVO_HISTORIAL, "utf8");
      historial = JSON.parse(data);
    }
    
    // Inicializar array para usuario si no existe
    if (!historial[userId]) {
      historial[userId] = [];
    }
    
    // Agregar mensaje
    historial[userId].push({
      timestamp: Date.now(),
      role: role, // "user", "bot", "manual"
      text: texto
    });
    
    // Guardar
    fs.writeFileSync(ARCHIVO_HISTORIAL, JSON.stringify(historial, null, 2));
  } catch (error) {
    log(`⚠️ Error guardando historial: ${error.message}`, "WARN");
  }
}

// Verificar si es número admin
function esAdmin(numero) {
  // Normalizar número (quitar @c.us si existe)
  const numeroLimpio = numero.replace("@c.us", "");
  return ADMIN_NUMBERS.some(admin => numeroLimpio === admin);
}

// Función helper para responder y marcar como mensaje del bot
async function responderBot(message, texto) {
  const respuesta = await message.reply(texto);
  // Marcar este mensaje como del bot
  if (respuesta && respuesta.id && respuesta.id._serialized) {
    mensajesDelBot.add(respuesta.id._serialized);
  }
  // Guardar en historial
  guardarEnHistorial(message.from, "bot", texto);
  return respuesta;
}

// Procesar comandos administrativos
async function procesarComandoAdmin(message, comando) {
  const partes = comando.trim().split(" ");
  const cmd = partes.slice(0, 3).join(" ").toUpperCase(); // Primeras 3 palabras
  
  // PAUSAR BOT GLOBAL
  if (cmd === "PAUSAR BOT GLOBAL") {
    pausaGlobal = true;
    guardarEstadoPausas();
    await message.reply("✅ Bot pausado globalmente. Ningún cliente recibirá respuestas automáticas.");
    log("🔴 Bot pausado globalmente por admin");
    return true;
  }
  
  // REANUDAR BOT GLOBAL
  if (cmd === "REANUDAR BOT GLOBAL") {
    pausaGlobal = false;
    guardarEstadoPausas();
    await message.reply("✅ Bot reanudado globalmente. Volviendo a responder automáticamente.");
    log("🟢 Bot reanudado globalmente por admin");
    return true;
  }
  
  // ESTADO BOT
  if (partes[0].toUpperCase() === "ESTADO" && partes[1].toUpperCase() === "BOT") {
    const usuariosPausadosCount = Object.keys(usuariosPausados).length;
    let respuesta = "📊 *Estado del Bot*\n\n";
    respuesta += `• Global: ${pausaGlobal ? "⏸️ Pausado" : "✅ Activo"}\n`;
    respuesta += `• Usuarios pausados: ${usuariosPausadosCount}\n`;
    
    if (usuariosPausadosCount > 0) {
      respuesta += "\n*Usuarios en atención manual:*\n";
      for (const [userId, pausa] of Object.entries(usuariosPausados)) {
        const minutos = Math.floor((Date.now() - pausa.timestamp) / 60000);
        respuesta += `  - ${userId.replace("@c.us", "")} (hace ${minutos} min)\n`;
      }
    }
    
    await message.reply(respuesta);
    return true;
  }
  
  // REANUDAR [numero]
  if (partes[0].toUpperCase() === "REANUDAR" && partes.length >= 2) {
    const numero = partes[1] + "@c.us";
    if (reanudarUsuario(numero)) {
      await message.reply(`✅ Usuario ${partes[1]} reanudado. El bot volverá a responderle.`);
    } else {
      await message.reply(`⚠️ Usuario ${partes[1]} no estaba pausado.`);
    }
    return true;
  }
  
  return false;
}

// ─── CLIENTE DE WHATSAPP ──────────────────────────────────────────────────────

const client = new Client({
  authStrategy: new LocalAuth(), // guarda la sesión para no escanear el QR cada vez
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  log("\n📱 Escanea este QR con tu WhatsApp:\n");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  log("✅ Bot conectado y listo!");
  
  const stats = obtenerEstadisticasCatalogo();
  log(`📦 Catálogo: ${stats.totalProductos} productos en ${stats.totalCategorias} categorías`);
  
  // Cargar estado de pausas
  cargarEstadoPausas();
  
  if (ADMIN_NUMBERS.length > 0) {
    log(`🔐 ${ADMIN_NUMBERS.length} números admin configurados`);
  } else {
    log(`⚠️ No hay números admin configurados. Los comandos no funcionarán.`, "WARN");
  }
});

// ─── DETECCIÓN DE INTERVENCIÓN MANUAL ────────────────────────────────────────

client.on("message_create", async (message) => {
  // Solo procesar mensajes enviados por el bot/personal (fromMe = true)
  if (!message.fromMe) return;
  
  // Ignorar mensajes a grupos
  if (message.to.includes("@g.us")) return;
  
  // Ignorar mensajes de estado/notificaciones
  const tiposIgnorados = ["revoked", "e2e_notification", "notification_template"];
  if (tiposIgnorados.includes(message.type)) return;
  
  const clienteId = message.to;
  const messageId = message.id._serialized;
  
  // Si el mensaje está en nuestro Set, es respuesta automática del bot
  if (mensajesDelBot.has(messageId)) {
    mensajesDelBot.delete(messageId); // Limpiar para liberar memoria
    return;
  }
  
  // Si llegamos acá, es respuesta MANUAL del personal
  log(`🤚 Intervención manual detectada para ${clienteId}`);
  
  // Si ya está pausado, solo actualizar historial
  if (usuariosPausados[clienteId]) {
    guardarEnHistorial(clienteId, "manual", message.body);
    return;
  }
  
  // Pausar usuario
  pausarUsuario(clienteId, "intervencion_manual");
  guardarEnHistorial(clienteId, "manual", message.body);
});

// ─── MODERACIÓN DE CONTENIDO ─────────────────────────────────────────────────

// Tópicos prohibidos (política, religión, deportes, etc.)
const TOPICOS_PROHIBIDOS = [
  'hitler', 'nazi', 'fascis', 'comunis', 'socialist', 'capitalis',
  'trump', 'biden', 'macri', 'cristina', 'milei', 'massa', 'kirchner',
  'peronismo', 'dictadura', 'palestine', 'israel', 'gaza',
  'dios', 'jesús', 'alá', 'buda', 'religión', 'iglesia', 'biblia', 'corán',
  'aborto', 'drogas', 'armas', 'guerra', 'terroris',
  'messi', 'ronaldo', 'mundial', 'netflix', 'película',
  'fútbol', 'boca', 'river', 'matemática', 'física', 'universidad',
];

// Lenguaje ofensivo (para registrar, no bloquear)
const LENGUAJE_OFENSIVO = [
  'puta', 'puto', 'hijo de puta', 'hija de puta', 'hdp',
  'concha de tu madre', 'pelotudo', 'pelotuda', 'boludo',
  'forro', 'idiota', 'imbécil', 'tarado', 'estúpido',
  'la puta madre', 'me cago en', 'andate a la mierda',
];

function contieneTemaProhibido(texto) {
  const textoLower = texto.toLowerCase();
  for (const palabra of TOPICOS_PROHIBIDOS) {
    if (textoLower.includes(palabra)) {
      return palabra;
    }
  }
  return null;
}

function contieneInsulto(texto) {
  const textoLower = texto.toLowerCase();
  for (const palabra of LENGUAJE_OFENSIVO) {
    if (textoLower.includes(palabra)) {
      return palabra;
    }
  }
  return null;
}

// ─── FUNCIÓN DE REINTENTO PARA LLAMADAS A GEMINI ─────────────────────────────

// Función que reintenta la llamada a Gemini hasta MAX_RETRIES veces
async function llamarGeminiConReintentos(chat, texto) {
  let lastError;
  
  for (let intento = 1; intento <= MAX_RETRIES; intento++) {
    try {
      log(`🔄 Intento ${intento}/${MAX_RETRIES} de llamada a Gemini`);
      const result = await chat.sendMessage(texto);
      const respuesta = result.response.text();
      return respuesta;
    } catch (error) {
      lastError = error;
      log(`⚠️ Error en intento ${intento}: ${error.message}`, "WARN");
      
      if (intento < MAX_RETRIES) {
        log(`⏳ Esperando ${RETRY_DELAY_MS}ms antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }
  
  throw lastError;
}

client.on("message", async (message) => {
  // Ignorar mensajes de grupos
  if (message.from.includes("@g.us")) return;

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
  
  // Guardar mensaje del usuario en historial
  guardarEnHistorial(userId, "user", texto);

  // ── COMANDOS ADMINISTRATIVOS ─────────────────────────────────────────────
  if (esAdmin(userId)) {
    const esComando = await procesarComandoAdmin(message, texto);
    if (esComando) return; // Si era un comando, no continuar con lógica normal
  }

  // ── VERIFICAR PAUSA GLOBAL ───────────────────────────────────────────────
  if (pausaGlobal) {
    log(`⏸️ Bot pausado globalmente - Mensaje ignorado de ${userId}`);
    return;
  }

  // ── VERIFICAR PAUSA POR USUARIO ──────────────────────────────────────────
  if (usuariosPausados[userId]?.pausado) {
    // Si no se ha notificado, enviar notificación ahora
    if (!usuariosPausados[userId].notificado) {
      await message.reply("⏸️ Un agente está atendiendo tu consulta. Te responderá en breve.");
      usuariosPausados[userId].notificado = true;
      guardarEstadoPausas();
      log(`📢 Notificación enviada a ${userId}`);
    }
    
    log(`⏸️ Usuario ${userId} en atención manual - Bot no responde`);
    return;
  }

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
    datosUsuario[userId] = { nombre: texto };
    await responderBot(message, `Encantado de conocerte, ${texto}! 😊`);
    await responderBot(message, getMenuPrincipal());
    estadosUsuario[userId] = ESTADOS.MENU_PRINCIPAL;
    log(`✅ Usuario ${userId} registrado como: ${texto}`);
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
      // Realizar pedido - Usar IA conversacional
      estadosUsuario[userId] = ESTADOS.PEDIDO;
      await responderBot(message, "Perfecto! ¿Qué productos necesitás para tu pedido?");
      log(`🛒 Usuario ${userId} inició pedido`);
      return;
    }
    
    if (texto === "2") {
      // Catálogo de globos - Usar IA conversacional
      estadosUsuario[userId] = ESTADOS.CATALOGO;
      await responderBot(message, "¡Claro! ¿Qué tipo de globos estás buscando? (cumpleaños, temáticos, números, etc.)");
      log(`🎈 Usuario ${userId} consultó catálogo`);
      return;
    }
    
    if (texto === "3") {
      // Consulta sobre paquetería
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
      await responderBot(message, getInfoCorreoArgentino());
      estadosUsuario[userId] = ESTADOS.INFO_CORREO;
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

  // ── FLUJO: Viendo info de paquetería (esperar 0 o nueva consulta) ────────
  if (estadosUsuario[userId] === ESTADOS.INFO_CORREO || 
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

  // ── FLUJO: Pedido o Catálogo (usar IA) ──────────────────────────────────
  if (estadosUsuario[userId] === ESTADOS.PEDIDO || estadosUsuario[userId] === ESTADOS.CATALOGO) {
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
    if (texto.toLowerCase().includes("humano")) {
      await responderBot(message,
        "Entendido 👋 Un agente se va a comunicar con vos a la brevedad. ¡Gracias por tu paciencia!"
      );
      log(`🚨 HANDOFF solicitado por ${userId}`);
      estadosUsuario[userId] = ESTADOS.MENU_PRINCIPAL;
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
    const productosEncontrados = buscarProductos(texto, 5);
    log(`📦 Productos encontrados: ${productosEncontrados.length}`);

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
        mensajeConContexto = `${contextoProductos}\n\n---\n\nPregunta del cliente: ${texto}\n\nInstrucción: Respondé usando SOLO la información de los productos listados arriba. Si el producto existe, mencioná nombre, precio y características. Si no existe o no hay productos listados, decí que no lo tenés en stock pero que pueden consultar por otros productos.`;
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
      log(`❌ Error después de ${MAX_RETRIES} intentos: ${error.message}`, "ERROR");
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