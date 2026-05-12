# Plan de Testing - Core del Bot

## 🎯 Objetivo

Verificar que todas las funcionalidades críticas del bot funcionan correctamente antes de producción.

---

## ⚙️ Preparación

### Antes de Empezar

1. **Iniciar el bot:**
   ```bash
   node bot.js
   ```

2. **Verificar logs iniciales:**
   ```
   ✅ Bot conectado y listo!
   📦 Catálogo: XXXX productos en X categorías
   🔐 2 números admin configurados
   ```

3. **Tener 2 números de prueba:**
   - **Admin:** 5491158647529 o 5493513782559
   - **Cliente:** Cualquier otro número

4. **Limpiar estado anterior (opcional):**
   - Eliminar `data/pausas.json`
   - Eliminar `data/historial.json`

---

## 📋 SUITE 1: Flujo Básico de Usuario

### Test 1.1: Primera Interacción
**Objetivo:** Verificar bienvenida y captura de nombre

**Pasos:**
1. Desde número NO admin, enviar: `Hola`

**Resultado Esperado:**
```
Bot: [Mensaje de bienvenida con info de la tienda]
Bot: ¿Cómo te llamás?
```

**Verificar en logs:**
```
👋 Nuevo usuario: [numero]@c.us - Enviando bienvenida
```

---

### Test 1.2: Registro de Nombre
**Objetivo:** Verificar que el bot guarda el nombre

**Pasos:**
1. Responder: `Juan`

**Resultado Esperado:**
```
Bot: Encantado de conocerte, Juan! 😊
Bot: [Menú principal con 3 opciones]
```

**Verificar en logs:**
```
✅ Usuario [numero]@c.us registrado como: Juan
```

---

### Test 1.3: Navegación por Menú
**Objetivo:** Verificar que las opciones del menú funcionan

**Pasos:**
1. Enviar: `1` (Realizar pedido)

**Resultado Esperado:**
```
Bot: Perfecto! ¿Qué productos necesitás para tu pedido?
```

**Verificar en logs:**
```
🛒 Usuario [numero]@c.us inició pedido
```

**Repetir con:**
- `2` (Catálogo) → Debe preguntar qué tipo de globos
- `3` (Paquetería) → Debe mostrar menú de transportistas

---

### Test 1.4: Volver al Menú Principal
**Objetivo:** Verificar navegación con "0"

**Pasos:**
1. Desde cualquier estado, enviar: `0`

**Resultado Esperado:**
```
Bot: [Menú principal con 3 opciones]
```

---

## 📋 SUITE 2: Búsqueda de Productos (RAG)

### Test 2.1: Búsqueda Exitosa
**Objetivo:** Verificar que el bot busca en el catálogo

**Pasos:**
1. Desde menú principal, enviar: `1` (pedido)
2. Enviar: `globos de frozen`

**Resultado Esperado:**
```
Bot: [Respuesta con productos de Frozen, precios y características]
Bot: ¿Necesitás algo más? Respondé 0 para volver al menú principal.
```

**Verificar en logs:**
```
🔍 Buscando productos: "globos de frozen"
📦 Productos encontrados: X
```

---

### Test 2.2: Producto No Encontrado
**Objetivo:** Verificar respuesta cuando no hay stock

**Pasos:**
1. Desde estado de pedido, enviar: `globos de pokemon`

**Resultado Esperado:**
```
Bot: [Mensaje indicando que no tienen ese producto en stock]
Bot: [Sugerencia de consultar por otros productos]
```

---

### Test 2.3: Consulta de Precios
**Objetivo:** Verificar que el bot menciona precios

**Pasos:**
1. Desde estado de pedido, enviar: `cuanto sale un globo numero 5`

**Resultado Esperado:**
```
Bot: [Respuesta con precio específico del producto]
```

---

## 📋 SUITE 3: Moderación de Contenido

### Test 3.1: Tema Prohibido (Política)
**Objetivo:** Verificar que bloquea temas políticos

**Pasos:**
1. Desde cualquier estado, enviar: `que opinas de milei`

**Resultado Esperado:**
```
Bot: Disculpá, solo puedo ayudarte con temas de la tienda. ¿Te puedo ayudar con algo más sobre productos o pedidos?
```

