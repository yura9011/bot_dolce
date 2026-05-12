# PLAN DE IMPLEMENTACIÓN - Dashboard Centralizado

**Fecha:** 2026-05-01  
**Objetivo:** Completar dashboard centralizado con WebSocket y frontend en tiempo real  
**Estado Anterior:** 2026-04-30 - Plan inicial creado

---

## ESTADO ACTUAL (Actualizado 2026-05-01)

### ✅ COMPLETADO (por agente anterior - 2026-04-30):

#### Agent Manager (lib/agent-manager.js):
- ✅ Endpoint `/conversations` (línea 626)
- ✅ Endpoint `/logs` (línea 684)
- ✅ Endpoint `/security` (línea 705)
- ✅ Funciones de lectura implementadas

#### Dashboard Centralizado Backend (dashboard-central.js):
- ✅ Proxy `/api/agents/:id/conversations` (línea 111)
- ✅ Proxy `/api/agents/:id/logs` (línea 131)
- ✅ Proxy `/api/agents/:id/security` (línea 152)
- ✅ Proxy `/api/agents/:id/stats/detailed` (línea 172)
- ✅ Proxy para controles (pause/resume global y usuarios)

#### Frontend (public-central/):
- ✅ `index.html` - Estructura completa con modal (73 líneas)
- ✅ `app.js` - Lógica completa con modal y refresh cada 10s (513 líneas)
- ✅ `style.css` - Estilos completos (1033 líneas)

### 🔴 PENDIENTE CRÍTICO:

#### 1. WebSocket en dashboard-central.js
**Problema:** El dashboard-central.js NO tiene Socket.IO  
**Referencia:** Ver dashboard.js líneas 312-349 para implementación  
**Impacto:** Las actualizaciones NO son en tiempo real (usa polling cada 10s)

#### 2. WebSocket en public-central/app.js
**Problema:** El frontend usa `setInterval()` en lugar de WebSocket  
**Referencia:** Ver public/app.js líneas 34-91 para implementación

#### 3. Archivo agent-details.html faltante
**Problema:** Referenciado en dashboard-central.js línea 16 pero no existe  
**Solución:** Crear archivo o redirigir a modal existente

#### 4. Endpoints proxy faltantes en dashboard-central.js
- `GET /api/agents/:id/stats/history/:days`
- `GET /api/agents/:id/stats/searches`

---

## PLAN DE TRABAJO ACTUALIZADO

### FASE 1: WebSocket - CRÍTICO ⚠️

**Objetivo:** Implementar Socket.IO en dashboard-central.js para actualizaciones en tiempo real

#### 1.1 Modificar dashboard-central.js:
```javascript
// Agregar al inicio (línea 1-8 aprox):
const socketIo = require('socket.io');
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Agregar después de server.listen():
io.on('connection', async (socket) => {
  console.log('📊 Dashboard centralizado conectado');
  
  // Enviar datos iniciales
  const agents = loadAgentsConfig().agents;
  for (const agent of agents) {
    if (agent.enabled) {
      const [stats, conversations, paused] = await Promise.all([
        fetch(`http://localhost:${agent.ports.api}/stats`).then(r => r.json()),
        fetch(`http://localhost:${agent.ports.api}/conversations`).then(r => r.json()),
        fetch(`http://localhost:${agent.ports.api}/paused`).then(r => r.json())
      ]);
      socket.emit(`agent_${agent.id}_initial`, { stats, conversations, paused });
    }
  }
  
  socket.on('disconnect', () => {
    console.log('📊 Dashboard desconectado');
  });
});

// Actualizar datos cada 10 segundos:
setInterval(async () => {
  const agents = loadAgentsConfig().agents;
  for (const agent of agents) {
    if (agent.enabled) {
      try {
        const [stats, conversations, paused, logs, security] = await Promise.all([
          fetch(`http://localhost:${agent.ports.api}/stats`).then(r => r.json()),
          fetch(`http://localhost:${agent.ports.api}/conversations`).then(r => r.json()),
          fetch(`http://localhost:${agent.ports.api}/paused`).then(r => r.json()),
          fetch(`http://localhost:${agent.ports.api}/logs?lines=50`).then(r => r.json()),
          fetch(`http://localhost:${agent.ports.api}/security?lines=20`).then(r => r.json())
        ]);
        io.emit(`agent_${agent.id}_update`, { stats, conversations, paused, logs, security });
      } catch (error) {
        console.error(`Error actualizando ${agent.id}:`, error.message);
      }
    }
  }
}, 10000);
```

**Referencia de implementación:** `dashboard.js` líneas 312-349

#### 1.2 Modificar public-central/app.js:
```javascript
// Agregar al inicio:
let socket;

// En DOMContentLoaded (línea 12):
function initializeSocket() {
  socket = io();
  
  socket.on('connect', () => {
    console.log('✅ Conectado al dashboard centralizado');
  });
  
  // Escuchar actualizaciones por agente
  agents.forEach(agent => {
    socket.on(`agent_${agent.id}_update`, (data) => {
      updateAgentCard(agent.id, data);
    });
  });
}

// Reemplazar setInterval(loadAgents, 10000) por WebSocket
```

**Referencia de implementación:** `public/app.js` líneas 34-91

---

### FASE 2: Archivos Faltantes

#### 2.1 Crear public-central/agent-details.html
**Opción A:** Crear página independiente (referenciada en dashboard-central.js línea 16)  
**Opción B:** Redirigir a modal en index.html (YA EXISTE)  

**Recomendación:** Usar modal existente en index.html y eliminar referencia a agent-details.html en dashboard-central.js

#### 2.2 Agregar endpoints faltantes en dashboard-central.js:
```javascript
// GET /api/agents/:id/stats/history/:days
app.get('/api/agents/:id/stats/history/:days', async (req, res) => {
  const agent = getAgentById(req.params.id);
  const days = parseInt(req.params.days) || 7;
  const response = await fetch(`http://localhost:${agent.ports.api}/stats/history/${days}`);
  res.json(await response.json());
});

