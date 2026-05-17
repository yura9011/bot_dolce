# Dashboard Maestro

App interna para monitorear agentes existentes sin reemplazar `dashboard-central.js`.

## Alcance de esta etapa

- Servidor Express + Socket.IO independiente.
- Acceso interno con HTTP Basic Auth.
- UI estática desktop-first.
- Endpoint propio `GET /health`.
- Adapter read-only que lee `config/agents.json`.
- Compatibilidad read-only con futuros `multi-tenant/clients/*/agents.json`.
- Tabla de agentes con id, nombre, enabled, puertos y paths.
- Health collection read-only para bot API y dashboard humano, visible en la tabla.
- Alertas visibles derivadas de health para bot API y dashboard humano caídos.
- Métricas read-only desde `estadisticas.json`: mensajes recibidos/enviados y handoffs.
- Handoffs pendientes read-only desde `pausas.json`, con alerta crítica si superan 10 minutos.
- Estado WhatsApp si el bot API lo expone en `/status`; si no, queda como `unknown`.
- Mute de mantenimiento por agente en memoria.
- Botón "Actualizar ahora".
- Semáforo general, auditoría en memoria, controles PM2 y backup-now server-side deshabilitados por defecto.

No implementa backup-now, restore desde UI, SQLite ni deploy a VPS.

## Instalación

Desde la raíz del repo ya existen `express` y `socket.io` como dependencias. Si se quiere instalar la app como paquete independiente:

```bash
cd multi-tenant/dashboard-maestro
npm install
```

## Cómo correr

Desde `multi-tenant/dashboard-maestro/`:

```bash
npm start
```

O con puerto custom:

```bash
DASHBOARD_MAESTRO_PORT=3050 npm start
```

En Windows PowerShell:

```powershell
$env:DASHBOARD_MAESTRO_PORT=3050; npm start
```

Default local: `http://localhost:3050`

Credenciales default para local:

- usuario: `admin`
- contraseña: `admin123`

## Endpoints

- `GET /health`: estado del Dashboard Maestro.
- `GET /api/agents`: lectura normalizada de `config/agents.json` con checks HTTP read-only.
- `GET /api/actions/config`: configuración visible de controles PM2.
- `GET /api/audit-events`: últimos eventos de auditoría en memoria.
- `GET /api/backups/config`: configuración visible de backup-now.
- `POST /api/agents/:id/actions`: ejecuta acción PM2 allowlisted si `DASHBOARD_MAESTRO_ENABLE_PM2_CONTROL=true`.
- `POST /api/backups/now`: ejecuta script de backup explícito si `DASHBOARD_MAESTRO_ENABLE_BACKUP_NOW=true`.

Los checks incluyen `status`, `checkedAt`, `lastSuccessfulCheck`, `error` y `lastError`. El último check exitoso se mantiene en memoria mientras el proceso del Maestro esté corriendo.

Las alertas actuales son derivadas de health collection y handoffs pendientes. Telegram queda para etapas posteriores.

Las métricas IA/costo quedan como `Sin datos` hasta instrumentar tokens, llamadas y precios.

## Variables

- `DASHBOARD_MAESTRO_PORT`: puerto HTTP. Default `3050`.
- `DASHBOARD_MAESTRO_USER`: usuario de HTTP Basic Auth. Default `admin`.
- `DASHBOARD_MAESTRO_PASS`: contraseña de HTTP Basic Auth. Default `admin123`.
- `DASHBOARD_MAESTRO_REFRESH_MS`: intervalo de refresh por WebSocket. Default `300000` ms.
- `DASHBOARD_MAESTRO_HEALTH_TIMEOUT_MS`: timeout por check HTTP. Default `2500` ms.
- `DASHBOARD_MAESTRO_ENABLE_PM2_CONTROL`: habilita acciones PM2 reales. Default deshabilitado.
- `DASHBOARD_MAESTRO_PM2_ENV`: sufijo de naming para PM2. Usar `testing` en `bot_testing`.
- `DASHBOARD_MAESTRO_PM2_BIN`: binario PM2. Default `pm2`.
- `DASHBOARD_MAESTRO_PM2_TIMEOUT_MS`: timeout por acción PM2. Default `15000` ms.
- `DASHBOARD_MAESTRO_ENABLE_BACKUP_NOW`: habilita backup-now real. Default deshabilitado.
- `DASHBOARD_MAESTRO_BACKUP_SCRIPT`: script de backup a ejecutar. Debe apuntar a testing, no a producción.
- `DASHBOARD_MAESTRO_BACKUP_TIMEOUT_MS`: timeout de backup-now. Default `120000` ms.
- `AGENTS_CONFIG_PATH`: path alternativo para leer agentes. Default `config/agents.json` del repo.
- `CLIENTS_DIR`: path alternativo para buscar futuros `clients/*/agents.json`. Default `multi-tenant/clients`.
- `CORS_ORIGIN`: origen permitido para Socket.IO. Default `*`.

## Seguridad

Las acciones PM2 y backup-now están deshabilitadas por defecto. Para testing, habilitarlas explícitamente con `DASHBOARD_MAESTRO_ENABLE_PM2_CONTROL=true`, `DASHBOARD_MAESTRO_PM2_ENV=testing`, `DASHBOARD_MAESTRO_ENABLE_BACKUP_NOW=true` y un `DASHBOARD_MAESTRO_BACKUP_SCRIPT` de testing. Antes de usarlo fuera de local/testing, definir `DASHBOARD_MAESTRO_USER` y `DASHBOARD_MAESTRO_PASS` con credenciales no default.
