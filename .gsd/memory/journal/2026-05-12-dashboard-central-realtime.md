# Sesión: Dashboard Central — indicadores en tiempo real

**Fecha**: 2026-05-12  
**Duración**: ~10 min  
**Agente**: opencode  
**Usuario**: forma

---

## 🎯 Objetivos

1. Actualizar indicador de chats pendientes vía WebSocket (sin recargar)
2. Botón Panel Humano rojo con pulse cuando hay pendientes
3. Barra de estado del sistema en el header

---

## ✅ Tareas Completadas

### 1. dashboard-central.js
- `pausedCount` calculado y emitido en `agent_${id}_initial` y `agent_${id}_update`

### 2. app.js — updateAgentCard
- Lee `data.pausedCount` y actualiza `.pending-alert` (crea/actualiza/remueve)
- Cambia clase del botón Panel Humano entre `btn-warning` y `btn-danger`
- Texto cambia a `🔴 Atender (N)` cuando hay pendientes
- Guarda `dataset.pausedCount` y llama `updateSystemStatus()`

### 3. index.html
- Barra `.system-status` con `#statusBots` y `#statusPending`

### 4. style.css
- `.btn-danger` con animación `btnPulse` (opacity 1→0.7→1)
- `.system-status` fondo oscuro (#1a1a2e)

---

## 📂 Archivos Modificados

| Archivo | Cambio |
|---|---|
| `dashboard-central.js` | `pausedCount` en payloads WebSocket |
| `public-central/app.js` | `updateAgentCard` + `updateSystemStatus` |
| `public-central/index.html` | Barra system-status |
| `public-central/style.css` | `.btn-danger`, `.system-status` |

---

## 🚀 Commit

```bash
git add dashboard-central.js public-central/
git commit -m "feat(dashboard-central): Real-time pending chats indicator, pulse button, system status bar"
git push origin main
```

⚠️ Sin deploy a VPS.

---

**Última actualización**: 2026-05-12
