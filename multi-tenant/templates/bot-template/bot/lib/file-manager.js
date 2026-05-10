const fs = require("fs");
const path = require("path");
const { log } = require("./logging");

// ─── SISTEMA DE GESTIÓN DE ARCHIVOS CON LOCKING ──────────────────────────────

// Map para trackear operaciones en curso
const operacionesEnCurso = new Map();

// Función para leer archivo JSON de forma segura
async function leerArchivoJSON(rutaArchivo, estructuraPorDefecto = {}) {
  const clave = path.resolve(rutaArchivo);
  
  // Esperar si hay una operación en curso
  while (operacionesEnCurso.has(clave)) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  try {
    if (fs.existsSync(rutaArchivo)) {
      const data = fs.readFileSync(rutaArchivo, "utf8");
      const parsed = JSON.parse(data);
      
      // Validar que sea un objeto
      if (typeof parsed !== 'object' || parsed === null) {
        log(`⚠️ Archivo ${rutaArchivo} no contiene un objeto válido, usando estructura por defecto`, "WARN");
        return estructuraPorDefecto;
      }
      
      return parsed;
    }
  } catch (error) {
    log(`⚠️ Error leyendo ${rutaArchivo}: ${error.message}, usando estructura por defecto`, "WARN");
  }
  
  return estructuraPorDefecto;
}

// Función para guardar archivo JSON de forma segura
async function guardarArchivoJSON(rutaArchivo, datos) {
  const clave = path.resolve(rutaArchivo);
  
  // Esperar si hay una operación en curso
  while (operacionesEnCurso.has(clave)) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  // Marcar operación en curso
  operacionesEnCurso.set(clave, true);
  
  try {
    // Crear directorio si no existe
    const directorio = path.dirname(rutaArchivo);
    if (!fs.existsSync(directorio)) {
      fs.mkdirSync(directorio, { recursive: true });
    }
    
    // Escribir archivo temporal primero
    const archivoTemporal = `${rutaArchivo}.tmp`;
    fs.writeFileSync(archivoTemporal, JSON.stringify(datos, null, 2), "utf8");
    
    // Mover archivo temporal al final (operación atómica)
    fs.renameSync(archivoTemporal, rutaArchivo);
    
  } catch (error) {
    log(`❌ Error guardando ${rutaArchivo}: ${error.message}`, "ERROR");
    throw error;
  } finally {
    // Liberar lock
    operacionesEnCurso.delete(clave);
  }
}

// Función para modificar archivo JSON de forma segura
async function modificarArchivoJSON(rutaArchivo, estructuraPorDefecto, funcionModificacion) {
  const clave = path.resolve(rutaArchivo);
  
  // Esperar si hay una operación en curso
  while (operacionesEnCurso.has(clave)) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  // Marcar operación en curso
  operacionesEnCurso.set(clave, true);
  
  try {
    // Leer datos actuales
    const datos = await leerArchivoJSON(rutaArchivo, estructuraPorDefecto);
    
    // Aplicar modificación
    const datosModificados = funcionModificacion(datos);
    
    // Guardar cambios
    await guardarArchivoJSON(rutaArchivo, datosModificados);
    
    return datosModificados;
    
  } catch (error) {
    log(`❌ Error modificando ${rutaArchivo}: ${error.message}`, "ERROR");
    throw error;
  } finally {
    // Liberar lock
    operacionesEnCurso.delete(clave);
  }
}

module.exports = {
  leerArchivoJSON,
  guardarArchivoJSON,
  modificarArchivoJSON
};