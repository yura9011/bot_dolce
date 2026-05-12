# Sesión: Diferenciar Entorno de Testing del de Producción

**Fecha**: 2026-05-12  
**Duración**: ~15 min  
**Agente**: opencode  
**Usuario**: forma

---

## 🎯 Objetivos

1. Hacer AGENT_ID y DATA_PATH configurables por env en server.js
2. Agregar banner visual de testing en el frontend
3. Crear endpoint /api/env para que el frontend detecte el entorno
4. Separar datos de testing (data/testing/) de producción (data/santa-ana/)

---

## ✅ Tareas Completadas

### 1. server.js — Configuración por env

**Cambios**:
- `AGENT_ID` ahora usa `process.env.DASHBOARD_AGENT_ID || 'santa-ana'`
- `DATA_PATH` usa `../data/${AGENT_ID}` (dinámico)
- Nueva constante `IS_TESTING = process.env.NODE_ENV === 'development'`
- Log extra `⚠️ MODO TESTING ACTIVO` cuando corresponde
- Nuevo endpoint `GET /api/env` → `{ isTesting, agentId }`

### 2. index.html — Banner de testing

- Agregado `<div id="testingBanner">` oculto por defecto dentro del header

### 3. main.css — Estilos de testing

- `.testing-banner` — fondo naranja (#ff6b35), texto blanco, ancho completo
- `.dashboard.is-testing .header` — fondo oscuro (#1a1a2e), borde naranja
- `.dashboard.is-testing .header h1::after` — sufijo `[TEST]` en naranja

### 4. app.js — Detección de entorno

- En `init()`, fetch a `/api/env` y si `isTesting`, agrega clase `is-testing` y muestra banner

---

## 📂 Archivos Modificados

- `dashboard-humano-v2/server.js` — AGENT_ID/DATA_PATH dinámicos, endpoint /api/env, log testing
- `dashboard-humano-v2/public/index.html` — Banner de testing
- `dashboard-humano-v2/public/css/main.css` — Estilos testing
- `dashboard-humano-v2/public/js/app.js` — Detección de entorno

---

## 📊 Resultado Esperado

| URL | Header | Banner | Datos |
|-----|--------|--------|-------|
| http://2.24.89.243:3001 | Verde normal | No | data/santa-ana/ |
| http://2.24.89.243:4002 | Negro + [TEST] | ⚠️ ENTORNO DE TESTING | data/testing/ |

---

## 🚀 Deploy

```bash
git add dashboard-humano-v2/server.js dashboard-humano-v2/public/index.html dashboard-humano-v2/public/css/main.css dashboard-humano-v2/public/js/app.js
git commit -m "feat(dashboard): Add testing environment visual indicator and configurable agent ID"
git push origin main

# VPS testing
ssh forma@srv1658334.hstgr.cloud "mkdir -p /home/forma/bot_testing/data/testing && echo '{}' > /home/forma/bot_testing/data/testing/historial.json && echo '{}' > /home/forma/bot_testing/data/testing/pausas.json"
ssh forma@srv1658334.hstgr.cloud "cd /home/forma/bot_testing && git pull origin main"
ssh forma@srv1658334.hstgr.cloud "pm2 delete dashboard-humano-testing && NODE_ENV=development DASHBOARD_HUMANO_PORT=4002 DASHBOARD_AGENT_ID=testing pm2 start /home/forma/bot_testing/dashboard-humano-v2/server.js --name dashboard-humano-testing --cwd /home/forma/bot_testing/dashboard-humano-v2 && pm2 save"
```

---

**Última actualización**: 2026-05-12
