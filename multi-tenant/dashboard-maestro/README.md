# Dashboard Maestro

App interna para monitorear agentes existentes sin reemplazar `dashboard-central.js`.

## Alcance de esta etapa

- Servidor Express + Socket.IO independiente.
- UI estática desktop-first.
- Endpoint propio `GET /health`.
- Adapter read-only que lee `config/agents.json`.
- Tabla de agentes con id, nombre, enabled, puertos y paths.
- Health collection read-only para bot API y dashboard humano.
- Botón "Actualizar ahora".
- Espacios reservados para semáforo general, alertas y acciones.

No implementa PM2 control, backup-now, restore desde UI, SQLite ni deploy a VPS.

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

## Endpoints

- `GET /health`: estado del Dashboard Maestro.
- `GET /api/agents`: lectura normalizada de `config/agents.json` con checks HTTP read-only.

## Variables

- `DASHBOARD_MAESTRO_PORT`: puerto HTTP. Default `3050`.
- `DASHBOARD_MAESTRO_REFRESH_MS`: intervalo de refresh por WebSocket. Default `300000` ms.
- `DASHBOARD_MAESTRO_HEALTH_TIMEOUT_MS`: timeout por check HTTP. Default `2500` ms.
- `AGENTS_CONFIG_PATH`: path alternativo para leer agentes. Default `config/agents.json` del repo.
- `CORS_ORIGIN`: origen permitido para Socket.IO. Default `*`.

## Seguridad

Esta primera etapa solo lee configuración y no ejecuta acciones. Antes de usarlo fuera de local/testing, agregar acceso interno autenticado según el plan del MVP.
