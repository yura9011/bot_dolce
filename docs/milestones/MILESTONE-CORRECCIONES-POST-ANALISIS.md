# Milestone: Correcciones Post-Análisis

## Contexto

Se realizó un análisis exhaustivo de `bot.js` y se detectaron varios problemas. Este milestone contiene las correcciones prioritarias que deben implementarse.

**IMPORTANTE:** Este documento está diseñado para que otro agente lo ejecute sin hacer suposiciones. Todas las decisiones ya fueron tomadas.

---

## Reglas para el Agente Ejecutor

1. ❌ **NO asumir nada** - Si algo no está claro, preguntar
2. ❌ **NO agregar funcionalidades** no solicitadas
3. ❌ **NO cambiar lógica** existente más allá de lo especificado
4. ✅ **SÍ seguir las instrucciones** exactamente como están escritas
5. ✅ **SÍ verificar** cada cambio antes de continuar
6. ✅ **SÍ reportar** cualquier problema encontrado

---

## Corrección 1: Handoff Real (CRÍTICO)

### Problema Actual

**Ubicación:** `bot.js` líneas ~520-527

**Código actual:**
```javascript
// Detección de handoff
if (texto.toLowerCase().includes("humano")) {
  await responderBot(message,
    "Entendido 👋 Un agente se va a comunicar con vos a la brevedad. ¡Gracias por tu paciencia!"
  );
  log(`🚨 HANDOFF solicitado por ${userId}`);
  estadosUsuario[userId] = ESTADOS.MENU_PRINCIPAL;
  return;
}
```

**Problema:** El bot dice que un agente va a contactar, pero NO pausa al usuario. El bot sigue respondiendo automáticamente.

---

### Solución Requerida

**Cambiar el código a:**

```javascript
// Detección de handoff
if (texto.toLowerCase().includes("humano")) {
  // PRIMERO: Pausar al usuario para atención manual
  pausarUsuario(userId, "handoff_solicitado");
  
  // SEGUNDO: Enviar mensaje de confirmación
  await responderBot(message,
    "Entendido 👋 Un agente se va a comunicar con vos a la brevedad. ¡Gracias por tu paciencia!"
  );
  
  // TERCERO: Log del evento
  log(`🚨 HANDOFF solicitado por ${userId}`);
  
  // NO cambiar estado a MENU_PRINCIPAL - el usuario queda pausado
  return;
}
```

---

### Instrucciones Paso a Paso

1. **Buscar** en `bot.js` la línea que contiene: `if (texto.toLowerCase().includes("humano"))`

2. **Verificar** que el bloque actual es exactamente como se muestra arriba

3. **Reemplazar** el bloque completo con el nuevo código

4. **Verificar** que:
   - La función `pausarUsuario()` existe (debe estar definida más arriba en el archivo)
   - El parámetro `userId` está disponible en ese contexto
   - La función `responderBot()` existe

5. **NO agregar** ninguna otra lógica

---

### Resultado Esperado

**Antes:**
```
Usuario: "quiero hablar con un humano"
Bot: "Entendido, un agente te va a contactar"
Usuario: "hola" (escribe de nuevo)
Bot: "¡Hola! ¿En qué puedo ayudarte?" (sigue respondiendo ❌)
```

**Después:**
```
Usuario: "quiero hablar con un humano"
Bot: "Entendido, un agente te va a contactar"
[Usuario queda PAUSADO]
Usuario: "hola" (escribe de nuevo)
Bot: [NO responde, está pausado ✅]
Personal: [Atiende manualmente]
```

---

### Verificación

Después de hacer el cambio, verificar:

- [ ] El código compila sin errores
- [ ] La función `pausarUsuario()` se llama ANTES de enviar el mensaje
- [ ] Se eliminó la línea `estadosUsuario[userId] = ESTADOS.MENU_PRINCIPAL;`
- [ ] El `return;` sigue al final del bloque

---

## Corrección 2: Reducir Debounce (RECOMENDADO)

### Problema Actual

**Ubicación:** `bot.js` línea ~70

**Código actual:**
```javascript
const DEBOUNCE_TIME_MS = 1000;
```

