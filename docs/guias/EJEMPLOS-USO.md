# 📚 EJEMPLOS DE USO - Sistema Multi-Agente

## 🎯 Casos de Uso Comunes

---

## 1️⃣ Iniciar el Sistema por Primera Vez

### Escenario
Es la primera vez que vas a usar el sistema multi-agente.

### Pasos

```bash
# 1. Ver qué agentes están configurados
node orchestrator.js list

# Salida:
# 📋 Agentes configurados:
# ⚪ Detenido santa-ana - Dolce Party - Santa Ana
#    API: http://localhost:3011
#    Data: data/santa-ana
# 🔴 Deshabilitado local-2 - Dolce Party - Local 2
#    API: http://localhost:3012
#    Data: data/local-2

# 2. Iniciar el agente Santa Ana
node orchestrator.js start santa-ana

# 3. Escanear el QR Code que aparece en la consola
# (Usar WhatsApp del local Santa Ana)

# 4. Esperar mensaje de confirmación:
# ✅ Bot conectado y listo!
# 📦 Catálogo: 150 productos en 8 categorías

# 5. (Opcional) Iniciar dashboard en otra terminal
node dashboard-central.js

# 6. Abrir navegador en http://localhost:3000
```

---

## 2️⃣ Gestión Diaria - Un Solo Local

### Escenario
Trabajás solo con el local Santa Ana y querés iniciar/detener el bot.

### Inicio del Día

```bash
# Opción 1: Usando Node.js
node orchestrator.js start santa-ana

# Opción 2: Usando script .bat
start-agent.bat santa-ana

# Opción 3: Usando npm
npm run orchestrator:start santa-ana
```

### Fin del Día

```bash
# Detener el agente
node orchestrator.js stop santa-ana

# O simplemente cerrar la terminal (Ctrl+C)
```

---

## 3️⃣ Gestión Diaria - Múltiples Locales

### Escenario
Tenés 2 o más locales y querés iniciar todos a la vez.

### Inicio del Día

```bash
# Iniciar todos los agentes habilitados
node orchestrator.js start

# O usando script .bat
start-all-agents.bat

# Esto iniciará automáticamente todos los agentes con "enabled": true
```

### Verificar Estado

```bash
# Ver estado de todos los agentes
node orchestrator.js list

# Salida:
# 🟢 Corriendo santa-ana - Dolce Party - Santa Ana
# 🟢 Corriendo local-2 - Dolce Party - Local 2
```

### Fin del Día

```bash
# Detener todos los agentes
node orchestrator.js stop
```

---

## 4️⃣ Agregar un Nuevo Local

### Escenario
Abriste un tercer local y querés agregar un nuevo agente.

### Pasos

```bash
# 1. Editar config/agents.json
# Agregar nuevo agente al array:
{
  "id": "local-3",
  "name": "Dolce Party - Local 3",
  "enabled": true,
  "whatsappSession": "local-3-session",
  "ports": {
    "api": 3013
  },
  "paths": {
    "data": "data/local-3",
    "logs": "logs/local-3",
    "catalog": "catalogs/catalogo-local-3.js"
  },
  "info": {
    "nombre": "Dolce Party - Local 3",
    "telefono": "0351 XXX-XXXX",
    "horario": "Lunes a Sábado: 9:00 a 20:00hs",
    "direccion": "Nueva Dirección"
  },
  "adminNumbers": ["549XXXXXXXXXX"]
}

# 2. Crear directorios
mkdir data/local-3
mkdir logs/local-3

# 3. Copiar catálogo
cp catalogs/catalogo-santa-ana.js catalogs/catalogo-local-3.js

# 4. Editar catálogo con productos del nuevo local
# (Editar catalogs/catalogo-local-3.js)

# 5. Iniciar el nuevo agente
node orchestrator.js start local-3

# 6. Escanear QR con WhatsApp del nuevo local
```

---

## 5️⃣ Monitoreo con Dashboard

### Escenario
Querés ver el estado de todos los locales en tiempo real.

### Pasos