**Verificar en logs:**
```
🚫 Tema prohibido bloqueado: "milei" de [numero]@c.us
```

---

### Test 3.2: Tema Prohibido (Deportes)
**Objetivo:** Verificar que bloquea deportes

**Pasos:**
1. Enviar: `quien gano el mundial`

**Resultado Esperado:**
```
Bot: Disculpá, solo puedo ayudarte con temas de la tienda. ¿Te puedo ayudar con algo más sobre productos o pedidos?
```

---

### Test 3.3: Lenguaje Ofensivo
**Objetivo:** Verificar que registra pero responde profesionalmente

**Pasos:**
1. Enviar: `este bot es una mierda`

**Resultado Esperado:**
```
Bot: [Responde profesionalmente, sin insultar de vuelta]
```

**Verificar en logs:**
```
⚠️ Lenguaje ofensivo detectado: "mierda" de [numero]@c.us
```

**IMPORTANTE:** El bot NO debe bloquear el mensaje, solo registrarlo.

---

## 📋 SUITE 4: Sistema de Control Manual (CRÍTICO)

### Test 4.1: Handoff Solicitado por Usuario
**Objetivo:** Verificar que el bot se pausa cuando usuario pide humano

**Pasos:**
1. Desde cualquier estado, enviar: `quiero hablar con un humano`

**Resultado Esperado:**
```
Bot: Entendido 👋 Un agente se va a comunicar con vos a la brevedad. ¡Gracias por tu paciencia!
```

**Verificar en logs:**
```
🚨 HANDOFF solicitado por [numero]@c.us
⏸️ Usuario [numero]@c.us pausado (handoff_solicitado)
```

2. **Enviar otro mensaje:** `hola`

**Resultado Esperado:**
```
Bot: ⏸️ Un agente está atendiendo tu consulta. Te responderá en breve.
[Luego NO responde más]
```

**Verificar en logs:**
```
📢 Notificación enviada a [numero]@c.us
⏸️ Usuario [numero]@c.us en atención manual - Bot no responde
```

3. **Enviar más mensajes:** `necesito ayuda`, `hola?`

**Resultado Esperado:**
```
[Bot NO responde, solo logs]
```

**Verificar en logs:**
```
⏸️ Usuario [numero]@c.us en atención manual - Bot no responde
```

---

### Test 4.2: Detección Automática de Intervención Manual
**Objetivo:** Verificar que el bot detecta cuando el personal responde

**Pasos:**
1. Desde número admin, iniciar conversación: `Hola`
2. Bot responde normalmente
3. **Desde WhatsApp Web (mismo número del bot)**, responder manualmente al cliente

**Resultado Esperado:**
```
[Bot deja de responder automáticamente a ese cliente]
```

**Verificar en logs:**
```
🤚 Intervención manual detectada para [numero]@c.us
⏸️ Usuario [numero]@c.us pausado (intervencion_manual)
```

4. Cliente envía otro mensaje: `gracias`

**Resultado Esperado:**
```
Bot: ⏸️ Un agente está atendiendo tu consulta. Te responderá en breve.
[Luego NO responde más]
```

---

### Test 4.3: Comando ESTADO BOT
**Objetivo:** Verificar que los admins pueden ver el estado

**Pasos:**
1. Desde número admin, enviar: `ESTADO BOT`

**Resultado Esperado:**
```
Bot: 📊 *Estado del Bot*

• Global: ✅ Activo
• Usuarios pausados: 1

*Usuarios en atención manual:*
  - [numero] (hace X min)
```

---

### Test 4.4: Comando REANUDAR [numero]
**Objetivo:** Verificar que los admins pueden reanudar usuarios

**Pasos:**
1. Desde número admin, enviar: `REANUDAR 5491158647529` (usar número pausado)

**Resultado Esperado:**
```
Bot: ✅ Usuario 5491158647529 reanudado. El bot volverá a responderle.
```

**Verificar en logs:**
```
▶️ Usuario 5491158647529@c.us reanudado
```

2. **Desde el número reanudado**, enviar: `hola`

**Resultado Esperado:**
```
Bot: [Responde normalmente con el menú]
```

---

### Test 4.5: Comando PAUSAR BOT GLOBAL
**Objetivo:** Verificar pausa global

