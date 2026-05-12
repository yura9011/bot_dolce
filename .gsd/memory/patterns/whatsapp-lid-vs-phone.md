# Pattern: WhatsApp @lid vs número de teléfono

> **First Observed**: 2026-05-12  
> **Last Updated**: 2026-05-12  
> **Confidence**: High  
> **Occurrences**: 1 (confirmado en testing)

---

## Pattern Description

WhatsApp usa DOS identificadores distintos para el mismo número:
- `5491158647529@c.us` — formato clásico (número de teléfono)
- `119340145860821@lid` — formato nuevo (Linked Device ID)

El bot recibe mensajes con el formato `@lid` internamente. Al comparar contra la lista de admin-numbers (que guarda números de teléfono), no hay match.

---

## Context

**When this pattern appears**:
- Al recibir mensajes de WhatsApp en el bot
- Al comparar el remitente contra admin-numbers
- Al mostrar IDs en el dashboard

**Conditions**:
- Clientes nuevos (WhatsApp asigna @lid automáticamente)
- Números que nunca antes habían escrito al bot

---

## Solución Implementada

El bot guarda automáticamente el mapeo `@lid → teléfono` en `config/phone-map.json` usando `message.getContact()`. `esAdmin()` y `getRolAdmin()` resuelven en ambos sentidos.

**Archivos involucrados**:
- `config/phone-map.json` — almacén persistente
- `lib/agent-manager.js` — captura del mapeo al recibir mensaje
- `lib/admin-commands.js` — `resolverNumero()` para búsqueda bidireccional

---

## How to Apply

- Al agregar un número a admin-numbers: usar el número de teléfono (formato `5491158647529`)
- El bot resuelve automáticamente si el mensaje llega como @lid
- Si no hay mapeo (nuevo número), funciona igual con match exacto

---

## Why This Matters

Sin la resolución, agregar números como admin es imposible porque el @lid no es predecible. Con el mapa, el usuario puede seguir agregando números de teléfono como siempre y el bot los resuelve.

---

## Confidence Level

**High**: Observado y corregido en producción.

---

## Tags

`pattern`, `whatsapp`, `admin-numbers`, `lid`, `phone-id`, `id-resolution`