**Problema:** 1 segundo (1000ms) es demasiado tiempo. Si un usuario escribe dos mensajes rápidos (ej: "Hola" + "Necesito ayuda"), el segundo mensaje se ignora silenciosamente.

---

### Solución Requerida

**Cambiar a:**

```javascript
const DEBOUNCE_TIME_MS = 300;
```

---

### Instrucciones Paso a Paso

1. **Buscar** en `bot.js` la línea: `const DEBOUNCE_TIME_MS = 1000;`

2. **Cambiar** el valor de `1000` a `300`

3. **NO cambiar** el nombre de la constante

4. **NO agregar** lógica adicional

---

### Justificación

- 300ms es suficiente para evitar spam
- Permite conversación natural
- Estándar en la industria para debounce de mensajería

---

### Verificación

Después de hacer el cambio, verificar:

- [ ] El valor es exactamente `300` (sin comillas, es un número)
- [ ] La constante sigue llamándose `DEBOUNCE_TIME_MS`
- [ ] No hay otros cambios en esa línea

---

## Corrección 3: Try-Catch en Búsqueda de Productos (RECOMENDADO)

### Problema Actual

**Ubicación:** `bot.js` líneas ~537-540

**Código actual:**
```javascript
// Búsqueda en catálogo (RAG)
log(`🔍 Buscando productos: "${texto}"`);
const productosEncontrados = buscarProductos(texto, 5);
log(`📦 Productos encontrados: ${productosEncontrados.length}`);
```

**Problema:** Si `buscarProductos()` falla (archivo corrupto, error de parsing, etc.), el bot crashea completamente.

---

### Solución Requerida

**Cambiar a:**

```javascript
// Búsqueda en catálogo (RAG)
log(`🔍 Buscando productos: "${texto}"`);

let productosEncontrados = [];
try {
  productosEncontrados = buscarProductos(texto, 5);
  log(`📦 Productos encontrados: ${productosEncontrados.length}`);
} catch (error) {
  log(`⚠️ Error buscando productos: ${error.message}`, "WARN");
  // Continuar sin productos - el bot responderá sin contexto del catálogo
}
```

---

### Instrucciones Paso a Paso

1. **Buscar** en `bot.js` el comentario: `// Búsqueda en catálogo (RAG)`

2. **Verificar** que las siguientes 3 líneas son exactamente como se muestra arriba

3. **Reemplazar** esas 3 líneas con el nuevo código (6 líneas)

4. **Verificar** que:
   - `productosEncontrados` se inicializa como array vacío ANTES del try
   - El try-catch rodea SOLO la llamada a `buscarProductos()` y el log
   - El comentario dentro del catch explica qué pasa si falla

5. **NO cambiar** la lógica que viene después (construcción de `contextoProductos`)

---

### Comportamiento Esperado

**Si buscarProductos() funciona:**
- Todo sigue igual que antes
- Se buscan productos y se agregan al contexto

**Si buscarProductos() falla:**
- Se registra el error en el log
- `productosEncontrados` queda como array vacío `[]`
- El bot continúa funcionando pero sin contexto de productos
- El LLM responde basándose solo en su conocimiento general

---

### Verificación

Después de hacer el cambio, verificar:

- [ ] `productosEncontrados` se declara con `let` (no `const`)
- [ ] Se inicializa como `[]` antes del try
- [ ] El try-catch está correctamente cerrado
- [ ] El log de error usa nivel `"WARN"`
- [ ] No se agregó lógica adicional

---

## Corrección 4: Limpiar Funciones No Usadas (OPCIONAL)

### Problema Actual

**Ubicación:** `bot.js` líneas ~10-15

**Código actual:**
```javascript
const {
  ESTADOS,
  getMensajeBienvenida,
  getMenuPrincipal,
  getMenuPaqueteria,
  getInfoCorreoArgentino,
  getInfoAndreani,
  getInfoMercadoLibre,
  getMenuEnvios,              // ❌ NO USADA
  getInfoPreparacionPaquete,  // ❌ NO USADA
  getInfoPaqueteListo,        // ❌ NO USADA
  getMensajePedirNombre,
  getMensajeNoEntiendo,
} = require("./flujos.js");
```

