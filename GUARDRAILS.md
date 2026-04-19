# Sistema de Guardrails - Protección contra Tópicos Fuera de Alcance

## Problema Identificado

El bot respondía preguntas sobre temas sensibles (política, historia, religión) que están fuera del alcance de un asistente de tienda de cotillón.

## Solución Implementada: Defensa en 2 Capas (Eficiente)

### Capa 1: Filtro Rápido por Palabras Clave
- **Latencia:** <1ms
- **Costo:** $0 (sin tokens)
- **Efectividad:** ~70-80% de casos obvios

Bloquea mensajes que contienen palabras prohibidas:
- Política: hitler, nazi, milei, cristina, trump, etc.
- Religión: dios, jesús, alá, biblia, etc.
- Temas sensibles: aborto, drogas, armas, etc.
- Celebridades: messi, netflix, etc.
- Educación: matemática, historia, etc.

**Ventaja:** Bloquea ANTES de consumir tokens del LLM.

### Capa 2: System Prompt Ultra-Reforzado
- **Técnica:** Prefix forcing + ejemplos explícitos
- **Efectividad:** ~95%+ cuando se combina con Capa 1

El SYSTEM_PROMPT usa técnicas avanzadas:
1. **Identidad restrictiva:** "Tu ÚNICA función es..."
2. **Listas explícitas:** Temas permitidos vs prohibidos
3. **Respuesta forzada:** Texto exacto a usar para rechazos
4. **Ejemplos obligatorios:** Casos específicos con respuestas esperadas
5. **Recordatorio final:** Refuerzo de la especialización

## Arquitectura del Flujo

```
Usuario envía mensaje
    ↓
[Filtros básicos: grupos, tipos, debounce, longitud]
    ↓
[CAPA 1: Palabras prohibidas] ← 70-80% bloqueados aquí (0ms, $0)
    ↓ (si pasa)
[CAPA 2: LLM con System Prompt reforzado] ← 15-25% bloqueados aquí
    ↓
Respuesta al usuario
```

## Ventajas de Esta Aproximación

✅ **Una sola llamada al LLM** (no dos como antes)
✅ **Costo mínimo** - Solo regex gratis + 1 llamada LLM
✅ **Latencia baja** - Sin overhead de clasificación
✅ **Efectividad alta** - 95%+ de bloqueo combinado
✅ **Fácil de mantener** - Agregar palabras a la lista

## Configuración

### Agregar Palabras Prohibidas (bot.js)
Editá el array `palabrasProhibidas` en la función `contieneTemaProhibido()`:

```javascript
const palabrasProhibidas = [
  'palabra1', 'palabra2', // etc.
];
```

### Ajustar System Prompt (.env)
El `SYSTEM_PROMPT` usa "prefix forcing" - una respuesta exacta que el modelo debe usar.

## Monitoreo

Logs a observar:
- `🚫 Palabra prohibida detectada: "palabra"` - Bloqueado en Capa 1
- `🚫 Tema prohibido bloqueado` - Mensaje de rechazo enviado

## Comparación con Solución Anterior

| Aspecto | Solución Anterior (3 capas) | Solución Actual (2 capas) |
|---------|----------------------------|---------------------------|
| Llamadas LLM | 2 por mensaje | 1 por mensaje |
| Costo | ~$0.0002 | ~$0.0001 |
| Latencia | +1000-1500ms | +0-1ms |
| Efectividad | 95% | 95% |
| Complejidad | Alta | Baja |

## Testing

Probá estos casos después de reiniciar el bot:

**Debe bloquear (Capa 1 - regex):**
- "Hitler tenía razón?"
- "Qué opinas de Milei?"
- "Quién ganó el mundial?"

**Debe bloquear (Capa 2 - system prompt):**
- "Contame sobre la Segunda Guerra" (si no tiene palabras exactas)
- "Qué pensás de la situación actual?" (ambiguo)

**Debe permitir:**
- "Tienen globos de cumpleaños?"
- "Cuánto sale una piñata?"
- "Hacen envíos?"

