# Bot de WhatsApp Multi-Agente - Dolce Party

> **🤖 PARA AGENTES DE IA**: Antes de hacer cualquier cambio, leé [`HANDOFF.md`](./HANDOFF.md) y después `.gsd/state/IMPLEMENTATION_PLAN.md`. No empieces a codificar sin contexto.

Sistema de atención automatizada por WhatsApp para múltiples locales de cotillón, con gestión centralizada y dashboard en tiempo real.

## Características

- **Multi-Agente**: Gestiona múltiples locales desde un solo sistema
- **Dashboard Centralizado**: Monitoreo en tiempo real con WebSocket
- **IA Conversacional**: Integración con Gemini y OpenRouter como fallback
- **RAG (Retrieval-Augmented Generation)**: Búsqueda inteligente en catálogo de productos
- **Anti-Hijacking**: Sistema de seguridad contra intentos de manipulación
- **Control Manual**: Sistema de pausas y handoff a operadores humanos
- **Estadísticas**: Métricas detalladas por agente y en tiempo real

## Requisitos

- Node.js 16+
- WhatsApp Business Account
- API Keys: Gemini y/o OpenRouter

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/yura9011/bot_dolce.git
cd bot_dolce

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus API keys
```

## Configuración

### 1. Variables de Entorno (.env)

```env
# API Keys
GEMINI_API_KEY=tu_api_key_aqui
OPENROUTER_API_KEY=tu_api_key_aqui

# Números Admin (separados por coma)
ADMIN_NUMBERS=5491158647529,5493513782559

# Puertos (opcional)
DASHBOARD_CENTRAL_PORT=3000
```

### 2. Configurar Agentes (config/agents.json)

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
        "direccion": "Sta. Ana 2637, Córdoba"
      }
    }
  ]
}
```

## Uso

### Iniciar Sistema Multi-Agente

```bash
# Listar agentes configurados
node orchestrator.js list

# Iniciar un agente específico
node orchestrator.js start santa-ana

# Iniciar todos los agentes habilitados
node orchestrator.js start

# Detener un agente
node orchestrator.js stop santa-ana
```

### Iniciar Dashboard Centralizado

```bash
node dashboard-central.js
```

Abrir en navegador: http://localhost:3000

### Scripts Disponibles

```bash
# Usando scripts .bat (Windows)
scripts/list-agents.bat
scripts/start-agent.bat santa-ana
scripts/start-dashboard-central.bat

# Usando npm
npm run orchestrator:list
npm run orchestrator:start
npm run dashboard:central
```

## Arquitectura

```
orchestrator.js
├── Agent Manager (santa-ana) - Puerto 3011
│   ├── WhatsApp Client
│   ├── API REST
│   ├── Catálogo de Productos
│   ├── Estadísticas (data/santa-ana/)
│   └── Logs (logs/santa-ana/)
│
└── Agent Manager (local-2) - Puerto 3012
    └── (Deshabilitado por defecto)

dashboard-central.js - Puerto 3000
└── Interfaz unificada con WebSocket
```

## Estructura del Proyecto

```
bot_dolce/
├── config/
│   └── agents.json           # Configuración de agentes
├── lib/
│   ├── agent-manager.js      # Clase para gestionar cada agente
│   ├── llm.js                # Integración con Gemini/OpenRouter
│   ├── statistics.js         # Sistema de estadísticas
│   ├── security.js           # Anti-hijacking
│   └── ...
├── catalogs/
│   └── catalogo-santa-ana.js # Catálogo de productos por agente
├── data/
│   └── santa-ana/            # Datos por agente
├── logs/
│   └── santa-ana/            # Logs por agente
├── public-central/           # Frontend del dashboard
├── scripts/                  # Scripts de gestión (.bat)
├── orchestrator.js           # Orquestador de agentes
├── dashboard-central.js      # Dashboard centralizado
└── bot.js                    # Bot monolítico (legacy)
```

## Dashboard Centralizado

El dashboard proporciona:

- Vista de todos los agentes (estado, estadísticas)
- Conversaciones en tiempo real
- Logs del sistema y seguridad
- Control de pausas (global y por usuario)
- Estadísticas detalladas
- Actualizaciones automáticas vía WebSocket

## Comandos Administrativos (WhatsApp)

Los números configurados como admin pueden usar:

```
PAUSAR BOT GLOBAL          - Pausa el bot completamente
REANUDAR BOT GLOBAL        - Reactiva el bot
ESTADO BOT                 - Ver estado actual
PAUSAR [número]            - Pausar usuario específico
REANUDAR [número]          - Reanudar usuario específico
LISTAR PAUSADOS            - Ver usuarios pausados
```

## Flujos de Conversación

1. **Bienvenida**: Captura nombre del usuario
2. **Menú Principal**:
   - Realizar pedido cotillón
   - Entrega y recepción de envíos
3. **Pedidos**: Búsqueda inteligente en catálogo con IA
4. **Paquetería**: Info sobre Correo Argentino, Andreani, Mercado Libre

## Sistema de Fallback LLM

```
Gemini 2.5-flash (principal)
    ↓ (si falla)
Gemini 1.5-flash
    ↓ (si falla, 3 reintentos)
OpenRouter - Ling 2.6-flash
    ↓ (si falla)
OpenRouter - Gemma 4
```

## Agregar Nuevo Local

1. Editar `config/agents.json`:
```json
{
  "id": "nuevo-local",
  "name": "Dolce Party - Nuevo Local",
  "enabled": true,
  "ports": { "api": 3013 },
  "paths": {
    "data": "data/nuevo-local",
    "logs": "logs/nuevo-local",
    "catalog": "catalogs/catalogo-nuevo-local.js"
  }
}
```

2. Crear directorios:
```bash
mkdir data/nuevo-local
mkdir logs/nuevo-local
```

3. Copiar y editar catálogo:
```bash
cp catalogs/catalogo-santa-ana.js catalogs/catalogo-nuevo-local.js
```

4. Iniciar agente:
```bash
node orchestrator.js start nuevo-local
```

## Desarrollo

### Bot Monolítico (Legacy)

El bot original sigue disponible para desarrollo:

```bash
# Iniciar bot monolítico
npm start

# Iniciar dashboard original
npm run dashboard
```

### Testing

```bash
# Probar conexión WebSocket
node test-websocket.js

# Ver logs en tiempo real
Get-Content logs/santa-ana/bot.log -Wait -Tail 10
```

## Documentación

- `docs/arquitectura/` - Documentación técnica
- `docs/guias/` - Guías de uso
- `docs/implementaciones/` - Detalles de implementación
- `docs/README-MULTI-AGENTE.md` - Guía completa del sistema multi-agente

## Troubleshooting

### QR Code no aparece
```bash
# Limpiar sesión de WhatsApp
scripts/limpiar-sesion.bat
node orchestrator.js start santa-ana
```

### Dashboard vacío
- Verificar que el agente esté corriendo: `node orchestrator.js list`
- Verificar consola del navegador (F12) para errores
- Verificar que el puerto 3011 esté disponible

### API key inválida
- El sistema usa OpenRouter automáticamente como fallback
- Verificar que `OPENROUTER_API_KEY` esté configurada en `.env`

## Licencia

Privado - Dolce Party

## Contacto

- GitHub: https://github.com/yura9011/bot_dolce
- Desarrollado para: Dolce Party - Cotillón