**Pasos:**
1. Desde número admin, enviar: `PAUSAR BOT GLOBAL`

**Resultado Esperado:**
```
Bot: ✅ Bot pausado globalmente. Ningún cliente recibirá respuestas automáticas.
```

**Verificar en logs:**
```
🔴 Bot pausado globalmente por admin
```

2. **Desde cualquier número NO admin**, enviar: `hola`

**Resultado Esperado:**
```
[Bot NO responde]
```

**Verificar en logs:**
```
⏸️ Bot pausado globalmente - Mensaje ignorado de [numero]@c.us
```

---

### Test 4.6: Comando REANUDAR BOT GLOBAL
**Objetivo:** Verificar reactivación global

**Pasos:**
1. Desde número admin, enviar: `REANUDAR BOT GLOBAL`

**Resultado Esperado:**
```
Bot: ✅ Bot reanudado globalmente. Volviendo a responder automáticamente.
```

**Verificar en logs:**
```
🟢 Bot reanudado globalmente por admin
```

2. **Desde cualquier número**, enviar: `hola`

**Resultado Esperado:**
```
Bot: [Responde normalmente]
```

---

### Test 4.7: Comandos desde Número NO Admin
**Objetivo:** Verificar que solo admins pueden usar comandos

**Pasos:**
1. Desde número NO admin, enviar: `ESTADO BOT`

**Resultado Esperado:**
```
Bot: [Responde como si fuera un mensaje normal, NO ejecuta el comando]
```

**NO debe aparecer en logs:**
```
❌ NO debe mostrar estado del bot
```

---

## 📋 SUITE 5: Persistencia

### Test 5.1: Persistencia de Pausas
**Objetivo:** Verificar que las pausas sobreviven al reinicio

**Pasos:**
1. Pausar un usuario (handoff o manual)
2. Verificar que existe `data/pausas.json`
3. **Detener el bot** (Ctrl+C)
4. **Reiniciar el bot:** `node bot.js`

**Verificar en logs:**
```
📂 Estado de pausas cargado: 1 usuarios pausados
```

5. **Desde el usuario pausado**, enviar: `hola`

**Resultado Esperado:**
```
Bot: ⏸️ Un agente está atendiendo tu consulta. Te responderá en breve.
[NO responde más]
```

---

### Test 5.2: Historial de Conversaciones
**Objetivo:** Verificar que se guarda el historial

**Pasos:**
1. Tener una conversación de 5+ mensajes
2. Verificar que existe `data/historial.json`
3. Abrir el archivo

**Resultado Esperado:**
```json
{
  "5491158647529@c.us": [
    {
      "timestamp": 1234567890,
      "role": "user",
      "text": "hola"
    },
    {
      "timestamp": 1234567891,
      "role": "bot",
      "text": "¡Hola! Bienvenido..."
    }
  ]
}
```

---

## 📋 SUITE 6: Manejo de Errores

### Test 6.1: Mensaje Muy Largo
**Objetivo:** Verificar límite de 500 caracteres

**Pasos:**
1. Desde estado de pedido, enviar un mensaje de 600+ caracteres

**Resultado Esperado:**
```
Bot: Tu mensaje es muy largo (XXX caracteres). Por favor, enviá un mensaje de máximo 500 caracteres.
```

---

### Test 6.2: Debounce (Mensajes Rápidos)
**Objetivo:** Verificar que 300ms permite conversación natural

**Pasos:**
1. Enviar 2 mensajes muy rápido (menos de 300ms entre ellos):
   - `Hola`
   - `Necesito ayuda`

**Resultado Esperado:**
```
Bot: [Responde al primero]
[El segundo se ignora por debounce]
```

**Verificar en logs:**
```
⏭️ Mensaje ignorado (debounce): [numero]@c.us
```

2. **Esperar 1 segundo**, enviar: `Hola de nuevo`

**Resultado Esperado:**
```
Bot: [Responde normalmente]
```

---

### Test 6.3: Audios y Llamadas
**Objetivo:** Verificar rechazo de audios

**Pasos:**
1. Enviar un audio de voz

**Resultado Esperado:**
```
Bot: ⚠️ No recibimos audios en este momento. Por favor, escribí tu consulta por mensaje de texto.
```

