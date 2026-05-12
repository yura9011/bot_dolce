# Pattern: Formato de Mensaje Inconsistente

> **First Observed**: 2026-05-11  
> **Last Updated**: 2026-05-12  
> **Confidence**: High  
> **Occurrences**: 3+ times

---

## Pattern Description

Los mensajes en `historial.json` pueden tener el texto en diferentes campos según quién o cómo se haya generado el mensaje: `msg.text`, `msg.texto`, o `msg.parts[0].text`. Esto causa que el dashboard o bot no muestren el contenido si solo buscan un campo específico.

---

## Context

**When this pattern appears**:
- Al leer mensajes desde `historial.json` en el dashboard
- Al mostrar el preview del último mensaje en la lista de chats
- Al procesar mensajes en el bot

**Conditions**:
- Mensajes enviados por humanos (dashboard) → `text`
- Mensajes generados por Gemini → `parts[0].text`
- Mensajes del formato legacy → `texto`

---

## Examples

### Example 1 — server.js obtenerChats()
**Problem**: `ultimoMensaje.text?.substring(0, 50)` mostraba preview vacío para mensajes con `parts[0].text`
**Fix**: `(ultimoMensaje.text || ultimoMensaje.texto || ultimoMensaje.parts?.[0]?.text || '').substring(0, 50)`

### Example 2 — conversation.js renderMessages()
**Problem**: No se veía el texto si el mensaje estaba en formato `parts[0].text`
**Fix**: `let messageText = msg.text || msg.texto || msg.parts?.[0]?.text || '';`

---

## Why This Matters

Cada vez que se agregue una nueva funcionalidad que lea mensajes de `historial.json`, hay que recordar usar el patrón de fallback. Olvidarlo causa bugs silenciosos donde el mensaje "existe" pero no se muestra.

---

## How to Apply

**Recommendations**:
- Usar SIEMPRE: `msg.text || msg.texto || msg.parts?.[0]?.text || ''`
- Nunca asumir que un solo campo existe
- Al crear nuevo código que lea mensajes, copiar este patrón

---

## Confidence Level

**High**: Observed 3+ times consistently (sesiones 2026-05-11 y 2026-05-12)

---

## Tags

`pattern`, `data-inconsistency`, `historial-json`, `dashboard`
