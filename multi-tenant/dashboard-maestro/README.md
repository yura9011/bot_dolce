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

Credenciales default para local:

- usuario: `admin`
- contraseña: `admin123`

## Endpoints

- `GET /health`: estado del Dashboard Maestro.
- `GET /api/agents`: lectura normalizada de `config/agents.json` con checks HTTP read-only.

Los checks incluyen `status`, `checkedAt`, `lastSuccessfulCheck`, `error` y `lastError`. El último check exitoso se mantiene en memoria mientras el proceso del Maestro esté corriendo.

## Variables

- `DASHBOARD_MAESTRO_PORT`: puerto HTTP. Default `3050`.
- `DASHBOARD_MAESTRO_USER`: usuario de HTTP Basic Auth. Default `admin`.
- `DASHBOARD_MAESTRO_PASS`: contraseña de HTTP Basic Auth. Default `admin123`.
- `DASHBOARD_MAESTRO_REFRESH_MS`: intervalo de refresh por WebSocket. Default `300000` ms.
- `DASHBOARD_MAESTRO_HEALTH_TIMEOUT_MS`: timeout por check HTTP. Default `2500` ms.
- `AGENTS_CONFIG_PATH`: path alternativo para leer agentes. Default `config/agents.json` del repo.
- `CLIENTS_DIR`: path alternativo para buscar futuros `clients/*/agents.json`. Default `multi-tenant/clients`.
- `CORS_ORIGIN`: origen permitido para Socket.IO. Default `*`.

## Seguridad

Esta etapa solo lee configuración y no ejecuta acciones. Antes de usarlo fuera de local/testing, definir `DASHBOARD_MAESTRO_USER` y `DASHBOARD_MAESTRO_PASS` con credenciales no default.
