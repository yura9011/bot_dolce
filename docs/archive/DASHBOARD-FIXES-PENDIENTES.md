# DASHBOARD FIXES PENDIENTES

**Fecha:** 2026-04-24
**Estado:** Pendiente - Aplicar cuando el bot no esté operativo

---

## 🔴 Problemas Críticos

### 1. Vulnerabilidad XSS en user ID
**Archivos:** `public/app.js:173, 180`
**Problema:** Los user ID se insertan directamente en onclick attributes sin escapar.

```javascript
// ❌ Actual (vulnerable)
onclick="resumeUser('${user.userId}')"

// ✅ Solución: Usar data attributes y addEventListener
<button class="btn btn-small btn-success" data-user-id="${user.userId}">
    ▶️ Reanudar
</button>

// En JavaScript:
document.addEventListener('click', (e) => {
    if (e.target.matches('[data-user-id]')) {
        const userId = e.target.dataset.userId;
        resumeUser(userId);
    }
});
```

**Riesgo:** Si un user ID malicioso contiene: `'); alert('XSS'); //` se ejecutará JS arbitrario.

---

### 2. node-fetch obsoleto
**Archivo:** `dashboard.js:10-12`
**Problema:** Node 18+ tiene `fetch` nativo global, el polyfill es innecesario.

```javascript
// ❌ Actual
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// ✅ Solución: Eliminar el polyfill y la dependencia
// Borrar estas líneas y ejecutar: npm uninstall node-fetch
```

**Beneficio:** Menos dependencias, código más limpio.

---

## ⚠️ Problemas Medios

### 3. Parsing de fechas frágil
**Archivo:** `dashboard.js:88-98`
**Problema:** Asume formato fijo `[dd/mm/yyyy]` en los logs.

```javascript
// ❌ Actual
const fecha = log.match(/\[(\d{2}\/\d{2}\/\d{4})/);
if (fecha) {
  const [, fechaLog] = fecha;
  const [dia, mes, año] = fechaLog.split('/');
  const fechaLogDate = new Date(`${año}-${mes}-${dia}`);
  return fechaLogDate.toDateString() === hoy;
}

// ✅ Solución: Usar timestamp numérico en los logs
// O leer el formato de fecha dinámicamente
const timestampMatch = log.match(/^\[([^\]]+)\]/);
if (timestampMatch) {
  const date = new Date(timestampMatch[1]);
  if (!isNaN(date)) {
    return date.toDateString() === hoy;
  }
}
```

---

### 4. Código muerto - Modal sin usar
**Archivos:** `public/app.js:344-357`, `public/index.html:147-179`
**Problema:** El modal `controlModal` y funciones `showControlInfo()`/`closeModal()` ya no se usan (los botones controlan el bot directamente).

```javascript
// ❌ Eliminar de app.js
function showControlInfo() {
    controlModal.style.display = 'block';
}
function closeModal() {
    controlModal.style.display = 'none';
}
// Y el event listener de window.onclick
```

```html
<!-- ❌ Eliminar de index.html -->
<div id="controlModal" class="modal">...</div>
```

---

### 5. Sin autenticación en dashboard
**Archivo:** `dashboard.js`
**Problema:** El milestone menciona "Autenticación básica" pero no está implementada. Cualquiera en la red puede:
- Ver conversaciones
- Pausar/reanudar el bot
- Ver logs de seguridad

**Solución sugerida:**
```javascript
// En dashboard.js, agregar middleware de auth
const basicAuth = require('express-basic-auth');

app.use('/api', basicAuth({
  users: { 'admin': process.env.DASHBOARD_PASS || 'dolceparty2026' },
  challenge: true,
  realm: 'Dolce Party Dashboard'
}));

// Para Socket.IO, validar en handshake
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (validateToken(token)) {
    next();
  } else {
    next(new Error('unauthorized'));
  }
});
```

---

## 💡 Mejoras de Rendimiento

### 6. Lectura ineficiente de logs
**Archivo:** `dashboard.js:69-80`
**Problema:** `leerLogs` lee TODO el archivo y luego hace split/filter. Para archivos grandes es ineficiente.

