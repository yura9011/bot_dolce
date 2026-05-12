# PROMPT PARA PRÓXIMO AGENTE - DOLCE PARTY WHATSAPP BOT

## ⚠️ LEE ESTO PRIMERO (Contexto Crítico)

Sos el próximo agente trabajando en el **Dolce Party WhatsApp Bot** con sistema multi-agente.

### 🚨 ERROR #1 QUE EL AGENTE ANTERIOR COMETIÓ:
**No siguió GSD (Get Shit Done)**. Hizo cambios directos sin:
1. Plan con XML (`<plan>` structure)
2. Commits atómicos: `git commit -m "feat(phase-N): description"`
3. Verificación empírica (F12 consola, screenshots)
4. Actualizar STATE.md después de CADA acción

**Tu objetivo:** NO repetir estos errores. Seguí GSD religiosamente.

---

## 📋 METODOLOGÍA GSD (OBLIGATORIO)

Antes de hacer CUALQUIER cambio:

```xml
<plan>
  <goal>Qué querés lograr</goal>
  <prerequisites>
    <item>Requisito 1</item>
  </prerequisites>
  <tasks>
    <task id="1">
      <description>Descripción</description>
      <files>Archivos a modificar</files>
      <changes>Cambios específicos</changes>
      <verification>Cómo verificar empíricamente</verification>
    </task>
  </tasks>
  <success_criteria>
    <criterion>Medible y verificable</criterion>
  </success_criteria>
</plan>
```

**Commits atómicos:**
```bash
git add archivo.js
git commit -m "feat(dashboard): descripción corta"
```

**Verificación empírica (OBLIGATORIO):**
- F12 → Consola (no errores rojos)
- Screenshot si es visual
- `curl` o `fetch` para APIs

**Actualizar STATE.md después de CADA tarea:**
```bash
# Editar .gsd/.gsd/state/STATE.md
# Agregar checkpoint con evidencia
```

---

## 🔴 BLOCKER ACTUAL (Estado: NO RESUELTO)

### Problema:
Dashboard en `http://localhost:3000` **SOLO muestra el header**. Las tarjetas de agentes NO aparecen.

### Evidencia del agente anterior (consola F12):
```
app.js:298 Uncaught TypeError: paused.map is not a function
  at updateModalPausedUsers (app.js:298:34)
```

### Fix aplicado (pero NO verificado empíricamente):
En `public-central/app.js` línea ~298, se cambió:
```javascript
// ANTES (rompe):
paused.map(user => ...)

// DESPUÉS (fix aplicado):
let pausedArray = paused;
if (!Array.isArray(paused)) {
    pausedArray = Object.entries(paused).map(([userId, data]) => ({
        userId,
        ...data
    }));
}
pausedArray.map(user => ...)
```

### ✅ LO QUE TENÉS QUE HACER AHORA:
1. **Recargar** `http://localhost:3000`
2. **F12** → Pestaña **Consola**
3. **F5** (recargar)
4. **Copiar y pegar** CUALQUIER error rojo que aparezca
5. **Verificar** si aparecen las tarjetas de agentes (Santa Ana, Local 2)

---

## ✅ LO QUE SÍ FUNCIONA (Verificado)

### Backend:
- ✅ `dashboard-central.js` - WebSocket (Socket.IO) funcionando
- ✅ `agent-manager.js` - Todos los endpoints:
  - `GET /stats`, `/conversations`, `/logs`, `/security`, `/paused`
- ✅ `.env.example` - Creado para VPS Hostinger

### Bot:
- ✅ Agente Santa Ana responde mensajes de WhatsApp
- ✅ Fallback LLM (Gemini → OpenRouter)

### WebSocket:
- ✅ Backend emite: `agent_${id}_initial` y `agent_${id}_update`
- ✅ Frontend escucha eventos (pero puede tener bugs)

---

## 🔴 LO QUE NO FUNCIONA (Blockers)

1. **Dashboard no renderiza tarjetas** - SOLO veo el header
2. **Fix de `paused.map` NO verificado** - Necesita F12 consola
3. **WebSocket no probado en tiempo real** - Enviar mensaje y ver en dashboard

---

## 📂 ARCHIVOS CLAVE

### Para arreglar el blocker:
- `public-central/app.js` - JavaScript del frontend (línea ~298)
- `public-central/index.html` - HTML con grid de agentes
- `dashboard-central.js` - Backend con WebSocket

### Documentación GSD (LEER PRIMERO):
- `.gsd/.gsd/state/STATE.md` - Estado actual
- `.gsd/.gsd/state/IMPLEMENTATION_PLAN.md` - Plan de implementación
- `.gsd/.gsd/state/JOURNAL.md` - Bitácora de errores del agente anterior
- `.gsd/.gsd/state/PHASE-FIX-RENDER.md` - Plan XML para fix
- `.gsd/.gsd/state/PHASE-FIX-PAUSED.md` - Plan XML para fix paused.map
- `.gsd/SYSTEM.md` - Instrucciones de GSD

---

## 🎯 TAREA INMEDIATA (GSD Compliant)

### Paso 1: Verificación Empírica
```bash
# Terminal 1: Iniciar dashboard
cd D:\tareas\exp010-whatsappbot
node dashboard-central.js

# Navegador: Abrir http://localhost:3000
# F12 → Consola → F5 (recargar)
# COPIAR errores rojos y pegar en el chat
```

### Paso 2: Crear PLAN.md (XML)
Si hay errores, crear `.gsd/.gsd/state/PHASE-FIX-ERROR.md` con:
```xml
<plan>
  <goal>Fix error específico</goal>
  <tasks>
    <task id="1">
      <verification>F12 console shows no red errors</verification>
    </task>
  </tasks>
</plan>
```

### Paso 3: Ejecutar con Commit Atómico
```bash
git add public-central/app.js
git commit -m "fix(dashboard): describe el fix"
```

### Paso 4: Verificar de Nuevo
- F12 consola: ¿No hay errores?
- ¿Aparecen las tarjetas de agentes?
- Screenshot si funciona

### Paso 5: Actualizar STATE.md
```markdown
### Checkpoint N: Fix verificado
- ✅ Error X corregido
- ✅ Tarjetas aparecen correctamente
- Evidencia: Screenshot/F12 console log
```

---

## 📝 COMANDOS ÚTILES

### Verificar APIs:
```powershell
curl http://localhost:3000/api/agents
# Debería devolver array de agentes
```

### Verificar WebSocket:
```powershell
node test-websocket.js
# Debería conectar y recibir datos
```

### Ver logs en tiempo real:
```powershell
Get-Content D:\tareas\exp010-whatsappbot\logs\santa-ana\bot.log -Wait -Tail 10
```

---

## ⚠️ ADVERTENCIAS

1. **NO hagas cambios directos** sin plan XML
2. **NO digas "funciona"** sin evidencia (F12/screenshot)
3. **NO acumules cambios** - haz commits atómicos
4. **ACTUALIZA STATE.md** después de cada acción
5. **Si 3 fallos consecutivos** → `/pause` y esperar próximo agente

---

## 🎯 OBJETIVO FINAL

Tener el **Dashboard Centralizado** funcionando con:
- ✅ Tarjetas de agentes visibles
- ✅ WebSocket en tiempo real (< 1 segundo)
- ✅ Modal "Ver Detalles" funcionando
- ✅ Botón pausar/reanudar funcionando
- ✅ Actualizaciones instantáneas al enviar mensaje por WhatsApp

---

**¿Listo para continuar? Empezá por la verificación empírica (F12 consola).**
