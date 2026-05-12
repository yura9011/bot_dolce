# Testing de Correcciones Post-Análisis

## 🎯 Objetivo

Testear SOLO las 3 correcciones implementadas:
1. ✅ Handoff real (usuario pide humano → se pausa)
2. ✅ Debounce reducido (300ms en vez de 1000ms)
3. ✅ Try-catch en búsqueda de productos

---

## ⚙️ Preparación

```bash
node bot.js
```

**Verificar logs iniciales:**
```
✅ Bot conectado y listo!
📦 Catálogo: XXXX productos en X categorías
```

---

## 🧪 TEST 1: Handoff Real (CRÍTICO)

### Objetivo
Verificar que cuando el usuario pide "humano", el bot se pausa automáticamente.

### Pasos

**1. Iniciar conversación normal**
```
Usuario: Hola
Bot: [Bienvenida]
Bot: ¿Cómo te llamás?

Usuario: Juan
Bot: Encantado de conocerte, Juan!
Bot: [Menú principal]

Usuario: 1
Bot: Perfecto! ¿Qué productos necesitás para tu pedido?
```

**2. Pedir humano**
```
Usuario: quiero hablar con un humano
```

**✅ Resultado Esperado:**
```
Bot: Entendido 👋 Un agente se va a comunicar con vos a la brevedad. ¡Gracias por tu paciencia!
```

**✅ Verificar en logs:**
```
🚨 HANDOFF solicitado por [numero]@c.us
⏸️ Usuario [numero]@c.us pausado (handoff_solicitado)
```

**3. Intentar seguir conversando**
```
Usuario: hola
```

**✅ Resultado Esperado:**
```
Bot: ⏸️ Un agente está atendiendo tu consulta. Te responderá en breve.
```

**✅ Verificar en logs:**
```
📢 Notificación enviada a [numero]@c.us
⏸️ Usuario [numero]@c.us en atención manual - Bot no responde
```

**4. Enviar más mensajes**
```
Usuario: necesito ayuda
Usuario: hola?
Usuario: alguien?
```

**✅ Resultado Esperado:**
```
[Bot NO responde a ninguno]
```

**✅ Verificar en logs:**
```
⏸️ Usuario [numero]@c.us en atención manual - Bot no responde
⏸️ Usuario [numero]@c.us en atención manual - Bot no responde
⏸️ Usuario [numero]@c.us en atención manual - Bot no responde
```

**5. Verificar estado**

Desde número admin:
```
Admin: ESTADO BOT
```

**✅ Resultado Esperado:**
```
Bot: 📊 *Estado del Bot*

• Global: ✅ Activo
• Usuarios pausados: 1

*Usuarios en atención manual:*
  - [numero] (hace X min)
```

**6. Reanudar usuario**

Desde número admin:
```
Admin: REANUDAR [numero_sin_codigo_pais]
```

**Ejemplo:** Si el número es 5491158647529@c.us, escribir:
```
Admin: REANUDAR 5491158647529
```

**✅ Resultado Esperado:**
```
Bot: ✅ Usuario 5491158647529 reanudado. El bot volverá a responderle.
```

**✅ Verificar en logs:**
```
▶️ Usuario 5491158647529@c.us reanudado
```

**7. Verificar que volvió a funcionar**
```
Usuario: hola
```

**✅ Resultado Esperado:**
```
Bot: [Menú principal]
```

---

### ❌ Comportamiento ANTERIOR (Incorrecto)

**Antes de la corrección:**
```
Usuario: quiero hablar con un humano
Bot: Entendido, un agente te va a contactar
Usuario: hola
Bot: ¡Hola! ¿En qué puedo ayudarte? ❌ (seguía respondiendo)
```

### ✅ Comportamiento NUEVO (Correcto)

**Después de la corrección:**
```
Usuario: quiero hablar con un humano
Bot: Entendido, un agente te va a contactar
Usuario: hola
Bot: ⏸️ Un agente está atendiendo tu consulta... ✅ (pausado)
Usuario: hola?
[Bot NO responde] ✅
```

---

### 📊 Checklist Test 1

- [ ] Bot responde al handoff con mensaje de confirmación
- [ ] Usuario aparece en logs como pausado
- [ ] Bot NO responde a mensajes posteriores
- [ ] Notificación se envía en el primer mensaje después de pausar
- [ ] Comando ESTADO BOT muestra el usuario pausado
- [ ] Comando REANUDAR reactiva al usuario
- [ ] Después de reanudar, bot vuelve a responder normalmente

