# Análisis de bot.js - Problemas Detectados

## 🔴 PROBLEMAS CRÍTICOS

### 1. **Funciones Importadas pero Nunca Usadas**
```javascript
getMenuEnvios,
getInfoPreparacionPaquete,
getInfoPaqueteListo,
```
**Problema**: Estas funciones se importan de `flujos.js` pero nunca se usan en el código.
**Impacto**: Código muerto, posible funcionalidad incompleta.
**Suposición detectada**: Parece que había un flujo de "preparación de paquete" que nunca se implementó.

---

### 2. **Flujo de Paquetería Incompleto**
**Líneas 456-481**: Los estados `INFO_CORREO`, `INFO_ANDREANI`, `INFO_MERCADOLIBRE` solo muestran información estática.

**Problema**: No hay flujo real de seguimiento, cotización o preparación de envío.
**Suposición detectada**: Se asumió que con mostrar info estática era suficiente, pero las funciones importadas sugieren que debería haber más interacción.

**Flujo actual:**
```
Usuario → Menú Paquetería → Info estática → ¿Y ahora qué?
```

**Flujo esperado (según imports):**
```
Usuario → Menú Paquetería → Info → Preparación → Paquete Listo
```

---

### 3. **Sistema de Handoff Incompleto**
**Línea 520**: Cuando el usuario pide "humano", el bot responde pero NO pausa al usuario.

```javascript
if (texto.toLowerCase().includes("humano")) {
  await responderBot(message, "...");
  log(`🚨 HANDOFF solicitado por ${userId}`);
  estadosUsuario[userId] = ESTADOS.MENU_PRINCIPAL; // ❌ Solo vuelve al menú
  return;
}
```

**Problema**: El bot dice "un agente te va a contactar" pero sigue respondiendo automáticamente.
**Debería hacer**: `pausarUsuario(userId, "handoff_solicitado");`

---

### 4. **Detección de Intervención Manual Frágil**
**Líneas 213-244**: El sistema depende de un `Set` en memoria para distinguir mensajes del bot vs manuales.

**Problemas:**
- Si el bot se reinicia, el `Set` se vacía → todos los mensajes se consideran manuales
- Si un mensaje del bot falla al agregarse al Set, se detecta como manual
- No hay persistencia del Set

**Suposición detectada**: Se asumió que el bot nunca se reiniciaría durante una conversación activa.

---

### 5. **Moderación de Contenido con Listas Hardcodeadas**
**Líneas 246-275**: Listas de palabras prohibidas e insultos en el código.

**Problemas:**
- Fácil de evadir (ej: "h1tler", "p u t o")
- No detecta contexto (ej: "River Plate" en dirección)
- Lista de insultos argentinos incompleta
- Mezcla temas políticos con deportivos sin razón clara

**Suposición detectada**: Se asumió que una búsqueda simple de substring sería suficiente.

---

### 6. **Búsqueda de Productos Sin Validación**
**Línea 537**: Se buscan productos pero no se valida si el catálogo está disponible.

```javascript
const productosEncontrados = buscarProductos(texto, 5);
```

**Problemas:**
- ¿Qué pasa si `catalogo.js` falla al cargar?
- ¿Qué pasa si `buscarProductos()` lanza un error?
- No hay try-catch

**Suposición detectada**: Se asumió que el catálogo siempre estará disponible.

---

### 7. **Contexto de Productos Mal Formateado**
**Líneas 545-549**: Se construye un prompt con productos pero sin estructura clara.

```javascript
mensajeConContexto = `${contextoProductos}\n\n---\n\nPregunta del cliente: ${texto}\n\nInstrucción: Respondé usando SOLO...`;
```

**Problemas:**
- El formato depende de `formatearProductosParaContexto()` que no vemos
- No hay validación de longitud del contexto
- Puede exceder límites de tokens del modelo
- La instrucción está en español pero el modelo puede responder en inglés

**Suposición detectada**: Se asumió que el formato siempre será correcto y no excederá límites.

---

### 8. **Manejo de Errores Genérico**
**Líneas 566-569**: Después de 3 reintentos, solo muestra mensaje genérico.

```javascript
catch (error) {
  log(`❌ Error después de ${MAX_RETRIES} intentos: ${error.message}`, "ERROR");
  await responderBot(message, "Ups, tuve un problema técnico...");
}
```

**Problemas:**
- No distingue tipos de error (red, API key inválida, rate limit, etc.)
- No ofrece alternativa (ej: "¿Querés hablar con un humano?")
- No pausa al usuario para atención manual

**Suposición detectada**: Se asumió que todos los errores son temporales y el usuario reintentará.

---

### 9. **Debounce Demasiado Agresivo**
**Líneas 391-396**: 1 segundo de debounce puede frustrar usuarios.

```javascript
const DEBOUNCE_TIME_MS = 1000;
if (lastMessageTime[userId] && (ahora - lastMessageTime[userId]) < DEBOUNCE_TIME_MS) {
  log(`⏭️ Mensaje ignorado (debounce): ${userId}`);
  return; // ❌ Ignora silenciosamente
}
```

**Problemas:**
- Usuario escribe rápido → mensajes ignorados sin aviso
- No hay feedback al usuario
- 1 segundo es mucho para conversación natural

**Suposición detectada**: Se asumió que mensajes rápidos = spam.

---

### 10. **Estados Sin Timeout**
**Línea 82**: Los estados de usuario se guardan indefinidamente en memoria.

```javascript
const estadosUsuario = {};
```

**Problemas:**
- Usuario deja conversación a medias → estado queda "colgado"
- Vuelve días después → bot asume que sigue en el mismo estado
- No hay limpieza de estados antiguos
- Fuga de memoria en largo plazo

**Suposición detectada**: Se asumió que los usuarios siempre completan el flujo o escriben "0".

---

## 🟡 PROBLEMAS MENORES

### 11. **Historial Sin Límite de Tamaño**
**Líneas 165-183**: El historial se guarda en JSON sin límite.

**Problema**: Con muchos usuarios, el archivo puede crecer indefinidamente.

---

### 12. **Logs Sin Rotación**
**Líneas 35-60**: Los logs se agregan a un archivo sin rotación.

**Problema**: El archivo `bot.log` crecerá sin límite.

---

### 13. **Validación de Admin Débil**
**Líneas 186-191**: Solo compara strings de números.

```javascript
const numeroLimpio = numero.replace("@c.us", "");
return ADMIN_NUMBERS.some(admin => numeroLimpio === admin);
```

**Problema**: No valida formato, no maneja números internacionales correctamente.

---

## 📊 RESUMEN

| Categoría | Cantidad |
|-----------|----------|
| Funciones no usadas | 3 |
| Flujos incompletos | 2 |
| Suposiciones peligrosas | 8 |
| Falta de validación | 5 |
| Problemas de persistencia | 3 |

---

## 🎯 RECOMENDACIONES PRIORITARIAS

1. **Completar flujo de paquetería** o eliminar funciones no usadas
2. **Implementar handoff real** cuando usuario pide humano
3. **Agregar try-catch** a búsqueda de productos
4. **Reducir debounce** a 300ms y agregar feedback
5. **Agregar timeout** a estados de usuario (ej: 30 minutos)
6. **Mejorar detección manual** con persistencia
7. **Validar longitud** del contexto de productos antes de enviar a Gemini
