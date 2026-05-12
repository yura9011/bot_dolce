# Mejoras Implementadas en el Bot de WhatsApp

## Resumen de cambios

### 1. ✅ Variables de entorno
- `GEMINI_API_KEY` y `SYSTEM_PROMPT` en archivo `.env`
- Validación al inicio
- `.env.example` como referencia
- `.env` en `.gitignore`

### 2. ✅ Reintentos ante errores de API
- Función `llamarGeminiConReintentos()` con hasta 3 intentos
- Delay de 2 segundos entre reintentos
- Logs detallados de cada intento

### 3. ✅ Control de mensajes duplicados
- Debounce de 1 segundo por usuario
- Evita spam y procesamiento duplicado

### 4. ✅ Logging con timestamp
- Formato `[DD/MM/YYYY HH:mm:ss]`
- Logs en consola Y archivo (`logs/bot.log`)
- Niveles: INFO, WARN, ERROR

### 5. ✅ Límite de longitud de mensaje
- Máximo 500 caracteres
- Respuesta automática si excede el límite

### 6. ✅ Manejo de mensajes de estado
- Ignora `revoked`, `e2e_notification`, `notification_template`

### 7. ✅ Moderación de contenido
- **Tópicos prohibidos:** Bloquea política, religión, deportes, etc. (~40 palabras)
- **Lenguaje ofensivo:** Detecta insultos pero responde profesionalmente (~20 palabras)
- Todo queda registrado en logs

### 8. ✅ Modelo correcto de Gemini
- Actualizado a `gemini-2.5-flash` (modelo estable 2026)

## Configuración

### Constantes ajustables (bot.js)
```javascript
MAX_MESSAGE_LENGTH = 500      // Longitud máxima
MAX_RETRIES = 3               // Reintentos API
RETRY_DELAY_MS = 2000         // Delay entre reintentos
DEBOUNCE_TIME_MS = 1000       // Anti-spam
```

### Listas de moderación (bot.js)
```javascript
TOPICOS_PROHIBIDOS = [...]    // ~40 palabras
LENGUAJE_OFENSIVO = [...]     // ~20 palabras
```

## Uso

### Iniciar el bot
```bash
npm start
```

### Ver logs en tiempo real
```bash
tail -f logs/bot.log
```

### Buscar problemas
```bash
grep ERROR logs/bot.log
grep "Lenguaje ofensivo" logs/bot.log
grep "Tema prohibido" logs/bot.log
```

## Arquitectura

Todo está en `bot.js` - sin módulos separados innecesarios.

**Flujo:**
1. Mensaje recibido
2. Filtros básicos (grupos, notificaciones, debounce)
3. Validación de longitud
4. Moderación (tópicos prohibidos → bloquear, insultos → registrar)
5. Detección de handoff ("HUMANO")
6. Búsqueda en catálogo (RAG)
7. Llamada a Gemini con reintentos
8. Respuesta al usuario

## Documentación

- `LOGGING-Y-MODERACION.md` - Cómo usar logs y moderación
- `GUARDRAILS.md` - Sistema de guardrails (actualizado)

## Lo que NO se implementó (intencionalmente)

- ❌ Métricas complejas en JSON
- ❌ Múltiples archivos de log
- ❌ Anonimización de userIds
- ❌ Módulos separados (logger.js, moderacion.js)
- ❌ Sistema de incidentes separado

**Razón:** Simplicidad. Solo lo necesario para un negocio funcional.
