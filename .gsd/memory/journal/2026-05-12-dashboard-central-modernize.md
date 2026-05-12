# Sesión: Modernizar Dashboard Central

**Fecha**: 2026-05-12  
**Duración**: ~10 min  
**Agente**: opencode  
**Usuario**: forma

---

## 🎯 Objetivos

1. Agregar autenticación básica HTTP al Dashboard Central
2. Actualizar link "Panel Humano" al nuevo dashboard-humano-v2
3. Mejorar cards de agentes deshabilitados
4. Agregar indicador de chats pendientes en cards activas

---

## ✅ Tareas Completadas

### 1. dashboard-central.js — HTTP Basic Auth
- Variables `DASHBOARD_CENTRAL_USER` / `DASHBOARD_CENTRAL_PASS` desde .env
- Middleware que pide auth para todo excepto assets estáticos (.css, .js, .png, etc.) y socket.io
- Retorna `401` con `WWW-Authenticate` si no hay credenciales

### 2. app.js — Panel Humano link
- Cambiado de `/human-panel/${agent.id}` a `http://${hostname}:${agent.ports.dashboard}`
- Ahora abre el dashboard-humano-v2 en el puerto configurado (3001 para santa-ana, 3002 para asturias)

### 3. app.js — Cards deshabilitados
- Muestra dirección, teléfono y un aviso "pendiente de activación" en vez de solo nombre+status

### 4. app.js + style.css — Chats pendientes
- Fetch a `/api/agents/:id/paused` en cards activas
- Si hay usuarios pausados, muestra alerta roja: "🔴 N chat(s) esperando atención humana"

---

## 📂 Archivos Modificados

| Archivo | Cambio |
|---|---|
| `dashboard-central.js` | HTTP Basic Auth middleware |
| `public-central/app.js` | Link panel humano, card deshabilitados, pending alert |
| `public-central/style.css` | `.pending-alert`, `.agent-note` |
| `.env.example` | `DASHBOARD_CENTRAL_USER/PASS` |

---

## 🚀 Commit

```bash
git add dashboard-central.js public-central/app.js public-central/style.css .env.example
git commit -m "feat(dashboard-central): Add auth, update human panel links, improve agent cards"
git push origin main
```

⚠️ Sin deploy a VPS.

---

**Última actualización**: 2026-05-12
