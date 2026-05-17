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
- Botón "Actualizar ahora".
- Semáforo general, auditoría en memoria y controles PM2 server-side deshabilitados por defecto.

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
- `POST /api/agents/:id/actions`: ejecuta acción PM2 allowlisted si `DASHBOARD_MAESTRO_ENABLE_PM2_CONTROL=true`.

Los checks incluyen `status`, `checkedAt`, `lastSuccessfulCheck`, `error` y `lastError`. El último check exitoso se mantiene en memoria mientras el proceso del Maestro esté corriendo.

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
- `AGENTS_CONFIG_PATH`: path alternativo para leer agentes. Default `config/agents.json` del repo.
- `CLIENTS_DIR`: path alternativo para buscar futuros `clients/*/agents.json`. Default `multi-tenant/clients`.
- `CORS_ORIGIN`: origen permitido para Socket.IO. Default `*`.

## Seguridad

Las acciones PM2 están deshabilitadas por defecto. Para testing, habilitarlas explícitamente con `DASHBOARD_MAESTRO_ENABLE_PM2_CONTROL=true` y `DASHBOARD_MAESTRO_PM2_ENV=testing`. Antes de usarlo fuera de local/testing, definir `DASHBOARD_MAESTRO_USER` y `DASHBOARD_MAESTRO_PASS` con credenciales no default.