```bash
# 1. Iniciar dashboard
node dashboard-central.js

# O usando script .bat
start-dashboard-central.bat

# 2. Abrir navegador
# http://localhost:3000

# 3. Ver información en tiempo real:
# - Estado de cada agente (Corriendo/Detenido/Deshabilitado)
# - Mensajes recibidos hoy
# - Mensajes enviados hoy
# - Información de contacto de cada local

# El dashboard se actualiza automáticamente cada 10 segundos
```

---

## 6️⃣ Pausar Bot Temporalmente

### Escenario
Necesitás pausar el bot de un local porque vas a atender manualmente.

### Usando API

```bash
# Pausar bot del local Santa Ana
curl -X POST http://localhost:3011/pause-global

# Reanudar bot
curl -X POST http://localhost:3011/resume-global
```

### Usando Comandos Admin (desde WhatsApp)

```
# Pausar bot
/pause

# Reanudar bot
/resume
```

---

## 7️⃣ Pausar Usuario Específico

### Escenario
Un cliente necesita atención personalizada y querés que el bot no le responda.

### Usando API

```bash
# Pausar usuario específico
curl -X POST http://localhost:3011/pause/5491158647529@c.us

# Reanudar usuario
curl -X POST http://localhost:3011/resume/5491158647529@c.us
```

### Usando Comandos Admin (desde WhatsApp)

```
# Pausar usuario
/pausar 5491158647529

# Reanudar usuario
/reanudar 5491158647529
```

---

## 8️⃣ Ver Estadísticas de un Local

### Escenario
Querés ver las estadísticas de mensajes de un local específico.

### Usando API

```bash
# Ver estadísticas del local Santa Ana
curl http://localhost:3011/stats

# Salida (ejemplo):
{
  "mensajes": {
    "2026-04-30": {
      "recibidos": 45,
      "enviados": 52
    },
    "2026-04-29": {
      "recibidos": 38,
      "enviados": 41
    }
  },
  "handoffs": {
    "2026-04-30": 3
  },
  "hijacking": {
    "2026-04-30": 1
  }
}
```

### Usando Archivo JSON

```bash
# Ver archivo de estadísticas directamente
cat data/santa-ana/estadisticas.json

# O en Windows
type data\santa-ana\estadisticas.json
```

---

## 9️⃣ Revisar Logs de un Local

### Escenario
Hubo un problema y querés revisar los logs de un local.

### Ver Logs

```bash
# Ver logs del local Santa Ana
cat logs/santa-ana/bot.log

# Ver últimas 50 líneas
tail -n 50 logs/santa-ana/bot.log

# En Windows
type logs\santa-ana\bot.log

# Ver logs de seguridad
cat logs/santa-ana/security.log
```

---

## 🔟 Reiniciar un Agente

### Escenario
Un agente se desconectó o tiene problemas y querés reiniciarlo.

### Pasos

```bash
# 1. Detener el agente
node orchestrator.js stop santa-ana

# 2. Esperar 5 segundos

# 3. Iniciar el agente nuevamente
node orchestrator.js start santa-ana

# El agente se reconectará automáticamente sin necesidad de escanear QR
```

---

## 1️⃣1️⃣ Migrar del Bot Original al Multi-Agente

### Escenario
Estás usando `bot.js` y querés migrar al sistema multi-agente.

### Pasos

```bash
# 1. Detener el bot original
# (Ctrl+C en la terminal donde corre bot.js)

# 2. Los datos ya están migrados a data/santa-ana/
# (Esto se hizo automáticamente durante la implementación)

# 3. Iniciar el agente Santa Ana
node orchestrator.js start santa-ana

# 4. Escanear QR Code
# (Usar el mismo WhatsApp que usabas con bot.js)

# 5. ¡Listo! El agente usará los mismos datos y configuración
```

---

## 1️⃣2️⃣ Actualizar Catálogo de un Local

### Escenario
Agregaste nuevos productos y querés actualizar el catálogo de un local.

### Pasos

```bash
# 1. Editar el catálogo
# Editar: catalogs/catalogo-santa-ana.js

# 2. Reiniciar el agente para que cargue el nuevo catálogo
node orchestrator.js stop santa-ana
node orchestrator.js start santa-ana

# El agente cargará automáticamente el catálogo actualizado
```

---

## 1️⃣3️⃣ Cambiar Puerto de un Agente

