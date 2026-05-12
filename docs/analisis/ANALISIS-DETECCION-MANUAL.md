# Análisis: Detección de Intervención Manual

## Problema a Resolver

Necesitamos detectar cuando el personal del local responde manualmente a un cliente desde WhatsApp Web, para pausar el bot automáticamente para ese cliente específico.

---

## Investigación del Código Actual

### 1. Evento Actual: `client.on("message")`

**Ubicación:** `bot.js` línea 194

**Comportamiento:**
- Solo captura mensajes ENTRANTES (que le llegan al bot)
- NO captura mensajes que el bot/personal ENVÍA
- Por eso no podemos detectar respuestas manuales con este evento

**Propiedades disponibles:**
```javascript
message.from      // Número del remitente (ej: "5491158647529@c.us")
message.to        // Número del destinatario
message.body      // Texto del mensaje
message.type      // Tipo: "chat", "ptt", "audio", etc.
message.fromMe    // Boolean: true si lo envió el bot, false si lo recibió
```

---

## Solución Propuesta

### Usar `client.on("message_create")` en PARALELO

**Diferencia clave:**
- `message` → Solo mensajes ENTRANTES
- `message_create` → TODOS los mensajes (entrantes + salientes)

**Estrategia:**
1. Mantener `client.on("message")` para la lógica actual del bot
2. Agregar `client.on("message_create")` SOLO para detectar intervenciones manuales
3. No duplicar lógica, solo detectar y pausar

---

## Diseño de Implementación

### Estructura de Datos

```javascript
// Estado de pausas por usuario
const usuariosPausados = {
  "5491158647529@c.us": {
    pausado: true,
    timestamp: 1713547200000,           // Cuándo se pausó
    ultimaActividad: 1713547200000,     // Última vez que el personal escribió
    razon: "intervencion_manual"
  }
};
```

### Configuración

```javascript
// En .env
TIMEOUT_MINUTOS=30

// En bot.js
const TIMEOUT_MINUTOS = parseInt(process.env.TIMEOUT_MINUTOS) || 30;
const TIMEOUT_MS = TIMEOUT_MINUTOS * 60 * 1000;
```

---

## Flujo de Detección

### 1. Detectar Intervención Manual

```javascript
client.on("message_create", async (message) => {
  // SOLO procesar mensajes enviados por el bot/personal (fromMe = true)
  if (!message.fromMe) return;
  
  // Ignorar mensajes a grupos
  if (message.to.includes("@g.us")) return;
  
  // Ignorar mensajes de estado/notificaciones
  const tiposIgnorados = ["revoked", "e2e_notification", "notification_template"];
  if (tiposIgnorados.includes(message.type)) return;
  
  // El "to" es el cliente al que le están respondiendo
  const clienteId = message.to;
  
  // Verificar si es una respuesta manual (no automática del bot)
  // PREGUNTA: ¿Cómo distinguir entre respuesta del bot vs respuesta manual?
  // OPCIÓN 1: Marcar las respuestas del bot con un flag
  // OPCIÓN 2: Asumir que si fromMe=true y no está en nuestro historial reciente, es manual
  
  // Pausar automáticamente para ese cliente
  pausarUsuario(clienteId, "intervencion_manual");
  
  log(`🤚 Bot pausado automáticamente para ${clienteId} (intervención manual detectada)`);
});
```

**PROBLEMA DETECTADO:**
No podemos distinguir fácilmente entre:
- Mensaje enviado por el bot automáticamente
- Mensaje enviado por el personal manualmente

Ambos tienen `fromMe = true`.

---

## Soluciones para Distinguir Bot vs Manual

### OPCIÓN A: Marcar Respuestas del Bot