// GET /api/agents/:id/stats/searches
app.get('/api/agents/:id/stats/searches', async (req, res) => {
  const agent = getAgentById(req.params.id);
  const response = await fetch(`http://localhost:${agent.ports.api}/stats/searches`);
  res.json(await response.json());
});
```

**Nota:** Estos endpoints requieren que agent-manager.js los soporte. Ver `lib/statistics.js` para implementación de `getEstadisticasUltimosDias()` y `getConsultasFrecuentes()`.

---

### FASE 3: Testing y Validación

#### 3.1 Tests Funcionales (WebSocket):
- [ ] Iniciar agente santa-ana
- [ ] Iniciar dashboard-central.js
- [ ] Verificar conexión WebSocket en consola del navegador
- [ ] Enviar mensaje al bot
- [ ] Verificar que el dashboard se actualiza en TIEMPO REAL (< 1 segundo)
- [ ] Pausar usuario y ver actualización automática
- [ ] Verificar logs y seguridad en tiempo real

#### 3.2 Comparación de Performance:
| Métrica | Polling (Actual) | WebSocket (Objetivo) |
|---------|-------------------|----------------------|
| Latencia | ~10 segundos | < 1 segundo |
| Carga servidor | Alta (polling cada 10s) | Baja (solo cambios) |
| Experiencia usuario | Mala (parpadeos) | Fluida |

---

## ORDEN DE IMPLEMENTACIÓN (PRIORIZADO)

### 🔴 CRÍTICO (Hacer primero):
1. **Implementar Socket.IO en dashboard-central.js**
   - Agregar require y configuración CORS
   - Implementar io.on('connection')
   - Implementar setInterval para emitir eventos
   - **Tiempo estimado:** 30-45 minutos
   - **Referencia:** dashboard.js líneas 1-8, 312-349

2. **Actualizar public-central/app.js para usar WebSocket**
   - Agregar initializeSocket()
   - Escuchar eventos por agente
   - Eliminar polling (setInterval)
   - **Tiempo estimado:** 30 minutos
   - **Referencia:** public/app.js líneas 34-91

### 🟡 IMPORTANTE (Hacer después):
3. **Resolver tema de agent-details.html**
   - Opción A: Crear archivo (si se necesita página separada)
   - Opción B: Eliminar referencia y usar solo modal (RECOMENDADO)
   - **Tiempo estimado:** 15-30 minutos

4. **Agregar endpoints faltantes en dashboard-central.js**
   - `/stats/history/:days`
   - `/stats/searches`
   - **Tiempo estimado:** 20 minutos

### 🟢 OPCIONAL (Nice to have):
5. **Organización de repositorio**
   - Mover archivos .md a docs/
   - Limpiar archivos temporales
   - **Tiempo estimado:** 15 minutos

---

## ARCHIVOS A MODIFICAR

### Backend (CRÍTICO):
- `dashboard-central.js` - Agregar Socket.IO (ver líneas 1-8, después de línea 262)
- `lib/agent-manager.js` - Verificar que soporta /stats/history/:days y /stats/searches (YA SOPORTA)

### Frontend (CRÍTICO):
- `public-central/app.js` - Cambiar polling por WebSocket (líneas 12-25)
- `public-central/agent-details.html` - CREAR o ELIMINAR referencia

### Documentación:
- `.gsd/.gsd/state/STATE.md` - ✅ ACTUALIZADO
- `.gsd/.gsd/state/IMPLEMENTATION_PLAN.md` - En proceso de actualización

---

## ESTIMACIÓN DE TIEMPO (ACTUALIZADA)

- **FASE 1 (WebSocket Backend):** 30-45 minutos
- **FASE 1 (WebSocket Frontend):** 30 minutos
- **FASE 2 (Archivos faltantes):** 20-30 minutos
- **FASE 3 (Testing):** 30 minutos

**Total restante:** ~2-3 horas de trabajo

---

## NOTAS IMPORTANTES

1. **WebSocket es CRÍTICO** - El dashboard original (dashboard.js) tiene Socket.IO, el centralizado DEBE tenerlo
2. **Referencias disponibles** - Usar dashboard.js líneas 312-349 como template exacto
3. **No modificar bot.js ni dashboard.js original** - Deben seguir funcionando como respaldo
4. **Testing en tiempo real** - Verificar que las actualizaciones se ven instantáneamente
5. **El agente anterior hizo un buen trabajo** - Backend completo, solo falta WebSocket

---

## PRÓXIMOS PASOS INMEDIATOS

1. ✅ **Documentar estado actual** (COMPLETADO - STATE.md actualizado)
2. 🔴 **Implementar WebSocket en dashboard-central.js** (SIGUIENTE)
3. 🔴 **Implementar WebSocket en public-central/app.js**
4. 🟡 **Resolver tema agent-details.html**
5. 🟡 **Agregar endpoints faltantes**
6. 🟢 **Testing completo**

---

**Estado:** Documentación actualizada, listo para implementar WebSocket  
**Prioridad:** CRÍTICA (WebSocket)  
**Bloqueadores:** Ninguno - todo el backend está completo
