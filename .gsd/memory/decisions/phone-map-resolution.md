# Decision: Mapa automático @lid → número de teléfono

> **Date**: 2026-05-12  
> **Phase**: Dashboard Humano v2 — Producción  
> **Impact**: High  
> **Status**: Implemented

---

## Decision

Crear un archivo `config/phone-map.json` que almacene el mapeo entre el ID interno de WhatsApp (`@lid`) y el número de teléfono real. El bot guarda automáticamente el mapeo al recibir un mensaje. `esAdmin()` y `getRolAdmin()` resuelven en ambos sentidos (lid → phone y phone → lid).

---

## Context

WhatsApp usa dos IDs distintos para el mismo contacto:
- `5491158647529@c.us` — número de teléfono (lo que el usuario conoce)
- `119340145860821@lid` — ID interno del dispositivo vinculado (lo que el bot recibe)

El sistema `admin-numbers.json` guarda números de teléfono, pero el bot recibe mensajes con ID `@lid`. No hay match → el sistema de ignorados/admins no funciona.

---

## Alternatives Considered

### Option 1: Usar solo @lid (status quo ante)
**Pros**: No requiere cambios
**Cons**: El usuario no puede agregar números por teléfono, tiene que buscar el @lid en logs

### Option 2: Contact.sync + búsqueda inversa
**Pros**: No requiere archivo extra
**Cons**: Llamada asíncrona costosa por cada mensaje, no siempre disponible

### Option 3: Mapa persistente phone-map.json
**Pros**: Rápido (lectura local), ambos formatos funcionan, auto-poblamiento
**Cons**: Archivo extra que mantener

---

## Decision Rationale

Se eligió Option 3 porque:
- Resuelve el problema sin llamadas a la API de WhatsApp
- El mapa se auto-pobla al recibir mensajes
- La búsqueda es O(1) en ambos sentidos
- El dashboard puede consultar el mapa para mostrar números legibles
- No requiere cambios en la UI de admin-numbers

---

## Implementation

1. `config/phone-map.json` — archivo vacío `{}`
2. `lib/agent-manager.js:241-258` — llama `message.getContact()` en mensajes @lid y guarda `{ lid: phone }`
3. `lib/admin-commands.js` — nueva función `resolverNumero()` que busca en ambas direcciones; `esAdmin()`/`getRolAdmin()` la usan
4. `dashboard-humano-v2/server.js` — endpoint `GET /api/phone-map` para el frontend
5. `dashboard-humano-v2/public/js/config.js` — muestra `+5491158647529` en vez del @lid numérico

---

## Validation

- Mandar mensaje desde el celular → `phone-map.json` se puebla con `{ "119340145860821": "5491158647529" }`
- Agregar `5491158647529` como admin → funciona aunque el bot reciba @lid
- Agregar `119340145860821` como admin → también funciona (resolución inversa)

---

## Tags

`decision`, `architecture`, `whatsapp`, `lid`, `phone-map`, `admin-numbers`