```javascript
// Cuando el bot responde
const respuestaBot = await message.reply(respuesta);

// Guardar en un Set temporal
const mensajesDelBot = new Set();
mensajesDelBot.add(respuestaBot.id._serialized);

// En message_create
client.on("message_create", async (message) => {
  if (!message.fromMe) return;
  
  // Si el mensaje está en nuestro Set, es del bot
  if (mensajesDelBot.has(message.id._serialized)) {
    mensajesDelBot.delete(message.id._serialized); // Limpiar
    return; // Ignorar, es respuesta automática
  }
  
  // Si llegamos acá, es respuesta MANUAL
  pausarUsuario(message.to, "intervencion_manual");
});
```

**Ventaja:** Preciso, distingue claramente bot vs manual
**Desventaja:** Requiere trackear IDs de mensajes

---

### OPCIÓN B: Timeout entre Respuestas

```javascript
// Guardar timestamp de última respuesta del bot por usuario
const ultimaRespuestaBot = {};

// Cuando el bot responde
ultimaRespuestaBot[userId] = Date.now();

// En message_create
client.on("message_create", async (message) => {
  if (!message.fromMe) return;
  
  const clienteId = message.to;
  const ahora = Date.now();
  
  // Si el bot respondió hace menos de 2 segundos, asumir que es del bot
  if (ultimaRespuestaBot[clienteId] && 
      (ahora - ultimaRespuestaBot[clienteId]) < 2000) {
    return; // Probablemente es del bot
  }
  
  // Si pasaron más de 2 segundos, es respuesta MANUAL
  pausarUsuario(clienteId, "intervencion_manual");
});
```

**Ventaja:** Simple, no requiere trackear IDs
**Desventaja:** No es 100% preciso (si el bot tarda en responder, puede fallar)

---

### OPCIÓN C: Flag Global "Bot Respondiendo"

```javascript
let botRespondiendo = false;

// Cuando el bot va a responder
botRespondiendo = true;
await message.reply(respuesta);
botRespondiendo = false;

// En message_create
client.on("message_create", async (message) => {
  if (!message.fromMe) return;
  
  // Si el bot está respondiendo, ignorar
  if (botRespondiendo) return;
  
  // Si no, es respuesta MANUAL
  pausarUsuario(message.to, "intervencion_manual");
});
```

**Ventaja:** Simple y directo
**Desventaja:** Puede tener race conditions si hay múltiples respuestas simultáneas

---

## Recomendación: OPCIÓN A (Marcar Respuestas)

Es la más precisa y robusta.

---

## Flujo de Pausa/Reactivación

### Función: pausarUsuario

```javascript
function pausarUsuario(userId, razon) {
  const ahora = Date.now();
  
  usuariosPausados[userId] = {
    pausado: true,
    timestamp: ahora,
    ultimaActividad: ahora,
    razon: razon
  };
  
  log(`⏸️ Usuario ${userId} pausado (${razon})`);
}
```

### Función: actualizarActividad

```javascript
function actualizarActividad(userId) {
  if (usuariosPausados[userId]) {
    usuariosPausados[userId].ultimaActividad = Date.now();
    log(`🔄 Actividad actualizada para ${userId}`);
  }
}
```

### Función: reanudarUsuario

```javascript
function reanudarUsuario(userId) {
  if (usuariosPausados[userId]) {
    delete usuariosPausados[userId];
    log(`▶️ Usuario ${userId} reanudado`);
  }
}
```

### Verificación de Timeouts (cada minuto)

```javascript
setInterval(() => {
  const ahora = Date.now();
  
  for (const [userId, pausa] of Object.entries(usuariosPausados)) {
    const tiempoInactivo = ahora - pausa.ultimaActividad;
    
    if (tiempoInactivo > TIMEOUT_MS) {
      reanudarUsuario(userId);
      log(`🤖 Bot reactivado automáticamente para ${userId} (timeout alcanzado)`);
    }
  }
}, 60000); // Cada 60 segundos
```

---

## Integración con Lógica Actual

### Modificar client.on("message")

```javascript
client.on("message", async (message) => {
  // ... código actual ...
  
  const userId = message.from;
  
  // NUEVO: Verificar si usuario está pausado
  if (usuariosPausados[userId]?.pausado) {
    log(`⏸️ Usuario ${userId} pausado - Bot no responde`);
    return; // No procesar el mensaje
  }
  
  // ... resto del código actual ...
});
```