**Problema:** Se importan 3 funciones que nunca se usan en el código.

---

### Solución Requerida

**Opción A (RECOMENDADA): Eliminar imports no usados**

```javascript
const {
  ESTADOS,
  getMensajeBienvenida,
  getMenuPrincipal,
  getMenuPaqueteria,
  getInfoCorreoArgentino,
  getInfoAndreani,
  getInfoMercadoLibre,
  getMensajePedirNombre,
  getMensajeNoEntiendo,
} = require("./flujos.js");
```

**Opción B: Dejar como está**

Si el cliente planea implementar esas funciones en el futuro, dejar el código como está.

---

### Instrucciones Paso a Paso

**IMPORTANTE:** Preguntar al usuario qué opción prefiere ANTES de hacer cambios.

**Si elige Opción A:**

1. **Buscar** el bloque de imports de `flujos.js`

2. **Eliminar** las 3 líneas:
   - `getMenuEnvios,`
   - `getInfoPreparacionPaquete,`
   - `getInfoPaqueteListo,`

3. **Verificar** que no queden comas duplicadas

4. **Verificar** que el código sigue compilando

**Si elige Opción B:**

1. No hacer nada
2. Documentar que las funciones están para uso futuro

---

### Verificación

Si se eligió Opción A:

- [ ] Las 3 funciones fueron eliminadas del import
- [ ] No hay comas duplicadas (ej: `,,`)
- [ ] El código compila sin errores
- [ ] No se usan esas funciones en ninguna parte del código

---

## Orden de Implementación

### Fase 1: Correcciones Críticas ✅ COMPLETADO
1. ✅ Corrección 1: Handoff Real - IMPLEMENTADO CORRECTAMENTE
2. ✅ Corrección 2: Reducir Debounce - IMPLEMENTADO CORRECTAMENTE
3. ✅ Corrección 3: Try-Catch en Búsqueda - IMPLEMENTADO CORRECTAMENTE

**Tiempo real:** 10 minutos
**Estado:** ✅ TODAS LAS CORRECCIONES CRÍTICAS COMPLETADAS

---

### Fase 2: Limpieza (OPCIONAL)
4. ⏳ Corrección 4: Limpiar Funciones No Usadas (pendiente de decisión)

**Tiempo estimado:** 2-3 minutos

---

## Revisión de Implementación

### ✅ Corrección 1: Handoff Real
**Verificado:** `bot.js` líneas 604-618
- ✅ Llama a `pausarUsuario(userId, "handoff_solicitado")` ANTES del mensaje
- ✅ Usa `responderBot()` para enviar confirmación
- ✅ Log del evento presente
- ✅ NO cambia estado a MENU_PRINCIPAL
- ✅ Usuario queda pausado correctamente

**Estado:** ✅ PERFECTO

---

### ✅ Corrección 2: Debounce Reducido
**Verificado:** `bot.js` línea 89
- ✅ Valor cambiado de `1000` a `300`
- ✅ Nombre de constante sin cambios
- ✅ Sintaxis correcta

**Estado:** ✅ PERFECTO

---

### ✅ Corrección 3: Try-Catch en Búsqueda
**Verificado:** `bot.js` líneas 634-646
- ✅ `productosEncontrados` inicializado como `[]` con `let`
- ✅ Try-catch rodea la llamada a `buscarProductos()`
- ✅ Log de error con nivel `"WARN"`
- ✅ Comentario explicativo en el catch
- ✅ Continúa sin crashear si falla

**Estado:** ✅ PERFECTO

---

### ✅ Verificación de Sintaxis
**Comando:** `node -c bot.js`
**Resultado:** ✅ Sin errores de sintaxis

---

## Testing Después de Correcciones

### Test 1: Handoff
```
1. Usuario escribe: "quiero hablar con un humano"
2. Verificar: Bot responde con mensaje de confirmación
3. Verificar: Usuario aparece en estado pausado (comando: ESTADO BOT)
4. Usuario escribe: "hola"
5. Verificar: Bot NO responde (está pausado)
```

