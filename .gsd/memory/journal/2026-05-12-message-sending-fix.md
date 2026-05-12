# Sesión: Fix Envío de Mensajes + WebSocket Tiempo Real

**Fecha**: 2026-05-12  
**Duración**: ~30 min  
**Agente**: opencode  
**Usuario**: forma

---

## 🎯 Objetivos

1. Arreglar envío de mensajes desde dashboard (fallaba porque bot no tiene endpoint HTTP)
2. Arreglar botón "MUCHAS GRACIAS" (misma causa)
3. Agregar notificaciones en tiempo real cuando el bot recibe un mensaje nuevo
4. Limpiar console.logs de debug de la sesión anterior

---

## ✅ Tareas Completadas

### 1. Fix: Envío de mensajes — server.js (CRÍTICO)

**Problema**: `POST /api/chats/:userId/message` intentaba `fetch('http://localhost:3011/send-message')`, pero ese endpoint no existe en el bot.

**Solución**: El dashboard ahora escribe directamente en `historial.json` con `role: 'human'`, igual que hace el bot.

**Archivo**: `dashboard-humano-v2/server.js`

### 2. Fix: Botón "MUCHAS GRACIAS" — server.js (CRÍTICO)

**Problema**: Misma causa — intentaba llamar al bot API inexistente.

**Solución**: 
- Reactiva el usuario en `pausas.json` (setea `pausado: false`)
- Guarda "MUCHAS GRACIAS" en `historial.json`
- Eliminada variable `BOT_API_URL` huérfana

**Archivo**: `dashboard-humano-v2/server.js`

### 3. Feature: Notificaciones en tiempo real (IMPORTANTE)

**Problema**: El dashboard usaba polling cada 3s, pero no sabía cuándo llegaba un mensaje nuevo al bot.

**Solución**:
- Nuevo endpoint interno `POST /api/internal/new-message` en server.js que recibe notificaciones del bot y las reemite via Socket.IO
- Función `notificarDashboard(userId)` en agent-manager.js que hace POST a `localhost:{DASHBOARD_HUMANO_PORT}/api/internal/new-message`
- Llamada después de cada `guardarEnHistorial` (tanto al recibir mensaje de usuario como al responder el bot)
- `websocket.js` ya tenía el handler `socket.on('new_message')` que recarga mensajes si es el chat activo y reproduce notificación sonora

**Archivos**: `dashboard-humano-v2/server.js`, `lib/agent-manager.js`, `multi-tenant/templates/bot-template/bot/lib/agent-manager.js`

### 4. Cleanup: Debug logs

**Problema**: Console.logs de debug de la sesión anterior ensuciaban la consola.

**Solución**: Removidos logs de `loadMessages()` en conversation.js.

**Archivo**: `dashboard-humano-v2/public/js/conversation.js`

---

## 🧪 Tests Realizados

| Test | Resultado |
|------|-----------|
| POST message sin llamada externa | ✅ Escribe directo a historial.json |
| POST finish reactiva pausa | ✅ pausas.json + historial.json |
| Sin variable BOT_API_URL huérfana | ✅ Eliminada |
| notificarDashboard existe en agent-manager | ✅ 2 ubicaciones |
| new_message endpoint en server.js | ✅ Creado |
| conversation.js sin debug logs | ✅ Limpio |
| Template multi-tenant actualizada | ✅ agent-manager.js |

---

## 📂 Archivos Modificados

**dashboard-humano-v2/:**
- `server.js` — Fix message/finish endpoints, endpoint interno, BOT_API_URL eliminada
- `public/js/conversation.js` — Limpieza debug logs

**Bot:**
- `lib/agent-manager.js` — `require(http)`, función `notificarDashboard()`, llamadas post-guardar

**Templates:**
- `multi-tenant/templates/bot-template/bot/lib/agent-manager.js` — Mismos cambios

---

## 📊 Estado Actual

```
Dashboard (http://2.24.89.243:3001):
├── Login ✅
├── Lista chats ✅
├── Ver mensajes ✅
├── Enviar mensajes ✅ (ahora escribe directo a historial.json)
├── Botón MUCHAS GRACIAS ✅ (reactiva pausa + guarda en historial)
├── Config números admin ✅
├── Tiempo real:
│   ├── Bot notifica al dashboard via HTTP local ✅
│   └── Dashboard reemite via Socket.IO ✅
└── CSS proporcional ✅
```

---

## 📋 Pendiente

- [ ] Deploy a VPS: `git push` → `ssh ... git pull && pm2 restart`
- [ ] Verificar en producción (enviar mensaje, ver que aparece)
- [ ] Notificaciones sonoras (frontend ya tiene `playNotification()`)

---

**Última actualización**: 2026-05-12  
**Próxima sesión**: Deploy y verificación en producción
