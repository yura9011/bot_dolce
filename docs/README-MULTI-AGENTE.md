# 🎈 Sistema Multi-Agente - Dolce Party

Sistema de gestión de múltiples bots de WhatsApp para diferentes locales de Dolce Party, con dashboard centralizado y control independiente.

---

## 🚀 Inicio Rápido

### 1. Listar agentes disponibles
```bash
node orchestrator.js list
```

### 2. Iniciar un agente
```bash
node orchestrator.js start santa-ana
```

### 3. Escanear QR Code
- Se mostrará un QR en la consola
- Abrir WhatsApp en el teléfono del local
- Ir a Menú (⋮) > Dispositivos vinculados
- Tocar "Vincular un dispositivo"
- Escanear el QR

### 4. Iniciar dashboard (opcional)
```bash
node dashboard-central.js
```
Abrir: http://localhost:3000

---

## 📋 Comandos Principales

### Gestión de Agentes

```bash
# Listar todos los agentes
node orchestrator.js list

# Iniciar un agente específico
node orchestrator.js start <agent-id>
node orchestrator.js start santa-ana

# Iniciar todos los agentes habilitados
node orchestrator.js start

# Detener un agente específico
node orchestrator.js stop <agent-id>
node orchestrator.js stop santa-ana

# Detener todos los agentes
node orchestrator.js stop
```

### Dashboard Centralizado

```bash
# Iniciar dashboard
node dashboard-central.js

# O usando npm
npm run dashboard:central

# O usando script .bat
start-dashboard-central.bat
```

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                  Dashboard Central                       │
│                  (puerto 3000)                          │
│         Vista unificada de todos los agentes            │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTP
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
┌───────▼────────┐                  ┌────────▼────────┐
│  Agente 1      │                  │  Agente 2       │
│  Santa Ana     │                  │  Local 2        │
│  (puerto 3011) │                  │  (puerto 3012)  │
├────────────────┤                  ├─────────────────┤
│ • WhatsApp     │                  │ • WhatsApp      │
│ • API REST     │                  │ • API REST      │
│ • Catálogo     │                  │ • Catálogo      │
│ • Estadísticas │                  │ • Estadísticas  │
│ • Logs         │                  │ • Logs          │
└────────────────┘                  └─────────────────┘
```

---

## 📁 Estructura de Archivos

```
proyecto/
├── config/
│   └── agents.json              # Configuración de agentes
├── lib/
│   └── agent-manager.js         # Clase AgentManager
├── data/
│   ├── santa-ana/               # Datos del agente Santa Ana
│   │   ├── estadisticas.json
│   │   ├── historial.json
│   │   └── pausas.json
│   └── local-2/                 # Datos del agente Local 2
├── logs/
│   ├── santa-ana/               # Logs del agente Santa Ana
│   └── local-2/                 # Logs del agente Local 2
├── catalogs/
│   ├── catalogo-santa-ana.js   # Catálogo Santa Ana
│   └── catalogo-local-2.js     # Catálogo Local 2
├── public-central/
│   └── index.html              # Frontend del dashboard
├── orchestrator.js             # Orquestador principal
├── dashboard-central.js        # Backend del dashboard
└── *.bat                       # Scripts de gestión
```

---

## ⚙️ Configuración de Agentes

Editar `config/agents.json`:

```json
{
  "agents": [
    {
      "id": "santa-ana",
      "name": "Dolce Party - Santa Ana",
      "enabled": true,
      "whatsappSession": "santa-ana-session",
      "ports": {
        "api": 3011
      },
      "paths": {
        "data": "data/santa-ana",
        "logs": "logs/santa-ana",
        "catalog": "catalogs/catalogo-santa-ana.js"
      },
      "info": {
        "nombre": "Dolce Party - Santa Ana",
        "telefono": "0351 855-9145",
        "horario": "Lunes a Sábado: 9:00 a 20:00hs",
        "direccion": "Sta. Ana 2637, Córdoba"
      },
      "adminNumbers": ["5491158647529"]
    }
  ]
}
```

---

## 🔌 API de Cada Agente

Cada agente expone una API REST en su puerto configurado:

### GET /status
Obtener estado del agente
```bash
curl http://localhost:3011/status
```

Respuesta:
```json
{
  "agentId": "santa-ana",
  "name": "Dolce Party - Santa Ana",
  "isRunning": true,
  "timestamp": 1714435200000
}
```

### GET /stats
Obtener estadísticas del agente
```bash
curl http://localhost:3011/stats
```

Respuesta:
```json
{
  "mensajes": {
    "2026-04-30": {
      "recibidos": 45,
      "enviados": 52
    }
  },
  "handoffs": { ... },
  "hijacking": { ... }
}
```

### POST /pause/:userId
Pausar usuario específico
```bash
curl -X POST http://localhost:3011/pause/5491158647529@c.us
```

### POST /resume/:userId
Reanudar usuario específico
```bash
curl -X POST http://localhost:3011/resume/5491158647529@c.us
```

### POST /pause-global
Pausar bot globalmente
```bash
curl -X POST http://localhost:3011/pause-global
```

### POST /resume-global
Reanudar bot globalmente
```bash
curl -X POST http://localhost:3011/resume-global
```

---

## 🎯 Agregar un Nuevo Local

### 1. Editar configuración
Agregar nuevo agente en `config/agents.json`:

```json
{
  "id": "nuevo-local",
  "name": "Dolce Party - Nuevo Local",
  "enabled": true,
  "whatsappSession": "nuevo-local-session",
  "ports": {
    "api": 3013
  },
  "paths": {
    "data": "data/nuevo-local",
    "logs": "logs/nuevo-local",
    "catalog": "catalogs/catalogo-nuevo-local.js"
  },
  "info": {
    "nombre": "Dolce Party - Nuevo Local",
    "telefono": "0351 XXX-XXXX",
    "horario": "Lunes a Sábado: 9:00 a 20:00hs",
    "direccion": "Dirección del nuevo local"
  },
  "adminNumbers": ["549XXXXXXXXXX"]
}
```

### 2. Crear directorios
```bash
mkdir data/nuevo-local
mkdir logs/nuevo-local
```

### 3. Crear catálogo
Copiar y editar:
```bash
cp catalogs/catalogo-santa-ana.js catalogs/catalogo-nuevo-local.js
```

### 4. Iniciar agente
```bash
node orchestrator.js start nuevo-local
```

---

## 🔍 Monitoreo

### Dashboard Web
- URL: http://localhost:3000
- Muestra todos los agentes
- Estado en tiempo real
- Estadísticas de mensajes
- Auto-refresh cada 10 segundos

### Logs
Cada agente tiene sus propios logs:
```bash
# Ver logs de Santa Ana
cat logs/santa-ana/bot.log

