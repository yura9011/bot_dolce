const fs = require("fs");
const path = require("path");
const { log } = require("./logging");
const { 
  getUsuariosPausados, 
  getPausaGlobal, 
  setPausaGlobal, 
  pausarUsuario, 
  reanudarUsuario,
  AUTO_RESUME_TIMEOUT_MS 
} = require("./control-manual");

// ─── COMANDOS ADMINISTRATIVOS ────────────────────────────────────────────────

// Números autorizados para comandos administrativos
const ADMIN_NUMBERS = process.env.ADMIN_NUMBERS 
  ? process.env.ADMIN_NUMBERS.split(',').map(n => n.trim())
  : [];

// Verificar si es número admin
function esAdmin(numero) {
  // Normalizar número (quitar @c.us o @lid si existe)
  const numeroLimpio = numero.replace(/@(c\.us|lid)$/, "");
  return ADMIN_NUMBERS.some(admin => numeroLimpio === admin);
}

// Procesar comandos administrativos
async function procesarComandoAdmin(message, comando, estadosUsuario) {
  const partes = comando.trim().split(" ");
  const cmd = partes.slice(0, 3).join(" ").toUpperCase(); // Primeras 3 palabras
  
  // PAUSAR BOT GLOBAL
  if (cmd === "PAUSAR BOT GLOBAL") {
    setPausaGlobal(true);
    await message.reply("✅ Bot pausado globalmente. Ningún cliente recibirá respuestas automáticas.");
    log("🔴 Bot pausado globalmente por admin");
    return true;
  }
  
  // REANUDAR BOT GLOBAL
  if (cmd === "REANUDAR BOT GLOBAL") {
    setPausaGlobal(false);
    await message.reply("✅ Bot reanudado globalmente. Volviendo a responder automáticamente.");
    log("🟢 Bot reanudado globalmente por admin");
    return true;
  }
  
  // ESTADO BOT
  if (partes[0].toUpperCase() === "ESTADO" && partes[1].toUpperCase() === "BOT") {
    const usuariosPausados = getUsuariosPausados();
    const usuariosPausadosCount = Object.keys(usuariosPausados).length;
    let respuesta = "📊 *Estado del Bot*\n\n";
    respuesta += `• Global: ${getPausaGlobal() ? "⏸️ Pausado" : "✅ Activo"}\n`;
    respuesta += `• Usuarios pausados: ${usuariosPausadosCount}\n`;
    
    if (usuariosPausadosCount > 0) {
      respuesta += "\n*Usuarios en atención manual:*\n";
      const ahora = Date.now();
      for (const [userId, pausa] of Object.entries(usuariosPausados)) {
        const minutos = Math.floor((ahora - pausa.timestamp) / 60000);
        const minutosRestantes = Math.max(0, Math.ceil((AUTO_RESUME_TIMEOUT_MS - (ahora - pausa.timestamp)) / 60000));
        respuesta += `  - ${userId.replace(/@(c\.us|lid)$/, "")} (${minutos} min, auto-reactiva en ${minutosRestantes} min)\n`;
      }
    }
    
    await message.reply(respuesta);
    return true;
  }
  
  // SEGURIDAD BOT - Ver intentos de hijacking
  if (partes[0].toUpperCase() === "SEGURIDAD" && partes[1].toUpperCase() === "BOT") {
    try {
      const archivoSeguridad = path.join(__dirname, "..", "logs", "security.log");
      if (fs.existsSync(archivoSeguridad)) {
        const logs = fs.readFileSync(archivoSeguridad, "utf8");
        const lineas = logs.split('\n').filter(l => l.trim()).slice(-10); // Últimas 10 líneas
        
        let respuesta = "🔒 *Últimos Intentos de Hijacking*\n\n";
        if (lineas.length === 0) {
          respuesta += "✅ No hay intentos de hijacking registrados";
        } else {
          lineas.forEach((linea, index) => {
            const match = linea.match(/\[(.+?)\].*Usuario: (.+?) - Tipo: (.+?) - Mensaje:/);
            if (match) {
              const [, timestamp, userId, tipo] = match;
              respuesta += `${index + 1}. ${timestamp}\n`;
              respuesta += `   Usuario: ${userId.replace(/@(c\.us|lid)$/, "")}\n`;
              respuesta += `   Tipo: ${tipo}\n\n`;
            }
          });
        }
        
        await message.reply(respuesta);
      } else {
        await message.reply("🔒 No hay logs de seguridad disponibles");
      }
    } catch (error) {
      await message.reply("❌ Error leyendo logs de seguridad");
    }
    return true;
  }
  
  // PAUSAR [numero]
  if (partes[0].toUpperCase() === "PAUSAR" && partes.length >= 2) {
    const numeroBase = partes[1];
    
    // Buscar el usuario con ambos formatos posibles
    let usuarioEncontrado = null;
    const formatosPosibles = [`${numeroBase}@c.us`, `${numeroBase}@lid`];
    
    for (const formato of formatosPosibles) {
      if (estadosUsuario[formato]) {
        usuarioEncontrado = formato;
        break;
      }
    }
    
    if (usuarioEncontrado) {
      pausarUsuario(usuarioEncontrado, "pausado_por_admin");
      await message.reply(`✅ Usuario ${numeroBase} pausado. El bot dejará de responderle.`);
    } else {
      // Verificar si el usuario ya está pausado desde una sesión anterior
      const usuariosPausados = getUsuariosPausados();
      let usuarioYaPausado = null;
      
      for (const formato of formatosPosibles) {
        if (usuariosPausados[formato]) {
          usuarioYaPausado = formato;
          break;
        }
      }
      
      if (usuarioYaPausado) {
        await message.reply(`⚠️ Usuario ${numeroBase} ya está pausado desde una sesión anterior.`);
      } else {
        await message.reply(`⚠️ Usuario ${numeroBase} no tiene conversación activa con el bot y no está pausado.`);
      }
    }
    return true;
  }
  
  // REANUDAR [numero]
  if (partes[0].toUpperCase() === "REANUDAR" && partes.length >= 2) {
    const numeroBase = partes[1];
    
    // Buscar el usuario con ambos formatos posibles
    let usuarioEncontrado = null;
    const formatosPosibles = [`${numeroBase}@c.us`, `${numeroBase}@lid`];
    
    for (const formato of formatosPosibles) {
      if (getUsuariosPausados()[formato]) {
        usuarioEncontrado = formato;
        break;
      }
    }
    
    if (usuarioEncontrado && reanudarUsuario(usuarioEncontrado)) {
      await message.reply(`✅ Usuario ${numeroBase} reanudado. El bot volverá a responderle.`);
    } else {
      await message.reply(`⚠️ Usuario ${numeroBase} no estaba pausado.`);
    }
    return true;
  }
  
  return false;
}

module.exports = {
  esAdmin,
  procesarComandoAdmin,
  ADMIN_NUMBERS
};