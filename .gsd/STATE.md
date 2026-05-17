# Project State

> Last updated: 17/05/2026

## Last Session Summary

Sesión deploy demo-local: se agregó instancia demo en bot_testing (VPS) para clientes potenciales.

El objetivo activo del proyecto sigue siendo Multi-Tenant Fase 2: Dashboard Maestro MVP. `demo-local` fue una tarea operativa paralela para demos comerciales 24/7 en testing y no reemplaza el trabajo del Maestro.

### Cambios Realizados
- **`config/agents.json`**: Nuevo agente `demo-local` (puertos API 5010, dashboard 5011), sin catálogo, admin solo si se configura
- **`flujos.js`**: `getMensajeBienvenida()` parametrizada con `agentInfo` opcional — si no se pasa usa valores hardcodeados actuales (compatible con Santa Ana/Asturias)
- **`lib/agent-manager.js`**: Pasa `this.config.info` al llamar a `getMensajeBienvenida()`
- **`dashboard-humano-v2/server.js`**: Fix `express.static('public')` → usa `path.join(__dirname, 'public')` (ruta absoluta) para que funcione cuando el dashboard es lanzado como hijo del orquestador

### Deploy en VPS
- `bot_testing` corriendo en PM2 como `bot-demo-local`
- Dashboard accesible en `http://2.24.89.243:5011`
- Número WhatsApp: 11 7145-8944
- Sesión aislada: `.wwebjs_auth_testing/demo-session/`
- Catalog: no tiene (demo de sistema, no de cotillón)

### Para agregar un nuevo agente demo en el futuro
1. Agregar entrada en `config/agents.json`
2. Crear directorio `data/{agent-id}/` y `logs/{agent-id}/` (se crean solos al iniciar)
3. Para que no herede admins del `.env`, crear `data/{agent-id}/admin-numbers.json` con `{"admins":[]}`
4. En VPS: `git pull`, crear PM2, escanear QR

## Dashboard Maestro Current Status

Estado verificado en testing VPS el 2026-05-17:

- `bot_testing` actualizado a `76d9513`.
- PM2 `dashboard-maestro-testing` online.
- Puerto interno: `4050`.
- CWD: `/home/forma/bot_testing/multi-tenant/dashboard-maestro`.
- `/health` responde OK por `127.0.0.1:4050`.
- `/api/agents` responde OK con auth.
- `config/agents.override.json` aplica puertos testing:
  - `santa-ana`: API `4011`, dashboard `4001`.
  - `asturias`: API `4012`, dashboard `4003`.
- Última verificación: overall `ok`, alerts `0`, ambos bots `up`, ambos dashboards `up`.

Pendientes inmediatos:

1. Decidir exposición externa: abrir puerto 4050, proxy reverso o seguir con túnel SSH para MVP.
2. Probar UI completa vía túnel: `ssh -L 4050:127.0.0.1:4050 forma@srv1658334.hstgr.cloud` y abrir `http://localhost:4050`.
3. Antes de habilitar PM2 control real, verificar nombres PM2 reales y mantenerlo solo en testing.
4. Crear script de backup específico para testing antes de habilitar backup-now. No usar `scripts/backup.sh` tal cual porque apunta a `/home/forma/bot_dolce`.

Avance local posterior:

- Verificación read-only por SSH confirmó Maestro OK en loopback y controles reales deshabilitados.
- PM2 testing real usa nombres históricos; Dashboard Maestro debe mapearlos con `processOverrides` en `config/agents.override.json`.
- Se preparó `scripts/backup-testing.sh` para backup-now de `bot_testing`; no está habilitado en VPS.

## Last Session Summary (anterior)

Sesión `/interrógame` sobre la evolución multi-tenant y el Dashboard Maestro.

### Decisiones Tomadas
- Multi-tenant significa multi-cliente: `Cliente -> Agente/Local -> WhatsApp session + data + dashboard humano`.
- El Dashboard Maestro se construye como app nueva en `multi-tenant/dashboard-maestro/`.
- El Dashboard Maestro reemplazará eventualmente a `dashboard-central.js`, pero solo después de pruebas y aprobación.
- Producción actual (`bot_dolce` en VPS) queda estable; no migrar durante el MVP.
- Testing VPS (`bot_testing`) es el laboratorio para Dashboard Maestro.
- Santa Ana producción atiende clientes reales; sus datos runtime son intocables sin backup explícito.
- Asturias puede onboardearse con el sistema multi-agente actual si hace falta esta semana.
- JSON se mantiene por ahora; SQLite queda postergado para una fase posterior.
- Futuro recomendado: SQLite por agente/local y base compartida solo para monitoreo.
- Dashboard Maestro es interno para owner/socio; clientes no acceden al Maestro.
- Cliente/empleado accede por agente/local. Dashboard cliente multi-agente queda diferido.
- Backups diarios en VPS con retención default de 30 días; incluir `.wwebjs_auth/`.
- Restore desde UI queda fuera del MVP; restauración manual por SSH.
- Alertas: dashboard primero, Telegram como primer canal externo, email y WhatsApp después.
- Refresh del Maestro: cada 5 minutos + botón "actualizar ahora".
- Acciones críticas: confirmación simple + auditoría + feedback visible.

### Documentación Actualizada
- `AGENTS.md`: reglas operativas para agentes de código.
- `.gsd/milestones/multi-tenant-architecture/README.md`: índice vigente del milestone.
- `.gsd/milestones/multi-tenant-architecture/CURRENT_DECISIONS.md`: decisiones actuales.
- `.gsd/milestones/multi-tenant-architecture/DASHBOARD_MAESTRO_MVP.md`: alcance MVP.
- `.gsd/milestones/multi-tenant-architecture/PHASE_2_PLAN.md`: plan de implementación.
- Documentos viejos de planificación multi-tenant archivados en `.gsd/milestones/multi-tenant-architecture/archive/2026-05-10-planning/`.

### Próximo Paso
Implementar Dashboard Maestro MVP como app nueva, empezando por skeleton + lectura de agentes + health collection en testing.

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

### Lo Completado
1. **Fase 1.1** ✅ `admin-commands.js` → factory pattern (fix imports rotos)
2. **Fase 1.2** ✅ `admin-numbers.json` → por agente en `data/{agentId}/`
3. **Fase 1.3** ✅ `notificarDashboard()` → método de instancia
4. **Fase 1.4** ✅ `BOT_API_PORT` → dinámico desde agents.json
5. **Fase 2.1** ✅ Orchestrator auto-levanta dashboard por agente
6. **Fase 3.1** ✅ Respuestas explícitas para imágenes, video, documento, sticker, location
7. **Fase 3.2** ✅ Manejo de emojis en estados de menú
8. **Fase 4.1-4.3** ✅ Asturias habilitado, admin numbers configurados

### Commits (9 total)
- `9aed38d` factory pattern admin-commands
- `d443156` admin-numbers per-agent
- `09ada5e` notificarDashboard instance method
- `ac9c8d5` BOT_API_PORT dinámico
- `0140953` orchestrator auto-dashboard
- `35ef746` media handling explícito
- `3a2bf3a` emoji handling en menú
- `bd76763` onboarding Asturias
- Various docs updates

### Próximo Paso
Fase 5: Testing pipeline (Local → Testing VPS → Producción VPS)
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

1. **Multi-Tenant Fase 2** — Dashboard Maestro MVP como app nueva en `multi-tenant/dashboard-maestro/`

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
