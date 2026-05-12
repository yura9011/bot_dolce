# Milestone: Sistema de Control Manual y Pausado del Bot

## Problema

**Situación actual:**
- El bot responde automáticamente a TODOS los mensajes entrantes
- Si el personal del local quiere tomar control manual de una conversación, el bot sigue respondiendo
- No hay forma de pausar el bot temporalmente
- Puede generar confusión si bot y humano responden al mismo tiempo

**Casos de uso reales:**
1. Cliente no entiende al bot → Personal quiere intervenir manualmente
2. Consulta compleja que requiere atención humana
3. Error del bot → Necesitan pausarlo y responder manualmente
4. Cliente enojado → Mejor que responda un humano
5. Mantenimiento/testing → Pausar bot temporalmente

---

## Análisis de Soluciones

### Opción 1: Comando de Pausa por Usuario
**Cómo funciona:**
- Personal escribe comando especial (ej: `/pausar 5491158647529`)
- Bot deja de responder a ese usuario específico
- Personal maneja la conversación manualmente
- Cuando termina, escribe `/reanudar 5491158647529`

**Pros:**
- Control granular por usuario
- Bot sigue funcionando para otros clientes
- Fácil de implementar

**Contras:**
- Requiere escribir comandos
- Puede olvidarse de reanudar
- No hay interfaz visual

---

### Opción 2: Detección Automática de Intervención Manual
**Cómo funciona:**
- Bot detecta cuando el personal responde manualmente desde WhatsApp
- Automáticamente se pausa para ese usuario por X minutos
- Después de X minutos sin actividad manual, bot se reactiva

**Pros:**
- No requiere comandos
- Flujo natural
- Se reactiva automáticamente

**Contras:**
- Puede reactivarse cuando no querés
- Difícil determinar el tiempo correcto
- Más complejo de implementar

---

### Opción 3: Pausa Global del Bot
**Cómo funciona:**
- Comando `/pausar` pausa el bot completamente
- Bot no responde a NADIE
- Comando `/reanudar` reactiva el bot

**Pros:**
- Simple de implementar
- Control total
- Útil para mantenimiento

**Contras:**
- Todo o nada (no granular)
- Clientes quedan sin respuesta
- Requiere estar atento para reanudar

---

### Opción 4: Sistema Híbrido (RECOMENDADO)
**Cómo funciona:**
- Combina detección automática + comandos manuales
- Bot detecta respuestas manuales y se pausa automáticamente para ese usuario
- Comandos disponibles:
  - `/pausar [numero]` - Pausar usuario específico
  - `/pausar` - Pausar bot completamente
  - `/reanudar [numero]` - Reanudar usuario específico
  - `/reanudar` - Reanudar bot completamente
  - `/estado` - Ver usuarios pausados
- Timeout configurable (ej: 30 minutos sin actividad manual = bot se reactiva)

**Pros:**
- Flexible: automático + manual
- Control granular cuando se necesita
- Pausa global para emergencias
- Se reactiva solo si es necesario

**Contras:**
- Más complejo de implementar
- Requiere persistencia de estado

---

## Diseño Técnico - Opción 4 (Recomendada)

### 1. Estructura de Datos

```javascript
// Estado de pausas
const pausas = {
  global: false, // Bot pausado completamente
  usuarios: {
    "5491158647529": {
      pausado: true,
      razon: "manual", // "manual" o "auto"
      timestamp: 1713547200000,
      ultimaActividadManual: 1713547200000
    }
  }
};
```

### 2. Comandos Administrativos

**Formato:** Mensajes que empiezan con `/` desde números autorizados

```javascript
// Lista de números autorizados (en .env)
ADMIN_NUMBERS=5491171458944,5493515559145

// Comandos:
/pausar                    → Pausa bot globalmente
/pausar 5491158647529      → Pausa usuario específico
/reanudar                  → Reanuda bot globalmente
/reanudar 5491158647529    → Reanuda usuario específico
/estado                    → Muestra estado de pausas
/timeout 30                → Configura timeout en minutos
```

### 3. Detección Automática

```javascript
// En el evento message_create:
if (message.fromMe && !esComando(message.body)) {
  // Personal respondió manualmente
  const chatId = message.to; // El usuario al que le respondieron
  
  pausarUsuarioAutomaticamente(chatId, {
    razon: "auto",
    timeout: TIMEOUT_MINUTOS
  });
  
  log(`🤚 Bot pausado automáticamente para ${chatId} (intervención manual detectada)`);
}
```

### 4. Reactivación Automática

