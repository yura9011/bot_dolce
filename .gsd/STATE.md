# Project State

> Last updated: 14/05/2026

## Last Session Summary

Sesión de interrogación GSD (/interrógame). Se entrevistó al usuario sobre el plan de estabilización multi-agente.

### Problemas Detectados
- **`lib/admin-commands.js`**: Singleton global compartido + imports rotos de `control-manual.js`
- **`lib/agent-manager.js:903`**: `notificarDashboard()` función global ignora puerto por agente
- **`dashboard-humano-v2/server.js:245`**: `BOT_API_PORT` hardcodeado a 3011
- **Media handling**: imágenes, videos, docs ignorados en silencio
- **Emojis**: no manejados en flujo de menú

### Decisiones Tomadas
- `admin-commands.js` → factory pattern (`createAdminCommands`)
- `admin-numbers.json` → por agente en `data/{agentId}/`
- `notificarDashboard()` → método de instancia en AgentManager
- Dashboard se levanta automáticamente por agente vía orchestrator
- Pipeline: Local → Testing (VPS) → Producción (VPS)

### Próximo Paso
Ejecutar Fase 1.1: Refactor admin-commands.js
- **`lib/agent-manager.js`**: Extract `_createClient()`, add retry logic on Chrome orphan conflict, add `_setupSignalHandlers()` with SIGTERM/SIGINT graceful shutdown, add `killOrphanChrome()` helper
- **`dashboard-humano-v2/server.js`**: `localhost` → `127.0.0.1` (IPv4 explícito) en llamadas HTTP internas al bot API
- **`routes/human-panel.js`**: `localhost` → `127.0.0.1` (IPv4 explícito) en llamadas HTTP internas

### Sesión anterior
Dashboard Humano v2 — UX/UI improvements sprint.
- **`config.js`**: Toast notification system, custom confirm dialog, inline name editing, optimistic UI updates con rollback, spinners de carga, feedback inline en modal (sin alert/confirm)
- **`config.css`**: Toast, confirm-dialog, inline-edit, spinner, form-feedback, btn-danger, stat cards, responsive tabs
- **`main.css`**: Hamburger menu toggle, sidebar absolute overlay con backdrop (mobile), breakpoints 767/768/1024, header text ellipsis en mobile
- **`chat-list.css`**: `min-width: 0` para sidebar, dispatchEvent `chatSelected` para auto-close sidebar en mobile
- **`conversation.css`**: Min 44px touch targets, responsive message width (85% mobile), input/buttons full-width en mobile
- **`app.js`**: Stats tab handler, sidebar toggle/close functions, auto-close sidebar on chat select, responsive tab switching
- **`stats.js`** (nuevo): LoadStats con cómputo de conversaciones hoy, esperando humano, bot activo, tiempo de respuesta promedio (sample 8 chats)
- **`index.html`**: Hamburger button, stats tab + containers, sidebar backdrop, stats.js script tag
- **`scripts/backup.sh`**: Backup diario por agente (historial, pausas, stats, config), comprime en .tar.gz, limpia backups >30 días
- **`scripts/rotate-logs.sh`**: Rota bot.log y security.log si superan 10MB, mantiene 5 versiones
- **`scripts/setup-cron.sh`**: Instala cron jobs (backup 3AM, rotate 2AM) sin duplicar

### Sesión anterior
Dashboard Central mejorado con indicadores en tiempo real.
- **`dashboard-central.js`**: `pausedCount` agregado a payloads WebSocket (initial + update)
- **`public-central/app.js`**: `updateAgentCard` actualiza pending-alert y botón Panel Humano en vivo; barra de estado del sistema con bots online y pendientes
- **`public-central/index.html`**: Barra `.system-status` debajo del header
- **`public-central/style.css`**: `.btn-danger` con animación pulse, `.system-status` barra oscura

### Sesión anterior
Scripts bash para deploy en VPS Ubuntu.
- **`scripts/sync-testing.sh`**: Resetea `bot_testing` al `origin/main`, preserva data/logs/auth y archivos runtime (admin-numbers, phone-map), reinstala deps, reinicia servicios PM2
- **`scripts/deploy-production.sh`**: `git pull` en `bot_dolce`, instala deps (root + dashboard-humano-v2), reinicia servicios PM2 de producción

### Sesión anterior
Script interactivo `add-client.js` para onboarding de nuevos clientes en < 5 minutos.
- **`scripts/add-client.js`**: Pregunta nombre/dirección/teléfono/horario/usuario/contraseña, asigna puertos sin conflicto, genera hash bcrypt, crea directorios + archivos de datos, agrega a agents.json (disabled por defecto)
- **`package.json`**: Script `npm run add-client`, dependencia `bcrypt` agregada
- **`README.md`**: Sección "Agregar Nuevo Cliente" simplificada apuntando a `npm run add-client`

### Sesión anterior
Modernización del Dashboard Central (puerto 3000/4000).
- **`dashboard-central.js`**: HTTP Basic Auth (configurable via .env), permite estáticos y socket.io sin auth
- **`public-central/app.js`**: "Panel Humano" abre el dashboard-humano-v2 en el puerto correcto del agente; card deshabilitados muestra info + aviso; card activos muestra alerta roja si hay chats esperando
- **`public-central/style.css`**: `.pending-alert` (rojo) y `.agent-note` (amarillo) agregados
- **`.env.example`**: Variables `DASHBOARD_CENTRAL_USER` y `DASHBOARD_CENTRAL_PASS`

