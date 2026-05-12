# Pattern: WhatsApp @lid vs número de teléfono

> **First Observed**: 2026-05-12  
> **Confidence**: High  
> **Occurrences**: 1 (confirmado en testing)

---

## Pattern Description

WhatsApp usa DOS identificadores distintos para el mismo número:
- `5491158647529@c.us` — formato clásico (número de teléfono)
- `119340145860821@lid` — formato nuevo (Linked Device ID)

El bot recibe mensajes con el formato `@lid` internamente. Al comparar contra la lista de admin-numbers (que guarda números de teléfono), no hay match.

---

## Impacto

- Sistema de ignorados/admins no funciona si se agrega el número de teléfono
- Hay que agregar el ID `@lid` para que el bot lo reconozca
- El `@lid` no es predecible — hay que obtenerlo de los logs del bot

---

## Cómo obtener el @lid de un número

1. Que el número mande un mensaje al bot
2. Ver los logs: `pm2 logs bot-dolce-dev --lines 20`
3. Buscar: `📩 [XXXXXXXXX@lid]` — ese es el ID real

---

## Fix Pendiente

El dashboard debería mostrar el ID real (`@lid`) que usa el bot, no solo el número de teléfono. Cuando alguien manda un mensaje, el bot podría registrar el mapeo `phone → lid` para que el dashboard lo use al agregar números.

---

## Tags

`whatsapp`, `admin-numbers`, `lid`, `phone-id`
