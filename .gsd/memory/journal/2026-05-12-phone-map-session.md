# Sesión: Mapa automático @lid → teléfono para admin-numbers

**Fecha**: 2026-05-12  
**Duración**: ~10 min  
**Agente**: opencode  
**Usuario**: forma

---

## 🎯 Objetivos

1. Resolver el mismatch entre IDs @lid de WhatsApp y números de teléfono en admin-numbers
2. Crear mapeo automático al recibir mensajes
3. Mostrar números legibles en el dashboard

---

## ✅ Tareas Completadas

### 1. config/phone-map.json (nuevo)
Archivo vacío `{}` que se puebla automáticamente.

### 2. lib/agent-manager.js — Captura de mapeo
Al recibir un mensaje con `@lid`, llama `message.getContact()` y guarda `{ lid: phone }` en `phone-map.json`.

### 3. lib/admin-commands.js — Resolución bidireccional
- Nueva función `resolverNumero()` busca en ambas direcciones
- `esAdmin()` y `getRolAdmin()` la usan en vez de comparar directo

### 4. dashboard-humano-v2/server.js — Endpoint
`GET /api/phone-map` (protegido por JWT) para que el frontend consulte el mapa.

### 5. dashboard-humano-v2/public/js/config.js — Display
Los números en la lista de admin-numbers muestran `+5491158647529` si hay mapeo disponible.

---

## 📂 Archivos Modificados

- `config/phone-map.json` — **creado**
- `lib/agent-manager.js` — mapeo automático en `handleIncomingMessage`
- `lib/admin-commands.js` — `resolverNumero()`, `esAdmin()`, `getRolAdmin()`
- `dashboard-humano-v2/server.js` — endpoint `/api/phone-map`
- `dashboard-humano-v2/public/js/config.js` — display del número legible

---

## 📊 Estado

| Componente | Antes | Después |
|---|---|---|
| admin-numbers | Solo match exacto | Match por lid o phone |
| phone-map.json | No existía | Auto-poblado |
| Dashboard | Mostraba @lid | Muestra +5491158647529 |

---

## 🚀 Commit

```bash
git add config/phone-map.json lib/agent-manager.js lib/admin-commands.js dashboard-humano-v2/server.js dashboard-humano-v2/public/js/config.js
git commit -m "feat(bot): Auto-map WhatsApp @lid to phone numbers for admin-numbers matching"
git push origin main
```

⚠️ No se hizo deploy a VPS por instrucción del usuario.

---

## 📝 Documentación GSD creada

- `.gsd/memory/decisions/phone-map-resolution.md` — Decision record
- `.gsd/memory/patterns/whatsapp-lid-vs-phone.md` — Actualizado con fix
- `.gsd/STATE.md` — Actualizado con resumen de sesión
- Este archivo — Journal entry

---

**Última actualización**: 2026-05-12
