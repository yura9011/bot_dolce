# Session: Performance Bug Fixes

**Date:** 13/05/2026
**Context:** Producción — orchestrator.js consume 55% CPU constantemente

## Bugs Found & Fixed

### BUG 1: ECONNREFUSED ::1:3001 (IPv6)
- **Root cause:** Node resuelve "localhost" como IPv6 (::1) en VPS Linux, pero el dashboard-humano solo escucha en IPv4
- **Fix:** `localhost` → `127.0.0.1` en:
  - `lib/agent-manager.js` — `notificarDashboard()` (ya estaba fixeado en commit anterior)
  - `dashboard-humano-v2/server.js` — fetch al bot API (2 ocurrencias)
  - `routes/human-panel.js` — fetch al bot API y dashboard (3 ocurrencias)

### BUG 2: Chrome huérfano al reiniciar
- **Root cause:** PM2 restart mata Node pero no mata Chrome de Puppeteer. Al reiniciar, `client.initialize()` falla porque el browser ya está running, causando loop de reintentos agotando CPU.
- **Fix en `lib/agent-manager.js`:**
  1. Extraído `_createClient()` como método separado para poder recrear el cliente en el retry
  2. `initializeWhatsApp()` ahora tiene try/catch: si detecta "browser already running" / "target closed" / "EADDRINUSE", mata el Chrome huérfano con `pkill` y reintenta una vez
  3. Agregado `_setupSignalHandlers()` que captura SIGTERM/SIGINT → `client.destroy()` + `killOrphanChrome()` + `process.exit(0)`
  4. Agregada función helper `killOrphanChrome(sessionName)` que ejecuta `pkill -f` contra el session name y `.local-chromium`

## Files Changed
- `lib/agent-manager.js` (+59/-4)
- `dashboard-humano-v2/server.js` (+2/-2)
- `routes/human-panel.js` (+3/-3)

## Deploy
- `git push origin main` → GitHub
- VPS: `git stash` (admin-numbers.json local) → `git pull origin main` → `pm2 restart bot-dolce-prd`
- Verificado en VPS que los parches están aplicados (grep hostname, SIGTERM, _createClient, killOrphanChrome)

## Verification
- Últimos logs post-restart: "Agente iniciado correctamente", "Bot conectado y listo"
- Error logs previos muestran los errores antiguos (anteriores al fix)
- CPU debe bajar de ~55% a normal (~1-5%)