---

## 🧪 TEST 2: Debounce Reducido

### Objetivo
Verificar que el debounce de 300ms permite conversación natural sin ignorar mensajes.

### Pasos

**1. Mensajes muy rápidos (menos de 300ms)**

Enviar 2 mensajes lo más rápido posible:
```
Usuario: Hola
Usuario: Necesito ayuda
```

**✅ Resultado Esperado:**
```
Bot: [Responde al primero]
[El segundo se ignora]
```

**✅ Verificar en logs:**
```
📩 [numero]: Hola
📩 [numero]: Necesito ayuda
⏭️ Mensaje ignorado (debounce): [numero]@c.us
```

**2. Mensajes con pausa normal (más de 300ms)**

Enviar 3 mensajes con 1 segundo entre cada uno:
```
Usuario: Hola
[Esperar 1 segundo]
Usuario: Necesito globos
[Esperar 1 segundo]
Usuario: De frozen
```

**✅ Resultado Esperado:**
```
Bot: [Responde al primero]
Bot: [Responde al segundo]
Bot: [Responde al tercero]
```

**✅ Verificar en logs:**
```
📩 [numero]: Hola
🤖 Bot: [respuesta]
📩 [numero]: Necesito globos
🤖 Bot: [respuesta]
📩 [numero]: De frozen
🤖 Bot: [respuesta]
```

**❌ NO debe aparecer:**
```
⏭️ Mensaje ignorado (debounce)
```

---

### ❌ Comportamiento ANTERIOR (Incorrecto)

**Con debounce de 1000ms:**
```
Usuario: Hola
[Espera 0.5 segundos]
Usuario: Necesito ayuda
Bot: [Responde solo al primero]
[Segundo mensaje ignorado silenciosamente] ❌
```

### ✅ Comportamiento NUEVO (Correcto)

**Con debounce de 300ms:**
```
Usuario: Hola
[Espera 0.5 segundos]
Usuario: Necesito ayuda
Bot: [Responde al primero]
Bot: [Responde al segundo] ✅
```

---

### 📊 Checklist Test 2

- [ ] Mensajes muy rápidos (<300ms) se ignoran correctamente
- [ ] Mensajes con pausa normal (>300ms) se procesan todos
- [ ] No hay mensajes perdidos en conversación natural
- [ ] Logs muestran "ignorado (debounce)" solo cuando corresponde

---

## 🧪 TEST 3: Try-Catch en Búsqueda de Productos

### Objetivo
Verificar que el bot NO crashea si la búsqueda de productos falla.

### Escenario A: Catálogo Funcionando (Normal)

**1. Búsqueda normal**
```
Usuario: Hola
Bot: [Bienvenida]
Usuario: Juan
Bot: [Menú]
Usuario: 1
Bot: Perfecto! ¿Qué productos necesitás?
Usuario: globos de frozen
```

**✅ Resultado Esperado:**
```
Bot: [Respuesta con productos de Frozen y precios]
```

**✅ Verificar en logs:**
```
🔍 Buscando productos: "globos de frozen"
📦 Productos encontrados: X
```

---

### Escenario B: Catálogo Fallando (Simulado)

**IMPORTANTE:** Este test requiere simular un error.

**1. Detener el bot** (Ctrl+C)

**2. Renombrar el archivo del catálogo**
```bash
# Windows PowerShell
Rename-Item catalogo.js catalogo.js.backup

# O manualmente renombrar catalogo.js a catalogo.js.backup
```

**3. Reiniciar el bot**
```bash
node bot.js
```

**✅ Verificar que el bot arranca con error:**
```
❌ Error: Cannot find module './catalogo.js'
[Bot NO debe iniciar]
```

**4. Restaurar el catálogo**
```bash
# Windows PowerShell
Rename-Item catalogo.js.backup catalogo.js
```

**5. Reiniciar el bot**
```bash
node bot.js
```

---

### Escenario C: Error en Búsqueda (Simulado)

**IMPORTANTE:** Este test requiere modificar código temporalmente.

**1. Detener el bot**

**2. Editar `catalogo.js`**