### Sesión anterior
Fix botones 🔄 y ❌ en Config + búsqueda de chats.
- **`config.js`**: `onclick` inline reemplazado por `data-action` + event delegation; logs de debug en `toggleRole`/`deleteNumber`
- **`chat-list.js`**: Input `#searchInput` ahora filtra chats por nombre/preview en tiempo real

### Sesión anterior
Fix notificaciones sonoras: Web Audio API reemplazada por archivo WAV real.
- **`scripts/generate-notification-sound.js`**: Script que genera un sine wave beep (800Hz, 0.25s) como WAV
- **`public/assets/sounds/notification.wav`**: Archivo de sonido generado (21.5KB)
- **`index.html`**: Referencia actualizada de `.mp3` a `.wav`
- **`notifications.js`**: Simplificado — usa `<audio>` element en vez de AudioContext; "unlock" en primer click

### Sesión anterior
Agente "asturias" agregado al sistema multi-tenant.
- **`config/agents.json`**: `local-2` (disabled) reemplazado por `asturias` (enabled, puerto API 3012, dashboard 3002)
- **`data/asturias/`**: Directorio con `historial.json`, `pausas.json`, `.gitkeep`
- **`logs/asturias/`**: Directorio con `.gitkeep`
- **`scripts/start-dashboard-asturias.sh`**: Script de inicio producción (pm2)
- **`scripts/start-dashboard-asturias-testing.sh`**: Script de inicio testing (puerto 4003)
- **`dashboard-humano-v2/server.js`**: `CONFIG_AGENT_ID` ahora lee de env var `process.env.CONFIG_AGENT_ID || AGENT_ID`

### Sesiones anteriores
- WhatsApp @lid → mapeo automático a número de teléfono
- Notificaciones en tiempo real + sonido para dashboard-humano-v2

## Project Status

**Phase:** Producción (Dashboard Humano v2)
**Architecture:** Cliente-Servidor (Express + Socket.IO)
**Deployment:** VPS (srv1658334.hstgr.cloud) con PM2

## Key Metrics

- **Dashboards:** 2 (Dashboard Humano :3001, Dashboard Central :3000)
- **Frontend:** HTML + CSS + Vanilla JS (sin frameworks)
- **Backend:** Express + Socket.IO + JWT
- **Auth:** Cookies httpOnly + bcrypt + rate limiting
- **Bot Deployments:** 2 (PRD + DEV en VPS)

## Recent Changes

- ✅ Testing environment diferenciado visualmente (header negro + banner naranja + [TEST])
- ✅ AGENT_ID y DATA_PATH configurables por env var
- ✅ Fix envío de mensajes (escritura directa a historial.json, sin depender de bot API)
- ✅ WebSocket tiempo real (bot notifica dashboard via HTTP local)
- ✅ Dashboard fixes (conversation.js debug, config.js bug, server.js preview)
- ✅ Dashboard Admin Management deployado (CRUD números admin)
- ✅ Multi-tenant Phase 1 completado (estructura + templates)
- ✅ Dashboard Humano v2 con login y autenticación
- ✅ Dual environment (PRD + DEV) configurado en VPS
- ✅ Sistema de números ignorados para admins
- ✅ Notificaciones sonoras vía Web Audio API (sin archivo .mp3)
- ✅ AudioContext inicializado en primer gesto del usuario (fix autoplay)
- ✅ Mapa automático @lid → teléfono para resolución de admin-numbers
- ✅ Agente asturias agregado al sistema multi-tenant
- ✅ Notificación sonora con WAV real en vez de Web Audio API
- ✅ Fix botones Config con event delegation + búsqueda de chats
- ✅ Dashboard Central con auth básica + cards mejoradas + link a dashboard-humano
- ✅ Script interactivo add-client.js para onboarding de nuevos clientes
- ✅ Scripts bash sync-testing.sh y deploy-production.sh para VPS
- ✅ Dashboard Central con indicador de chats pendientes en tiempo real + barra de estado
- ✅ Scripts backup.sh, rotate-logs.sh, setup-cron.sh para VPS
- ✅ Config.js UX overhaul: toast, confirm dialog, inline edit, optimistic UI, loading states
- ✅ Responsive dashboard: sidebar overlay on mobile, hamburger menu, 44px touch targets
- ✅ Stats tab: daily conversation metrics, avg response time
- ✅ Bug fix: IPv4 explícito (127.0.0.1) en llamadas HTTP internas para evitar ECONNREFUSED ::1
- ✅ Bug fix: Graceful shutdown (SIGTERM/SIGINT) + retry automático en Chrome huérfano

## Next Steps

1. **Multi-Tenant Fase 2** — Dashboard Maestro

## Known Issues

- Sin tests automatizados
- Cache de navegador requiere versioning en assets CSS (`?v=N`)
- Stats: tiempo promedio calculado solo sobre últimos 8 chats (puede no ser representativo con muchos chats)

## Documentation Files

- `.gsd/STATE.md` — Project state (this file)
- `.gsd/ARCHITECTURE.md` — System design and component documentation
- `.gsd/STACK.md` — Technology inventory and dependencies
- `.gsd/memory/journal/` — Session journals
- `.gsd/milestones/` — Milestone documentation
- `.gsd/state/IMPLEMENTATION_PLAN.md` — Dynamic task tracker