# Ver logs de Local 2
cat logs/local-2/bot.log
```

### Estadísticas
Cada agente tiene sus propias estadísticas:
```bash
# Ver estadísticas de Santa Ana
cat data/santa-ana/estadisticas.json

# Ver estadísticas de Local 2
cat data/local-2/estadisticas.json
```

---

## 🛠️ Troubleshooting

### El agente no inicia
1. Verificar que el puerto no esté en uso
2. Verificar que `enabled: true` en config
3. Revisar logs del agente

### QR Code no aparece
1. Esperar 30-60 segundos
2. Verificar conexión a internet
3. Reiniciar el agente

### Dashboard no muestra datos
1. Verificar que el agente esté corriendo
2. Verificar que el puerto API sea correcto
3. Abrir consola del navegador para ver errores

### Agente se desconecta
1. Verificar conexión a internet
2. Revisar logs para ver el motivo
3. Reiniciar el agente

---

## 📊 Puertos Utilizados

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Dashboard Central | 3000 | Dashboard web unificado |
| API Santa Ana | 3011 | API REST del agente Santa Ana |
| API Local 2 | 3012 | API REST del agente Local 2 |
| Bot Original | 3001 | Dashboard del bot original (si está corriendo) |
| API Original | 3002 | API del bot original (si está corriendo) |

---

## 🔐 Seguridad

- Cada agente tiene su propia sesión de WhatsApp
- Los números admin se configuran por agente
- Los datos están separados por agente
- Las APIs son locales (no expuestas a internet)

---

## 🚨 Comandos de Emergencia

### Detener todos los agentes inmediatamente
```bash
node orchestrator.js stop
```

### Pausar un agente sin detenerlo
```bash
curl -X POST http://localhost:3011/pause-global
```

### Ver estado de todos los agentes
```bash
node orchestrator.js list
```

---

## 📝 Notas Importantes

1. **Sesiones de WhatsApp:** Cada agente usa una sesión independiente. No compartir QR codes entre agentes.

2. **Datos separados:** Cada agente tiene sus propios datos, logs y estadísticas. No se comparten entre agentes.

3. **Catálogos independientes:** Cada agente puede tener un catálogo diferente de productos.

4. **Compatibilidad:** El bot original (`bot.js`) sigue funcionando y puede coexistir con el sistema multi-agente.

5. **Escalabilidad:** Se pueden agregar tantos agentes como se necesiten, solo asegurarse de usar puertos diferentes.

---

## 📚 Documentación Adicional

- `IMPLEMENTACION-COMPLETADA.md` - Resumen de la implementación
- `INSTRUCCIONES-IMPLEMENTACION-MULTI-AGENTE.md` - Instrucciones detalladas
- `docs/milestones/MILESTONE-ARQUITECTURA-MULTI-AGENTE.md` - Milestone del proyecto

---

## 🎉 ¡Listo para Usar!

El sistema multi-agente está completamente implementado y listo para usar. Simplemente ejecutar:

```bash
node orchestrator.js start santa-ana
```

Y escanear el QR Code que aparece en la consola.

---

**Desarrollado con ❤️ para Dolce Party**
