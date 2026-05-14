# Bot de WhatsApp Multi-Agente - Dolce Party

Sistema de atencion automatizada por WhatsApp para multiples locales de cotillon, con gestion centralizada y dashboard en tiempo real.

## Requisitos

- Node.js 16+
- WhatsApp Business Account
- API Keys: Gemini y/o OpenRouter

## Instalacion

```bash
git clone https://github.com/yura9011/bot_dolce.git
cd bot_dolce
npm install
cp .env.example .env
```

Editar `.env` con las API keys correspondientes.

## Configuracion

### Variables de Entorno (.env)

```
GEMINI_API_KEY=tu_api_key_aqui
OPENROUTER_API_KEY=tu_api_key_aqui
ADMIN_NUMBERS=5491158647529,5493513782559
DASHBOARD_CENTRAL_PORT=3000
```

### Agentes (config/agents.json)

```json
{
  "agents": [
    {
      "id": "santa-ana",
      "name": "Dolce Party - Santa Ana",
      "enabled": true,
      "ports": { "api": 3011 },
      "info": {
        "nombre": "Dolce Party - Santa Ana",
        "telefono": "0351 855-9145",
        "direccion": "Sta. Ana 2637, Cordoba"
      }
    }
  ]
}
```

## Uso

### Iniciar Sistema Multi-Agente

```bash
node orchestrator.js list
node orchestrator.js start santa-ana
node orchestrator.js start
node orchestrator.js stop santa-ana
```

### Iniciar Dashboard Centralizado

```bash
node dashboard-central.js
```

Abrir en navegador: http://localhost:3000

### Scripts Disponibles

```bash
# Windows (.bat)
scripts/list-agents.bat
scripts/start-agent.bat santa-ana
scripts/start-dashboard-central.bat

# npm
npm run orchestrator:list
npm run orchestrator:start
npm run dashboard:central
```

## Arquitectura

```
orchestrator.js
+-- Agent Manager (santa-ana) - Puerto 3011
|   +-- WhatsApp Client
|   +-- API REST
|   +-- Catalogo de Productos
|   +-- Estadisticas (data/santa-ana/)
|   +-- Logs (logs/santa-ana/)
|
+-- Agent Manager (asturias) - Puerto 3012
    +-- (misma estructura)

dashboard-central.js - Puerto 3000
+-- Interfaz unificada con WebSocket
```

Cada agente levanta automaticamente su propio dashboard humano en el puerto configurado (`ports.dashboard`).

## Estructura del Proyecto

```
bot_dolce/
+-- config/
|   +-- agents.json           # Configuracion de agentes
+-- lib/
|   +-- agent-manager.js      # Clase para gestionar cada agente
|   +-- llm.js                # Integracion con Gemini/OpenRouter
|   +-- statistics.js         # Sistema de estadisticas
|   +-- security.js           # Anti-hijacking
|   +-- admin-commands.js     # Comandos administrativos
|   +-- control-manual.js     # Sistema de pausas
+-- catalogs/
|   +-- catalogo-santa-ana.js # Catalogo de productos por agente
+-- data/
|   +-- santa-ana/            # Datos por agente
|   +-- asturias/
+-- logs/
|   +-- santa-ana/            # Logs por agente
|   +-- asturias/
+-- public-central/           # Frontend del dashboard central
+-- dashboard-humano-v2/      # Dashboard humano (Express + Socket.IO)
+-- scripts/                  # Scripts de gestion
+-- orchestrator.js           # Orquestador de agentes
+-- dashboard-central.js      # Dashboard centralizado
+-- bot.js                    # Bot monolitico (legacy)
```

## Dashboard Centralizado

- Vista de todos los agentes (estado, estadisticas)
- Conversaciones en tiempo real
- Logs del sistema y seguridad
- Control de pausas (global y por usuario)
- Estadisticas detalladas
- Actualizaciones automaticas via WebSocket

## Comandos Administrativos (WhatsApp)

Los numeros configurados como admin pueden usar:

```
PAUSAR BOT GLOBAL          - Pausa el bot completamente
REANUDAR BOT GLOBAL        - Reactiva el bot
ESTADO BOT                 - Ver estado actual
PAUSAR [numero]            - Pausar usuario especifico
REANUDAR [numero]          - Reanudar usuario especifico
LISTAR PAUSADOS            - Ver usuarios pausados
```

## Flujos de Conversacion

1. Bienvenida: captura nombre del usuario
2. Menu Principal: realizar pedido / entrega y recepcion de envios
3. Pedidos: busqueda inteligente en catalogo con IA (RAG)
4. Paqueteria: informacion sobre Correo Argentino, Andreani, Mercado Libre

## Sistema de Fallback LLM

```
Gemini 2.5-flash (principal)
    + (si falla)
Gemini 1.5-flash
    + (si falla, 3 reintentos)
OpenRouter - Ling 2.6-flash
    + (si falla)
OpenRouter - Gemma 4
```

## Agregar Nuevo Cliente

```bash
npm run add-client
```

Sigue las instrucciones interactivas. El cliente queda deshabilitado hasta activarlo manualmente.

Para activar:
1. Editar `config/agents.json` -> `"enabled": true`
2. `git push` -> `git pull` en VPS -> `pm2 restart bot-dolce-prd`
3. Escanear QR: `pm2 logs bot-dolce-prd`
4. Abrir dashboard en `http://VPS_IP:{dashboard_port}`

## Troubleshooting

### QR no aparece
```
scripts/limpiar-sesion.bat
node orchestrator.js start santa-ana
```

### Dashboard vacio
- Verificar agente activo: `node orchestrator.js list`
- Verificar consola del navegador (F12)
- Verificar que el puerto del agente este disponible

### API key invalida
- El sistema usa OpenRouter como fallback automatico
- Verificar `OPENROUTER_API_KEY` en `.env`

## Documentacion

- `docs/arquitectura/` - Documentacion tecnica
- `docs/guias/` - Guias de uso
- `docs/implementaciones/` - Detalles de implementacion
- `docs/README-MULTI-AGENTE.md` - Guia del sistema multi-agente

## Licencia

Privado - Dolce Party

## Contacto

- GitHub: https://github.com/yura9011/bot_dolce
- Desarrollado para: Dolce Party - Cotillon