### Escenario
El puerto 3011 está ocupado y querés usar otro puerto.

### Pasos

```bash
# 1. Editar config/agents.json
# Cambiar:
"ports": {
  "api": 3011
}
# Por:
"ports": {
  "api": 3015
}

# 2. Reiniciar el agente
node orchestrator.js stop santa-ana
node orchestrator.js start santa-ana

# 3. El agente ahora estará en http://localhost:3015
```

---

## 1️⃣4️⃣ Deshabilitar un Local Temporalmente

### Escenario
Un local está cerrado por vacaciones y no querés que su agente se inicie.

### Pasos

```bash
# 1. Editar config/agents.json
# Cambiar:
"enabled": true
# Por:
"enabled": false

# 2. Si el agente está corriendo, detenerlo
node orchestrator.js stop local-2

# 3. Al hacer "start" sin argumentos, este agente no se iniciará
node orchestrator.js start
# (Solo iniciará los agentes con "enabled": true)
```

---

## 1️⃣5️⃣ Finalizar Atención Manual

### Escenario
Atendiste manualmente a un cliente y querés finalizar la conversación.

### Desde WhatsApp Web

```
# 1. Escribir al cliente desde WhatsApp Web:
MUCHAS GRACIAS

# 2. El bot automáticamente:
# - Enviará mensaje de despedida al cliente
# - Reanudará al cliente para futuras conversaciones
# - Registrará la finalización en logs
```

### Usando Comando Admin

```
# Reanudar cliente manualmente
/reanudar 5491158647529
```

---

## 🎯 Flujos de Trabajo Recomendados

### Flujo Diario - Un Local

```bash
# Mañana
start-agent.bat santa-ana

# Durante el día
# - Monitorear en dashboard: http://localhost:3000
# - Revisar mensajes en WhatsApp Web

# Noche
# Ctrl+C para detener
```

### Flujo Diario - Múltiples Locales

```bash
# Mañana
start-all-agents.bat
start-dashboard-central.bat

# Durante el día
# - Monitorear todos los locales en: http://localhost:3000
# - Cada local tiene su WhatsApp independiente

# Noche
node orchestrator.js stop
```

### Flujo de Mantenimiento Semanal

```bash
# 1. Ver estadísticas de la semana
curl http://localhost:3011/stats > stats-santa-ana.json
curl http://localhost:3012/stats > stats-local-2.json

# 2. Revisar logs
cat logs/santa-ana/bot.log | grep ERROR
cat logs/local-2/bot.log | grep ERROR

# 3. Limpiar logs antiguos (opcional)
# Hacer backup y limpiar logs de más de 30 días
```

---

## 🚨 Solución de Problemas Comunes

### Problema: "Puerto ya en uso"

```bash
# Solución: Cambiar puerto en config/agents.json
# O encontrar y matar el proceso que usa el puerto

# Windows
netstat -ano | findstr :3011
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3011
kill -9 <PID>
```

### Problema: "QR Code no aparece"

```bash
# Solución: Esperar 30-60 segundos
# Si no aparece, reiniciar el agente

node orchestrator.js stop santa-ana
node orchestrator.js start santa-ana
```

### Problema: "Agente se desconecta constantemente"

```bash
# Solución: Revisar logs
cat logs/santa-ana/bot.log

# Causas comunes:
# - Conexión a internet inestable
# - WhatsApp desvinculado del teléfono
# - Sesión corrupta (eliminar .wwebjs_auth y reconectar)
```

---

## 📞 Comandos de Referencia Rápida

```bash
# Listar agentes
node orchestrator.js list

# Iniciar un agente
node orchestrator.js start <agent-id>

# Iniciar todos
node orchestrator.js start

# Detener un agente
node orchestrator.js stop <agent-id>

# Detener todos
node orchestrator.js stop

# Dashboard
node dashboard-central.js

# Ver estadísticas
curl http://localhost:3011/stats

# Ver estado
curl http://localhost:3011/status

# Pausar bot
curl -X POST http://localhost:3011/pause-global

# Reanudar bot
curl -X POST http://localhost:3011/resume-global
```

---

**¡Estos ejemplos cubren los casos de uso más comunes! 🎈**