Buscar la función `buscarProductos` y agregar al inicio:
```javascript
function buscarProductos(consulta, limite = 5) {
  // SIMULACIÓN DE ERROR - ELIMINAR DESPUÉS
  throw new Error("Error simulado de catálogo");
  
  // ... resto del código
}
```

**3. Reiniciar el bot**
```bash
node bot.js
```

**4. Probar búsqueda**
```
Usuario: Hola
Usuario: Juan
Usuario: 1
Usuario: globos de frozen
```

**✅ Resultado Esperado:**
```
Bot: [Responde sin productos, pero NO crashea]
Bot: [Mensaje genérico sobre consultar productos]
```

**✅ Verificar en logs:**
```
🔍 Buscando productos: "globos de frozen"
⚠️ Error buscando productos: Error simulado de catálogo
```

**❌ NO debe aparecer:**
```
[Crash del bot]
[Error sin manejar]
[Bot deja de responder]
```

**5. Restaurar `catalogo.js`**

Eliminar la línea del error simulado y reiniciar el bot.

---

### ❌ Comportamiento ANTERIOR (Incorrecto)

**Sin try-catch:**
```
Usuario: globos de frozen
[Error en buscarProductos()]
💥 Bot crashea completamente ❌
[Proceso termina]
```

### ✅ Comportamiento NUEVO (Correcto)

**Con try-catch:**
```
Usuario: globos de frozen
[Error en buscarProductos()]
⚠️ Log: Error buscando productos
Bot: [Responde sin contexto de productos] ✅
[Bot sigue funcionando] ✅
```

---

### 📊 Checklist Test 3

- [ ] Con catálogo funcionando: búsqueda normal funciona
- [ ] Con catálogo fallando: bot NO crashea
- [ ] Error se registra en logs con nivel WARN
- [ ] Bot continúa respondiendo (sin contexto de productos)
- [ ] Usuario puede seguir usando el bot normalmente

---

## 📊 Resumen de Testing

### Tests Obligatorios

| Test | Tiempo | Prioridad |
|------|--------|-----------|
| Test 1: Handoff Real | 5 min | 🔴 CRÍTICO |
| Test 2: Debounce | 2 min | 🟡 MEDIO |
| Test 3: Try-Catch | 5 min | 🟡 MEDIO |

**Total:** ~12 minutos

---

### Criterio de Éxito

**Para pasar a producción:**

✅ **Test 1 (Handoff):**
- Usuario pide humano → se pausa
- Bot NO responde después de pausar
- Admin puede reanudar
- Después de reanudar funciona normal

✅ **Test 2 (Debounce):**
- Conversación natural funciona sin perder mensajes
- Solo ignora mensajes extremadamente rápidos (<300ms)

✅ **Test 3 (Try-Catch):**
- Bot NO crashea si búsqueda falla
- Error se registra en logs
- Bot continúa funcionando

---

## 🐛 Reporte de Problemas

Si algo falla, anotar:

```
TEST: [Número y nombre]
ESTADO: ❌ FAIL
QUÉ ESPERABA: [Comportamiento esperado]
QUÉ PASÓ: [Comportamiento real]
LOGS: [Copiar logs relevantes]
```

**Ejemplo:**
```
TEST: Test 1 - Handoff Real
ESTADO: ❌ FAIL
QUÉ ESPERABA: Bot se pausa después de "quiero humano"
QUÉ PASÓ: Bot siguió respondiendo normalmente
LOGS:
📩 [numero]: quiero hablar con un humano
🤖 Bot: Entendido, un agente te va a contactar
📩 [numero]: hola
🤖 Bot: ¡Hola! ¿En qué puedo ayudarte? ❌
```

---

## 💡 Tips

1. **Test 1 es el más importante** - Si falla, avisame inmediatamente
2. **Test 2 es difícil de testear** - Necesitás escribir MUY rápido para el primer caso
3. **Test 3 es opcional** - Solo si querés verificar robustez extrema
4. **Revisá logs constantemente** - Ahí vas a ver si funciona correctamente

---

## 🎯 Orden Recomendado

1. **Test 1** (Handoff) - 5 minutos - 🔴 CRÍTICO
2. **Test 2** (Debounce) - 2 minutos - 🟡 MEDIO
3. **Test 3** (Try-Catch) - OPCIONAL - Solo si tenés tiempo

**Mínimo para producción:** Test 1 debe pasar al 100%
