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

  // ── FLUJO: Primera interacción (enviar bienvenida) ───────────────────────
  if (!estadosUsuario[userId]) {
    estadosUsuario[userId] = ESTADOS.INICIAL;
    await message.reply(getMensajeBienvenida());
    await message.reply(getMensajePedirNombre());
    estadosUsuario[userId] = ESTADOS.ESPERANDO_NOMBRE;
    log(`👋 Nuevo usuario: ${userId} - Enviando bienvenida`);
    return;
  }

  // ── FLUJO: Esperando nombre ──────────────────────────────────────────────
  if (estadosUsuario[userId] === ESTADOS.ESPERANDO_NOMBRE) {
    datosUsuario[userId] = { nombre: texto };
    await message.reply(`Encantado de conocerte, ${texto}! 😊`);
    await message.reply(getMenuPrincipal());
    estadosUsuario[userId] = ESTADOS.MENU_PRINCIPAL;
    log(`✅ Usuario ${userId} registrado como: ${texto}`);
    return;
  }

  // ── NAVEGACIÓN: Volver al menú principal (opción 0) ──────────────────────
  if (texto === "0") {
    await message.reply(getMenuPrincipal());
    estadosUsuario[userId] = ESTADOS.MENU_PRINCIPAL;
    return;
  }

  // ── FLUJO: Menú principal ────────────────────────────────────────────────
  if (estadosUsuario[userId] === ESTADOS.MENU_PRINCIPAL) {
    if (texto === "1") {
      // Realizar pedido - Usar IA conversacional
      estadosUsuario[userId] = ESTADOS.PEDIDO;
      await message.reply("Perfecto! ¿Qué productos necesitás para tu pedido?");
      log(`🛒 Usuario ${userId} inició pedido`);
      return;
    }
    
    if (texto === "2") {
      // Catálogo de globos - Usar IA conversacional
      estadosUsuario[userId] = ESTADOS.CATALOGO;
      await message.reply("¡Claro! ¿Qué tipo de globos estás buscando? (cumpleaños, temáticos, números, etc.)");
      log(`🎈 Usuario ${userId} consultó catálogo`);
      return;
    }
    
    if (texto === "3") {
      // Consulta sobre paquetería
      await message.reply(getMenuPaqueteria());
      estadosUsuario[userId] = ESTADOS.MENU_PAQUETERIA;
      return;
    }
    
    await message.reply(getMensajeNoEntiendo());
    await message.reply(getMenuPrincipal());
    return;
  }

  // ── FLUJO: Menú paquetería ───────────────────────────────────────────────
  if (estadosUsuario[userId] === ESTADOS.MENU_PAQUETERIA) {
    if (texto === "1") {
      await message.reply(getInfoCorreoArgentino());
      estadosUsuario[userId] = ESTADOS.INFO_CORREO;
      return;
    }
    
    if (texto === "2") {
      await message.reply(getInfoAndreani());
      estadosUsuario[userId] = ESTADOS.INFO_ANDREANI;
      return;
    }
    
    if (texto === "3") {
      await message.reply(getInfoMercadoLibre());
      estadosUsuario[userId] = ESTADOS.INFO_MERCADOLIBRE;
      return;
    }
    
    await message.reply(getMensajeNoEntiendo());
    await message.reply(getMenuPaqueteria());
    return;
  }

  // ── FLUJO: Viendo info de paquetería (esperar 0 o nueva consulta) ────────
  if (estadosUsuario[userId] === ESTADOS.INFO_CORREO || 
      estadosUsuario[userId] === ESTADOS.INFO_ANDREANI || 
      estadosUsuario[userId] === ESTADOS.INFO_MERCADOLIBRE) {
    // Si escribe 0, volver al menú principal
    if (texto === "0") {
      await message.reply(getMenuPrincipal());
      estadosUsuario[userId] = ESTADOS.MENU_PRINCIPAL;
      return;
    }
    
    // Si escribe otra cosa, asumir que quiere volver al menú de paquetería
    await message.reply("¿Querés consultar otro servicio de envío?");
    await message.reply(getMenuPaqueteria());
    estadosUsuario[userId] = ESTADOS.MENU_PAQUETERIA;
    return;
  }

  // ── FLUJO: Pedido o Catálogo (usar IA) ──────────────────────────────────
  if (estadosUsuario[userId] === ESTADOS.PEDIDO || estadosUsuario[userId] === ESTADOS.CATALOGO) {
    // Validar longitud del mensaje
    if (texto.length > MAX_MESSAGE_LENGTH) {
      log(`⚠️ Mensaje muy largo: ${userId} (${texto.length} caracteres)`);
      await message.reply(
        `Tu mensaje es muy largo (${texto.length} caracteres). Por favor, enviá un mensaje de máximo ${MAX_MESSAGE_LENGTH} caracteres.`
      );
      return;
    }

    // Moderación de contenido
    const temaProhibido = contieneTemaProhibido(texto);
    if (temaProhibido) {
      log(`🚫 Tema prohibido bloqueado: "${temaProhibido}" de ${userId}`, "WARN");
      await message.reply(
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
      await message.reply(
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
      await message.reply(respuesta);
      
      // Ofrecer volver al menú
      await message.reply("\n¿Necesitás algo más? Respondé *0* para volver al menú principal.");
      
    } catch (error) {
      log(`❌ Error después de ${MAX_RETRIES} intentos: ${error.message}`, "ERROR");
      await message.reply(
        "Ups, tuve un problema técnico. Por favor intentá de nuevo en un momento."
      );
    }
    return;
  }

  // ── FLUJO: Cualquier otro estado (volver al menú) ────────────────────────
  await message.reply(getMenuPrincipal());
  estadosUsuario[userId] = ESTADOS.MENU_PRINCIPAL;
});

client.initialize();