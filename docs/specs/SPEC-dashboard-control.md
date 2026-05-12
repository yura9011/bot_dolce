# Especificación: Integración Dashboard + Control Dual

## Objetivo
Permitir controlar el bot tanto desde **WhatsApp (comandos admin)** como desde el **Dashboard UI** de forma simultánea.

## Estado Actual

### Bot (bot.js)
- Control: Solo WhatsApp
- Persistencia: `data/pausas.json`, `data/historial.json`
- Constante `AUTO_RESUME_TIMEOUT_MS` en `lib/control-manual.js:7`

### Dashboard (dashboard.js)
- Lee datos de archivos JSON
- Endpoints POST (`/api/pause/:userId`, etc.) **no tienen efecto real**
- Solo devuelve mensajes informativos

## Arquitectura Propuesta

```
┌─────────────────┐     ┌─────────────────┐
│     Bot.js      │◄────│  Dashboard.js   │
│  Puerto: 3002   │     │  Puerto: 3001  │
│                 │     │                 │
│ • WhatsApp      │     │ • Dashboard UI │
│ • API Control  │     │ • Controles UI  │
└────────┬───────┘     └────────┬────────┘
         │                     │
         └──────────┬──────────┘
                    │
             ┌──────▼──────┐
             │ pausas.json │
             │ (archivo)   │
             └─────────────┘
```

## Cambios Requeridos

### 1. Centralizar constante `AUTO_RESUME_TIMEOUT_MS`

**Archivo:** `lib/validation.js`
**Acción:** Importar y re-exportar la constante

```javascript
const { AUTO_RESUME_TIMEOUT_MS } = require("./control-manual");

module.exports = {
  validarDatosIniciales,
  validarConfiguracionAdmin,
  AUTO_RESUME_TIMEOUT_MS  // ← Agregar
};
```

**Archivo:** `dashboard.js`
**Acción:** Usar la constante importada en lugar de hardcodear

```javascript
const { AUTO_RESUME_TIMEOUT_MS } = require("./lib/validation");
```

---

### 2. Agregar API interna al bot

**Archivo:** `bot.js`
**Ubicación:** Después de la inicialización del cliente (línea ~71)

```javascript
const express = require("express");
const dashboardApi = express();
dashboardApi.use(express.json());

// GET /status - Estado del bot
dashboardApi.get("/status", (req, res) => {
  res.json({
    activo: !getPausaGlobal(),
    globalPausado: getPausaGlobal(),
    usuariosPausados: Object.keys(getUsuariosPausados()).length,
    timestamp: Date.now()
  });
});

// POST /pause/:userId - Pausar usuario específico
dashboardApi.post("/pause/:userId", (req, res) => {
  const userId = req.params.userId;
  if (!userId.includes("@")) {
    return res.status(400).json({ success: false, error: "userId inválido" });
  }
  pausarUsuario(userId, "pausado_por_dashboard");
  res.json({ success: true, message: `Usuario ${userId} pausado` });
});

// POST /resume/:userId - Reanudar usuario específico
dashboardApi.post("/resume/:userId", (req, res) => {
  const userId = req.params.userId;
  if (!userId.includes("@")) {
    return res.status(400).json({ success: false, error: "userId inválido" });
  }
  const resultado = reanudarUsuario(userId);
  res.json({ success: resultado, message: resultado ? "Reanudado" : "No estaba pausado" });
});

// POST /pause-global - Pausar bot globalmente
dashboardApi.post("/pause-global", (req, res) => {
  setPausaGlobal(true);
  res.json({ success: true, message: "Bot pausado globalmente" });
});

// POST /resume-global - Reanudar bot globalmente
dashboardApi.post("/resume-global", (req, res) => {
  setPausaGlobal(false);
  res.json({ success: true, message: "Bot reanudado globalmente" });
});

// Iniciar API interna en puerto 3002
const DASHBOARD_API_PORT = 3002;
dashboardApi.listen(DASHBOARD_API_PORT, () => {
  log(`🔌 API de control iniciada en puerto ${DASHBOARD_API_PORT}`);
});
```

---

### 3. Modificar endpoints del dashboard

**Archivo:** `dashboard.js`
**Ubicación:** Reemplazar funciones de los endpoints POST (líneas 182-212)