```javascript
// Verificar cada minuto si hay timeouts vencidos
setInterval(() => {
  const ahora = Date.now();
  
  for (const [userId, pausa] of Object.entries(pausas.usuarios)) {
    if (pausa.razon === "auto") {
      const tiempoTranscurrido = ahora - pausa.ultimaActividadManual;
      const timeoutMs = TIMEOUT_MINUTOS * 60 * 1000;
      
      if (tiempoTranscurrido > timeoutMs) {
        reanudarUsuario(userId);
        log(`🤖 Bot reactivado automáticamente para ${userId} (timeout alcanzado)`);
      }
    }
  }
}, 60000); // Cada minuto
```

### 5. Lógica de Respuesta

```javascript
client.on("message", async (message) => {
  // Ignorar grupos
  if (message.from.includes("@g.us")) return;
  
  const userId = message.from;
  
  // Verificar si bot está pausado globalmente
  if (pausas.global) {
    log(`⏸️ Bot pausado globalmente - Mensaje ignorado de ${userId}`);
    return;
  }
  
  // Verificar si usuario está pausado
  if (pausas.usuarios[userId]?.pausado) {
    log(`⏸️ Usuario ${userId} pausado - Mensaje ignorado`);
    return;
  }
  
  // Continuar con lógica normal del bot...
});
```

### 6. Persistencia (Opcional)

```javascript
// Guardar estado en archivo JSON
function guardarEstadoPausas() {
  fs.writeFileSync(
    path.join(__dirname, "pausas.json"),
    JSON.stringify(pausas, null, 2)
  );
}

// Cargar estado al iniciar
function cargarEstadoPausas() {
  try {
    const data = fs.readFileSync(path.join(__dirname, "pausas.json"), "utf8");
    Object.assign(pausas, JSON.parse(data));
  } catch (error) {
    // Archivo no existe, usar estado por defecto
  }
}
```

---

## Plan de Implementación

### Fase 1: Comandos Básicos ✅ COMPLETADO
- [x] Agregar `ADMIN_NUMBERS` al `.env`
- [x] Implementar detección de comandos administrativos
- [x] Implementar `PAUSAR BOT GLOBAL`
- [x] Implementar `REANUDAR BOT GLOBAL`
- [x] Implementar `ESTADO BOT`
- [x] Agregar logs claros de pausas/reanudaciones

### Fase 2: Control por Usuario ✅ COMPLETADO
- [x] Implementar estructura de datos `usuariosPausados`
- [x] Implementar `REANUDAR [numero]`
- [x] Modificar lógica de respuesta para verificar pausas
- [x] Testing con múltiples usuarios

### Fase 3: Detección Automática ✅ COMPLETADO (sin timeout)
- [x] Detectar respuestas manuales en `message_create`
- [x] Pausar automáticamente al detectar intervención
- [x] Marcar mensajes del bot con IDs (Opción A)
- [x] Notificación al cliente cuando se pausa
- [~] ~~Implementar sistema de timeout~~ (DESCARTADO - no queremos reactivación automática)
- [~] ~~Implementar reactivación automática~~ (DESCARTADO)
- [~] ~~Agregar `/timeout` para configurar minutos~~ (DESCARTADO)

### Fase 4: Persistencia y Mejoras ✅ COMPLETADO
- [x] Guardar estado en `data/pausas.json`
- [x] Cargar estado al iniciar bot
- [x] Implementar historial de conversaciones en `data/historial.json`
- [x] Documentación completa en `CONTROL-MANUAL.md`

---

## 🎯 Estado Actual: IMPLEMENTACIÓN COMPLETA

### ✅ Funcionalidades Implementadas

1. **Detección Automática**
   - Bot detecta respuestas manuales del personal
   - Se pausa automáticamente para ese cliente
   - Envía notificación al cliente

2. **Comandos Administrativos**
   - `PAUSAR BOT GLOBAL` - Pausa completa
   - `REANUDAR BOT GLOBAL` - Reactiva completa
   - `ESTADO BOT` - Ver estado actual
   - `REANUDAR [numero]` - Reanudar cliente específico
   - Validación de números autorizados

3. **Persistencia**
   - Estado guardado en `data/pausas.json`
   - Historial en `data/historial.json`
   - Se mantiene al reiniciar el bot

4. **Sin Timeout Automático**
   - Bot NO se reactiva solo
   - Evita reactivación en horarios de cierre
   - Control manual total

### 📁 Archivos Creados/Modificados

- ✅ `bot.js` - Lógica completa
- ✅ `.env.example` - Variable `ADMIN_NUMBERS`
- ✅ `CONTROL-MANUAL.md` - Documentación de uso
- ✅ `ANALISIS-DETECCION-MANUAL.md` - Análisis técnico
- ✅ `data/pausas.json` - Generado automáticamente
- ✅ `data/historial.json` - Generado automáticamente

### 🧪 Próximos Pasos

