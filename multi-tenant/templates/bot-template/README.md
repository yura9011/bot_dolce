# WhatsApp Bot Template

Este es el template base para crear nuevos clientes.

## Placeholders

Los siguientes valores deben ser reemplazados al crear un cliente:

- `{{CLIENT_ID}}` - ID único del cliente (ej: "dolce-party")
- `{{CLIENT_NAME}}` - Nombre del cliente (ej: "Dolce Party")
- `{{LOCATION_ID}}` - ID del local (ej: "santa-ana")
- `{{PORT}}` - Puerto asignado al bot
- `{{DASHBOARD_PORT}}` - Puerto del dashboard cliente
- `{{BOT_PORTS}}` - Lista de puertos de bots
- `{{BUSINESS_NAME}}` - Nombre del negocio
- `{{BUSINESS_PHONE}}` - Teléfono del negocio
- `{{BUSINESS_ADDRESS}}` - Dirección del negocio
- `{{BUSINESS_HOURS}}` - Horario de atención
- `{{GEMINI_API_KEY}}` - API key de Gemini
- `{{OPENROUTER_API_KEY}}` - API key de OpenRouter
- `{{SYSTEM_PROMPT}}` - Prompt del sistema

## Estructura

```
bot-template/
├── bot/                    # Código del bot
│   ├── agent.js
│   ├── orchestrator.js
│   ├── lib/                # Utilidades y lógica central
│   └── flujos.js           # Definición de flujos
├── catalogs/               # Catálogos de productos
│   └── catalogo.template.js
├── data/                   # Bases de datos (vacío)
├── logs/                   # Logs (vacío)
├── .wwebjs_auth/          # Sesión WhatsApp (vacío)
├── .env.template          # Variables de entorno
├── config.template.json   # Configuración del cliente
└── package.json           # Dependencias
```

## Uso

No usar directamente. Usar el script `add-client.sh` para crear clientes.