---

## 📋 SUITE 7: Flujo de Paquetería

### Test 7.1: Menú Paquetería
**Objetivo:** Verificar navegación en paquetería

**Pasos:**
1. Desde menú principal, enviar: `3`

**Resultado Esperado:**
```
Bot: [Menú con 3 opciones: Correo Argentino, Andreani, Mercado Libre]
```

---

### Test 7.2: Info Correo Argentino
**Objetivo:** Verificar información estática

**Pasos:**
1. Desde menú paquetería, enviar: `1`

**Resultado Esperado:**
```
Bot: [Información de Correo Argentino con link de seguimiento]
Bot: [Debe incluir: https://www.correoargentino.com.ar/seguimiento-de-envios]
```

---

### Test 7.3: Info Andreani
**Objetivo:** Verificar información estática

**Pasos:**
1. Desde menú paquetería, enviar: `2`

**Resultado Esperado:**
```
Bot: [Información de Andreani]
Bot: [Debe mencionar que el código está en la app del cliente]
```

---

### Test 7.4: Info Mercado Libre
**Objetivo:** Verificar información estática

**Pasos:**
1. Desde menú paquetería, enviar: `3`

**Resultado Esperado:**
```
Bot: [Información de Mercado Libre]
Bot: [Debe mencionar que el código está en la app del cliente]
```

---

## 📊 Checklist de Testing

### Antes de Producción

- [ ] **Suite 1:** Flujo básico (4 tests)
- [ ] **Suite 2:** Búsqueda de productos (3 tests)
- [ ] **Suite 3:** Moderación (3 tests)
- [ ] **Suite 4:** Control manual (7 tests) ⚠️ CRÍTICO
- [ ] **Suite 5:** Persistencia (2 tests)
- [ ] **Suite 6:** Manejo de errores (3 tests)
- [ ] **Suite 7:** Paquetería (4 tests)

**Total:** 26 tests

---

## 🚨 Tests Críticos (NO NEGOCIABLES)

Estos tests DEBEN pasar antes de producción:

1. ✅ **Test 4.1:** Handoff solicitado por usuario
2. ✅ **Test 4.2:** Detección automática de intervención manual
3. ✅ **Test 4.4:** Comando REANUDAR funciona
4. ✅ **Test 5.1:** Persistencia de pausas sobrevive reinicio
5. ✅ **Test 3.1:** Moderación bloquea temas prohibidos

---

## 📝 Formato de Reporte

Para cada test, anotar:

```
Test X.X: [Nombre]
Estado: ✅ PASS / ❌ FAIL
Notas: [Cualquier observación]
```

**Ejemplo:**
```
Test 4.1: Handoff Solicitado
Estado: ✅ PASS
Notas: Funcionó perfecto, usuario quedó pausado correctamente
```

---

## 🐛 Si Algo Falla

1. **Anotar el test específico** que falló
2. **Copiar el error de los logs**
3. **Describir qué esperabas vs qué pasó**
4. **NO continuar** con tests que dependan del fallido

---

## 💡 Tips para Testing

1. **Usar 2 dispositivos:** Uno como admin, otro como cliente
2. **Revisar logs constantemente:** `tail -f logs/bot.log` (Linux/Mac) o abrir el archivo en tiempo real
3. **Limpiar estado entre suites:** Eliminar `data/*.json` si querés empezar de cero
4. **Probar casos extremos:** Mensajes vacíos, emojis, números, etc.
5. **Simular usuario real:** No solo probar el "happy path"

---

## 🎯 Criterio de Éxito

**Mínimo para producción:**
- ✅ 100% de tests críticos pasando
- ✅ 90%+ de tests totales pasando
- ✅ Sin crashes durante 30 minutos de uso continuo
- ✅ Persistencia funcionando correctamente

---

## 📞 Números de Prueba

**Admin configurados:**
- 5491158647529
- 5493513782559

**Bot:**
- 5491171458944

---

## ⏱️ Tiempo Estimado

- **Suite 1-3:** 15 minutos
- **Suite 4 (crítica):** 20 minutos
- **Suite 5-7:** 10 minutos

**Total:** ~45 minutos de testing completo