1. **Testing en Producción**
   - [ ] Configurar `ADMIN_NUMBERS` en `.env`
   - [ ] Probar detección automática
   - [ ] Probar comandos administrativos
   - [ ] Verificar persistencia al reiniciar
   - [ ] Revisar historial generado

2. **Ajustes Opcionales**
   - [ ] Personalizar mensaje de notificación al cliente
   - [ ] Ajustar qué se guarda en el historial
   - [ ] Agregar más comandos si es necesario

3. **Documentación para el Local**
   - [ ] Capacitar al personal sobre comandos
   - [ ] Explicar cómo funciona la detección automática
   - [ ] Mostrar cómo ver el historial
- [ ] Agregar comando `/historial` para ver pausas recientes
- [ ] Mejorar mensajes de confirmación
- [ ] Documentación de uso

---

## Configuración Recomendada

```env
# .env
ADMIN_NUMBERS=5491171458944,5493515559145
TIMEOUT_MINUTOS=30
```

---

## Ejemplos de Uso

### Caso 1: Intervención Manual Automática
```
[Cliente] Hola, necesito ayuda
[Bot] ¡Hola! Bienvenido a Dolce Party...
[Cliente] No entiendo, quiero hablar con alguien
[Personal] Hola! Soy María, ¿en qué puedo ayudarte?
[Sistema] 🤚 Bot pausado automáticamente para 5491158647529
[Cliente] Gracias María, necesito...
[Personal] Claro, te ayudo con eso...
[30 minutos después sin actividad]
[Sistema] 🤖 Bot reactivado para 5491158647529
```

### Caso 2: Pausa Manual Específica
```
[Personal desde admin] /pausar 5491158647529
[Bot] ✅ Usuario 5491158647529 pausado manualmente
[Cliente] Hola
[Sistema] ⏸️ Usuario pausado - Mensaje ignorado
[Personal] Hola, te atiendo yo...
[Personal desde admin] /reanudar 5491158647529
[Bot] ✅ Usuario 5491158647529 reanudado
```

### Caso 3: Pausa Global (Mantenimiento)
```
[Personal desde admin] /pausar
[Bot] ✅ Bot pausado globalmente
[Cualquier cliente] Hola
[Sistema] ⏸️ Bot pausado globalmente - Mensaje ignorado
[Personal desde admin] /reanudar
[Bot] ✅ Bot reanudado globalmente
```

### Caso 4: Verificar Estado
```
[Personal desde admin] /estado
[Bot] 📊 Estado del Bot:
• Global: ✅ Activo
• Usuarios pausados: 2
  - 5491158647529 (manual, hace 5 min)
  - 5493515551234 (auto, hace 12 min)
• Timeout: 30 minutos
```

---

## Consideraciones Adicionales

### Seguridad
- Solo números en `ADMIN_NUMBERS` pueden ejecutar comandos
- Validar formato de números antes de pausar
- Logs de todas las acciones administrativas

### UX
- Mensajes claros de confirmación
- Indicadores visuales (emojis) en logs
- Comando `/ayuda` para listar comandos disponibles

### Escalabilidad
- Si hay muchos usuarios pausados, considerar base de datos
- Limpiar pausas antiguas automáticamente
- Límite máximo de usuarios pausados simultáneamente

### Testing
- Probar con múltiples usuarios
- Probar timeout automático
- Probar comandos con números inválidos
- Probar persistencia (reiniciar bot)

---

## Alternativas Futuras

### Dashboard Web (Avanzado)
- Interfaz web para ver/controlar pausas
- Lista de conversaciones activas
- Botón "Tomar control" por conversación
- Historial de intervenciones

### Integración con CRM
- Sincronizar pausas con sistema de tickets
- Asignar conversaciones a agentes específicos
- Métricas de intervenciones manuales

---

## Decisión

**¿Qué opción implementamos?**
- [ ] Opción 1: Solo comandos manuales
- [ ] Opción 2: Solo detección automática
- [ ] Opción 3: Solo pausa global
- [x] Opción 4: Sistema híbrido (RECOMENDADO)

**¿Qué fases implementamos ahora?**
- [ ] Fase 1: Comandos básicos (mínimo viable)
- [ ] Fases 1-2: Comandos + control por usuario
- [ ] Fases 1-3: Todo excepto persistencia
- [ ] Fases 1-4: Implementación completa

**Configuración inicial:**
- Timeout: 30 minutos
- Números admin: [A definir por cliente]
- Persistencia: Sí/No

---

## Próximos Pasos

1. Revisar este milestone con el cliente
2. Decidir qué fases implementar
3. Obtener números de admin autorizados
4. Implementar según prioridad
5. Testing exhaustivo
6. Documentar para el personal del local
