const fs = require("fs");
const path = require("path");
const { log } = require("./logging");

// ─── SISTEMA DE CONTROL MANUAL ───────────────────────────────────────────────

const AUTO_RESUME_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos

// Archivos de persistencia
const ARCHIVO_PAUSAS = path.join(__dirname, "..", "data", "pausas.json");
const ARCHIVO_HISTORIAL = path.join(__dirname, "..", "data", "historial.json");

// Crear carpeta data si no existe
if (!fs.existsSync(path.join(__dirname, "..", "data"))) {
  fs.mkdirSync(path.join(__dirname, "..", "data"), { recursive: true });
}

// Estado global
let usuariosPausados = {};
let pausaGlobal = false;
let timerReactivacion = null;

// Cargar estado de pausas al iniciar
function cargarEstadoPausas() {
  try {
    if (fs.existsSync(ARCHIVO_PAUSAS)) {
      const data = fs.readFileSync(ARCHIVO_PAUSAS, "utf8");
      const estado = JSON.parse(data);
      usuariosPausados = estado.usuarios || {};
      pausaGlobal = estado.global || false;
      log(`📂 Estado de pausas cargado: ${Object.keys(usuariosPausados).length} usuarios pausados`);
      
      // Programar reactivación automática para usuarios existentes
      programarReactivacionAutomatica();
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
  
  // Programar reactivación automática
  programarReactivacionAutomatica();
}

// Reanudar usuario
function reanudarUsuario(userId) {
  if (usuariosPausados[userId]) {
    delete usuariosPausados[userId];
    guardarEstadoPausas();
    log(`▶️ Usuario ${userId} reanudado`);
    
    // Reprogramar timer si quedan usuarios pausados
    programarReactivacionAutomatica();
    return true;
  }
  return false;
}

// Programar reactivación automática para usuarios que llevan mucho tiempo pausados
function programarReactivacionAutomatica() {
  // Limpiar timer anterior
  if (timerReactivacion) {
    clearTimeout(timerReactivacion);
    timerReactivacion = null;
  }
  
  const ahora = Date.now();
  let proximoVencimiento = null;
  
  // Buscar el usuario que vence más pronto
  for (const [userId, pausa] of Object.entries(usuariosPausados)) {
    const tiempoEspera = ahora - pausa.timestamp;
    const tiempoRestante = AUTO_RESUME_TIMEOUT_MS - tiempoEspera;
    
    if (tiempoRestante > 0) {
      if (!proximoVencimiento || tiempoRestante < proximoVencimiento.tiempo) {
        proximoVencimiento = { userId, tiempo: tiempoRestante };
      }
    }
  }
  
  // Si hay usuarios que vencen, programar timer
  if (proximoVencimiento) {
    timerReactivacion = setTimeout(() => {
      verificarYReactivarUsuarios();
    }, proximoVencimiento.tiempo);
    
    const minutosRestantes = Math.ceil(proximoVencimiento.tiempo / 60000);
    log(`⏰ Reactivación automática programada en ${minutosRestantes} minutos para ${proximoVencimiento.userId}`);
  }
}

// Verificar y reactivar usuarios que han estado pausados demasiado tiempo
async function verificarYReactivarUsuarios() {
  const ahora = Date.now();
  const usuariosAReactivar = [];
  
  for (const [userId, pausa] of Object.entries(usuariosPausados)) {
    const tiempoEspera = ahora - pausa.timestamp;
    
    if (tiempoEspera >= AUTO_RESUME_TIMEOUT_MS) {
      usuariosAReactivar.push(userId);
    }
  }
  
  // Reactivar usuarios y enviar mensaje explicativo
  for (const userId of usuariosAReactivar) {
    const minutosEspera = Math.floor((ahora - usuariosPausados[userId].timestamp) / 60000);
    
    try {
      // Enviar mensaje explicativo al usuario
      const { getClient } = require("./whatsapp-client");
      const client = getClient();
      
      await client.sendMessage(userId, 
        `Hola! 👋 Disculpá la demora. Nuestro equipo no pudo atenderte en este momento.\n\n` +
        `El bot vuelve a estar activo para ayudarte. ¿En qué puedo asistirte?`
      );
      
      log(`🔄 Usuario ${userId} reactivado automáticamente después de ${minutosEspera} minutos`);
    } catch (error) {
      log(`❌ Error enviando mensaje de reactivación a ${userId}: ${error.message}`, "ERROR");
    }
    
    // Reanudar usuario
    reanudarUsuario(userId);
  }
  
  // Reprogramar para próximos vencimientos
  programarReactivacionAutomatica();
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

// Getters para el estado
function getUsuariosPausados() {
  return usuariosPausados;
}

function getPausaGlobal() {
  return pausaGlobal;
}

function setPausaGlobal(estado) {
  pausaGlobal = estado;
  guardarEstadoPausas();
}

function estaUsuarioPausado(userId) {
  return usuariosPausados[userId]?.pausado || false;
}

module.exports = {
  cargarEstadoPausas,
  pausarUsuario,
  reanudarUsuario,
  guardarEnHistorial,
  getUsuariosPausados,
  getPausaGlobal,
  setPausaGlobal,
  estaUsuarioPausado,
  AUTO_RESUME_TIMEOUT_MS
};