### Test 2: Debounce
```
1. Usuario escribe: "Hola"
2. Inmediatamente escribe: "Necesito ayuda"
3. Verificar: Bot responde a AMBOS mensajes
4. Verificar: No hay mensajes ignorados en logs
```

### Test 3: Búsqueda de Productos
```
1. Simular error en catalogo.js (renombrar archivo temporalmente)
2. Usuario escribe: "globos de frozen"
3. Verificar: Bot NO crashea
4. Verificar: Log muestra warning de error
5. Verificar: Bot responde (sin contexto de productos)
6. Restaurar catalogo.js
```

---

## Checklist de Implementación

### Antes de Empezar
- [ ] Leer este documento completo
- [ ] Entender cada corrección
- [ ] Tener backup del código actual
- [ ] Verificar que `bot.js` existe y es accesible

### Durante Implementación
- [ ] Corrección 1: Handoff Real implementada
- [ ] Corrección 2: Debounce reducido
- [ ] Corrección 3: Try-Catch agregado
- [ ] Corrección 4: Decisión tomada (hacer o no hacer)

### Después de Implementación
- [ ] Código compila sin errores de sintaxis
- [ ] No hay warnings de linter
- [ ] Todas las funciones usadas existen
- [ ] Commit realizado con mensaje descriptivo
- [ ] Push a GitHub

### Testing
- [ ] Test 1: Handoff funciona
- [ ] Test 2: Debounce permite mensajes rápidos
- [ ] Test 3: Búsqueda no crashea si falla

---

## Problemas Conocidos y Soluciones

### Problema: "pausarUsuario is not defined"

**Causa:** La función `pausarUsuario()` no existe o está mal escrita.

**Solución:**
1. Buscar en `bot.js` la definición: `function pausarUsuario(`
2. Verificar que existe y está antes del código de handoff
3. Verificar el nombre exacto (mayúsculas/minúsculas)

---

### Problema: "responderBot is not defined"

**Causa:** La función `responderBot()` no existe o está mal escrita.

**Solución:**
1. Buscar en `bot.js` la definición: `async function responderBot(`
2. Verificar que existe y está antes del código de handoff
3. Verificar el nombre exacto

---

### Problema: "buscarProductos is not defined"

**Causa:** La función no está importada correctamente.

**Solución:**
1. Verificar que existe: `const { buscarProductos, ... } = require("./catalogo.js");`
2. Verificar que el archivo `catalogo.js` existe
3. Verificar que la función está exportada en `catalogo.js`

---

## Notas Importantes

### ⚠️ NO Hacer

- ❌ NO cambiar nombres de funciones
- ❌ NO agregar validaciones adicionales no solicitadas
- ❌ NO modificar la lógica de flujos existentes
- ❌ NO cambiar el formato de logs
- ❌ NO agregar nuevas dependencias
- ❌ NO modificar archivos que no sean `bot.js`

### ✅ SÍ Hacer

- ✅ Seguir las instrucciones exactamente
- ✅ Verificar cada cambio antes de continuar
- ✅ Reportar cualquier problema encontrado
- ✅ Hacer commit después de cada corrección
- ✅ Probar que el código compila

---

## Entregables

Al finalizar, entregar:

1. ✅ Código modificado en `bot.js`
2. ✅ Commit con mensaje: "Correcciones post-análisis: handoff, debounce y try-catch"
3. ✅ Reporte de testing con resultados de los 3 tests
4. ✅ Lista de cualquier problema encontrado durante implementación

---

## Contacto

Si algo no está claro o encuentras un problema no documentado aquí:

1. **NO asumir** la solución
2. **DETENER** la implementación
3. **REPORTAR** el problema específico
4. **ESPERAR** instrucciones adicionales

---

## Resumen Ejecutivo

**Correcciones a realizar:** 3 obligatorias + 1 opcional
**Tiempo estimado:** 10-15 minutos
**Archivos a modificar:** Solo `bot.js`
**Riesgo:** Bajo (cambios pequeños y bien definidos)
**Testing requerido:** 3 tests específicos

**Estado:** ⏳ Pendiente de implementación