### Actualizar Actividad al Responder Manualmente

```javascript
client.on("message_create", async (message) => {
  if (!message.fromMe) return;
  if (message.to.includes("@g.us")) return;
  
  const clienteId = message.to;
  
  // Si ya está pausado, actualizar actividad
  if (usuariosPausados[clienteId]) {
    actualizarActividad(clienteId);
    return;
  }
  
  // Si no está pausado, pausar ahora
  pausarUsuario(clienteId, "intervencion_manual");
});
```

---

## Pausa Global (Archivo de Control)

### Verificar Archivo pausado.txt

```javascript
const ARCHIVO_PAUSA = path.join(__dirname, "pausado.txt");

function botPausadoGlobalmente() {
  return fs.existsSync(ARCHIVO_PAUSA);
}

// En client.on("message")
if (botPausadoGlobalmente()) {
  log(`⏸️ Bot pausado globalmente (archivo pausado.txt existe)`);
  return;
}
```

### Crear/Eliminar Archivo

El personal puede:
1. Crear archivo `pausado.txt` en la carpeta del bot → Bot se pausa
2. Borrar archivo `pausado.txt` → Bot se reanuda

---

## Preguntas para Revisar

### 1. Detección de Respuestas Manuales
**¿Cuál opción preferís?**
- [ ] Opción A: Marcar respuestas del bot (más preciso)
- [ ] Opción B: Timeout entre respuestas (más simple)
- [ ] Opción C: Flag global (más directo)

### 2. Timeout de Reactivación
**¿30 minutos está bien?**
- [ ] Sí, 30 minutos
- [ ] Otro valor: _____ minutos

### 3. Actualización de Actividad
**¿Cada vez que el personal escribe, resetear el timer?**
- [ ] Sí, resetear timer con cada mensaje manual
- [ ] No, solo pausar una vez y esperar timeout fijo

### 4. Pausa Global
**¿Implementar archivo pausado.txt?**
- [ ] Sí, útil para emergencias
- [ ] No, solo detección automática

### 5. Notificaciones
**¿Enviar mensajes al chat cuando se pausa/reanuda?**
- [ ] Sí, enviar "⏸️ Bot pausado para este usuario"
- [ ] No, solo logs en consola

### 6. Persistencia
**¿Guardar estado en archivo JSON?**
- [ ] Sí, para mantener pausas al reiniciar
- [ ] No, al reiniciar se limpia todo

---

## Archivos a Modificar

1. **bot.js**
   - Agregar estructura `usuariosPausados`
   - Agregar `client.on("message_create")` para detección
   - Modificar `client.on("message")` para verificar pausas
   - Agregar funciones: pausarUsuario, reanudarUsuario, actualizarActividad
   - Agregar setInterval para verificar timeouts

2. **.env**
   - Agregar `TIMEOUT_MINUTOS=30`

3. **pausado.txt** (opcional)
   - Archivo de control para pausa global

---

## Testing Necesario

1. ✅ Cliente escribe → Bot responde (normal)
2. ✅ Personal responde manualmente → Bot se pausa para ese cliente
3. ✅ Cliente pausado escribe → Bot NO responde
4. ✅ Personal sigue escribiendo → Timer se resetea
5. ✅ 30 min sin actividad → Bot se reactiva
6. ✅ Otro cliente escribe → Bot responde (no está pausado)
7. ✅ Crear pausado.txt → Bot no responde a nadie
8. ✅ Borrar pausado.txt → Bot vuelve a responder

---

## Próximo Paso

**Necesito que revises este análisis y respondas:**

1. ¿Qué opción de detección preferís? (A, B o C)
2. ¿Qué features querés? (timeout, pausa global, notificaciones, persistencia)
3. ¿Alguna suposición incorrecta en mi análisis?

Una vez que confirmes, implemento sin asumir nada más.