```javascript
// ✅ Solución: Usar stream o leer solo el final
const { tail } = require('fs');

function leerLogs(archivo, lineas = 50) {
  try {
    const rutaArchivo = path.join(__dirname, 'logs', archivo);
    if (fs.existsSync(rutaArchivo)) {
      // Usar readline o child_process para tail
      const { execSync } = require('child_process');
      const output = execSync(`tail -n ${lineas} "${rutaArchivo}"`, { encoding: 'utf8' });
      return output.split('\n').filter(l => l.trim());
    }
  } catch (error) {
    console.error(`Error leyendo ${archivo}:`, error.message);
  }
  return [];
}
```

---

### 7. Redundancia WebSocket + Polling
**Archivo:** `public/app.js:26, 294-304`
**Problema:** 
- WebSocket envía actualizaciones cada 10s (dashboard.js:270-274)
- Polling adicional cada 30s (app.js:26)

```javascript
// ❌ Actual en app.js
setInterval(refreshAllData, 30000); // Redundante

// ✅ Solución: Eliminar el polling y confiar en WebSocket
// O hacer polling solo si WebSocket se desconecta
```

---

### 8. Manejo de errores UX
**Archivo:** `public/app.js`
**Problema:** Los errores van solo a console.log. El usuario no sabe si algo falló.

**Solución sugerida:**
```javascript
function showNotification(message, type = 'error') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// En catch blocks:
} catch (error) {
  console.error('Error:', error);
  showNotification('Error de conexión: ' + error.message);
}
```

---

## 📝 Checklist para aplicar fixes

- [ ] 1. Arreglar XSS en app.js (cambiar onclick por data attributes)
- [ ] 2. Eliminar node-fetch (uninstall + borrar polyfill)
- [ ] 3. Mejorar parsing de fechas en dashboard.js
- [ ] 4. Eliminar código muerto (modal + funciones)
- [ ] 5. Implementar autenticación básica
- [ ] 6. Optimizar lectura de logs
- [ ] 7. Eliminar polling redundante
- [ ] 8. Agregar notificaciones UX para errores

---

## 🧪 Testing post-fixes

```bash
# 1. Iniciar solo dashboard (debe funcionar sin bot)
node dashboard.js

# 2. Iniciar bot + dashboard
.\start-all.bat

# 3. Probar en navegador
# - http://localhost:3001
# - Verificar que no hay errores en consola
# - Probar pausar/reanudar
# - Verificar que XSS no funciona (inyectar ' en user ID)
```

---

## 🆕 Nueva Funcionalidad: Responder desde el Dashboard

**Fecha:** 2026-04-24
**Referencia:** La referencia en `.gsd/FreeBirdsCrew_WhatsApp_AI_Bot` NO tiene esta funcionalidad - es solo monitoreo.

### Lo que se requiere

#### 1. **Backend (bot.js - puerto 3002)**
Agregar endpoint para enviar mensajes:

```javascript
// En bot.js, después de la API interna existente (línea ~135)
dashboardApi.post("/send-message", (req, res) => {
  const { userId, message } = req.body;
  
  if (!userId || !message) {
    return res.status(400).json({ success: false, error: "Faltan datos" });
  }
  
  if (!userId.includes("@")) {
    return res.status(400).json({ success: false, error: "userId inválido" });
  }
  
  client.sendMessage(userId, message)
    .then(() => {
      // Guardar en historial
      guardarEnHistorial(userId, "bot_manual", message);
      res.json({ success: true, message: "Mensaje enviado" });
    })
    .catch(err => res.status(500).json({ success: false, error: err.message }));
});
```

#### 2. **Backend (dashboard.js - puerto 3001)**
Endpoint que actúa como proxy:

```javascript
// Agregar después de los otros endpoints (línea ~249)
app.post('/api/send-message', async (req, res) => {
  try {
    const response = await fetch(`${BOT_API_URL}/send-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

#### 3. **Frontend (public/index.html)**
Agregar campo de texto en cada conversación:

```html
<!-- Después de los mensajes en líneas ~148-154 -->
<div class="conversation-item">
  <div class="conversation-header">
    <span class="conversation-user">👤 ${formatUserId(conv.userId)}</span>
    <span class="conversation-time">🕐 ${formatTime(conv.lastMessage)}</span>
  </div>
  <div class="messages">
    ${conv.messages.map(msg => `
      <div class="message ${msg.type}">
        ${msg.type === 'user' ? '👤' : '🤖'}: ${msg.text}
      </div>
    `).join('')}
  </div>
  <!-- NUEVO: Caja de respuesta -->
  <div class="reply-box">
    <input type="text" 
           id="reply-${conv.userId}" 
           class="reply-input" 
           placeholder="Escribir respuesta manual..."
           onkeypress="if(event.key==='Enter') sendReply('${conv.userId}')">
    <button class="btn btn-small btn-primary" onclick="sendReply('${conv.userId}')">
      📤 Enviar
    </button>
  </div>
</div>
```

#### 4. **Frontend (public/app.js)**
Agregar función para enviar respuestas:

```javascript
// Agregar después de las otras funciones de control (línea ~440)
async function sendReply(userId) {
  const input = document.getElementById(`reply-${userId}`);
  const message = input.value.trim();
  
  if (!message) {
    showNotification('Escribí un mensaje primero', 'warning');
    return;
  }
  
  try {
    const response = await fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message })
    });
    
    const result = await response.json();
    
    if (result.success) {
      input.value = '';
      showNotification('✅ Mensaje enviado', 'success');
      // Refrescar conversaciones para ver el mensaje
      setTimeout(refreshConversations, 500);
    } else {
      showNotification('Error: ' + (result.error || result.message), 'error');
    }
  } catch (error) {
    showNotification('Error de conexión: ' + error.message, 'error');
  }
}
```

#### 5. **Frontend (public/style.css)**
Agregar estilos para la caja de respuesta:

```css
/* Agregar después de .messages (línea ~269) */
.reply-box {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.reply-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.reply-input:focus {
  border-color: #667eea;
}

.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  z-index: 9999;
  animation: slideIn 0.3s ease;
}

.notification-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.notification-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.notification-warning {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### ⚠️ Consideraciones importantes

1. **El bot debe estar conectado a WhatsApp** - No puede enviar si no hay sesión activa
2. **Formato de userId** - Debe incluir `@s.whatsapp.net` para individuos o `@g.us` para grupos
3. **Escritura en historial** - Se debe guardar el mensaje manual en `historial.json` para que aparezca en la UI
4. **Notificación en tiempo real** - Emitir evento Socket.IO para que otros dashboards vean el mensaje enviado:

```javascript
// En bot.js, después de enviar mensaje exitosamente
io.emit('manual_message_sent', {
  userId,
  message,
  timestamp: Date.now()
});
```

5. **Validación de entrada** - Sanitizar el mensaje para evitar inyección de comandos
6. **Rate limiting** - Agregar límite de mensajes por minuto para evitar spam

### 📝 Checklist para implementar

- [ ] 1. Agregar endpoint `/send-message` en bot.js (puerto 3002)
- [ ] 2. Agregar endpoint `/api/send-message` en dashboard.js (puerto 3001)
- [ ] 3. Modificar `updateConversations()` en app.js para mostrar caja de respuesta
- [ ] 4. Agregar función `sendReply()` en app.js
- [ ] 5. Agregar estilos `.reply-box` y `.notification` en style.css
- [ ] 6. Implementar `showNotification()` si no existe
- [ ] 7. Agregar validación de entrada y sanitización
- [ ] 8. Emitir evento Socket.IO al enviar mensaje manual
- [ ] 9. Probar envío a números individuales y grupos
- [ ] 10. Documentar la nueva funcionalidad

---

**Notas:**
- Aplicar cuando el bot NO esté atendiendo clientes
- Hacer backup de archivos antes de modificar
- Probar en entorno local primero
- La referencia FreeBirdsCrew NO implementa esto - es una funcionalidad nueva