```javascript
const BOT_API_URL = "http://localhost:3002";

app.post("/api/pause/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const response = await fetch(`${BOT_API_URL}/pause/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/resume/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const response = await fetch(`${BOT_API_URL}/resume/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/pause-global", async (req, res) => {
  try {
    const response = await fetch(`${BOT_API_URL}/pause-global`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/resume-global", async (req, res) => {
  try {
    const response = await fetch(`${BOT_API_URL}/resume-global`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

### 4. Actualizar frontend del dashboard

**Archivo:** `public/app.js`
**Ubicación:** Actualizar función `updatePausedUsers` y agregar nuevas funciones

```javascript
// Reemplazar función updatePausedUsers
function updatePausedUsers(paused) {
  if (!paused || paused.length === 0) {
    pausedUsersList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✅</div>
        <div>No hay usuarios pausados</div>
      </div>
    `;
    return;
  }
  
  pausedUsersList.innerHTML = paused.map(user => `
    <div class="paused-user-item">
      <div class="paused-user-info">
        <div class="paused-user-id">📱 ${formatUserId(user.userId)}</div>
        <div class="paused-user-time">
          ⏸️ Pausado hace: ${user.minutosTranscurridos} min<br>
          🔄 Auto-reactiva en: ${Math.max(0, Math.ceil(user.autoResumeIn / 60000))} min
        </div>
      </div>
      <div>
        <button class="btn btn-small btn-success" onclick="resumeUser('${user.userId}')">
          ▶️ Reanudar
        </button>
      </div>
    </div>
  `).join('');
}

// Agregar funciones para control real
async function pauseUser(userId) {
  try {
    const response = await fetch(`/api/pause/${userId}`, { method: "POST" });
    const result = await response.json();
    if (result.success) {
      refreshPausedUsers();
      refreshStats();
    } else {
      alert("Error: " + (result.error || result.message));
    }
  } catch (error) {
    alert("Error de conexión: " + error.message);
  }
}

async function resumeUser(userId) {
  try {
    const response = await fetch(`/api/resume/${userId}`, { method: "POST" });
    const result = await response.json();
    if (result.success) {
      refreshPausedUsers();
      refreshStats();
    } else {
      alert("Error: " + (result.error || result.message));
    }
  } catch (error) {
    alert("Error de conexión: " + error.message);
  }
}

async function pauseGlobal() {
  try {
    const response = await fetch("/api/pause-global", { method: "POST" });
    const result = await response.json();
    if (result.success) {
      refreshStats();
      alert("✅ Bot pausado globalmente");
    }
  } catch (error) {
    alert("Error de conexión: " + error.message);
  }
}

async function resumeGlobal() {
  try {
    const response = await fetch("/api/resume-global", { method: "POST" });
    const result = await response.json();
    if (result.success) {
      refreshStats();
      alert("✅ Bot reanudado");
    }
  } catch (error) {
    alert("Error de conexión: " + error.message);
  }
}

async function refreshStats() {
  try {
    const stats = await fetch("/api/stats").then(r => r.json());
    updateStats(stats);
  } catch (error) {
    console.error("Error refreshing stats:", error);
  }
}
```

---

### 5. Actualizar botones del HTML

**Archivo:** `public/index.html`
**Ubicación:** Modificar botones de control global (líneas 89-94)

```html
<!-- GLOBAL CONTROLS -->
<div class="control-buttons">
  <button class="btn btn-warning" onclick="pauseGlobal()">
    ⏸️ Pausar Bot Global
  </button>
  <button class="btn btn-success" onclick="resumeGlobal()">
    ▶️ Reanudar Bot Global
  </button>
</div>
```

**Cambiar** `onclick="showControlInfo()"` → `onclick="pauseGlobal()"` y `onclick="resumeGlobal()"`

---

## Validaciones Requeridas

### Estructura de pausas.json
El dashboard debe validar que el archivo tenga la estructura esperada:

```javascript
// En dashboard.js, función leerArchivoPausas()
function leerArchivoPausas() {
  try {
    const archivo = path.join(__dirname, "data", "pausas.json");
    if (fs.existsSync(archivo)) {
      const data = fs.readFileSync(archivo, "utf8");
      const parsed = JSON.parse(data);
      // Validar estructura
      if (typeof parsed.global !== "boolean") {
        parsed.global = false;
      }
      if (!parsed.usuarios || typeof parsed.usuarios !== "object") {
        parsed.usuarios = {};
      }
      return parsed;
    }
  } catch (error) {
    console.error("Error leyendo pausas:", error.message);
  }
  return { usuarios: {}, global: false };
}
```

---

## Notas Importantes

1. **Orden de inicio:** El bot debe iniciar ANTES que el dashboard para que la API interna esté disponible
2. **Puerto 3002:** Debe estar disponible y no bloqueado por firewall
3. **Consistencia:** Ambas fuentes de control escriben al mismo archivo `pausas.json`
4. **Logs:** Incluir logs en cada operación para trazabilidad

---

## Checklist de Implementación

- [ ] 1. Exportar `AUTO_RESUME_TIMEOUT_MS` desde `lib/validation.js`
- [ ] 2. Agregar API interna en `bot.js` (puerto 3002)
- [ ] 3. Modificar endpoints POST en `dashboard.js` para llamar al bot
- [ ] 4. Actualizar `public/app.js` con funciones reales
- [ ] 5. Actualizar botones en `public/index.html`
- [ ] 6. Agregar validación de estructura JSON
- [ ] 7. Probar: Control por WhatsApp
- [ ] 8. Probar: Control por Dashboard
- [ ] 9. Probar: Consistencia entre ambos métodos