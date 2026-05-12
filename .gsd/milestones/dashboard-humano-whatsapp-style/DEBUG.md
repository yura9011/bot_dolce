# Debug: Dashboard Humano v2 - Login 404

**Fecha**: 2026-05-11  
**Tipo**: Bug Investigation  
**Prioridad**: Alta

---

## 🐛 Síntoma

Al intentar hacer login en http://localhost:3001/login.html:
- El formulario se envía correctamente
- El navegador muestra error: "Error de conexión. Intenta nuevamente."
- La consola del navegador muestra: `Failed to load resource: the server responded with a status of 404 (Not Found)` en `api/auth/login:1`

---

## 🔍 Investigación

### Test 1: Verificar que el servidor está corriendo
```bash
✅ Servidor corriendo en http://0.0.0.0:3001
✅ Logs muestran: "Dashboard Humano corriendo en http://0.0.0.0:3001"
```

### Test 2: Probar ruta de login con PowerShell
```powershell
$body = @{username='admin';password='admin123'} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:3001/api/auth/login -Method POST -Body $body -ContentType 'application/json'
```

**Resultado**: 
```
Error: Cannot POST /api/auth/login
```

❌ **La ruta NO existe en el servidor**

### Test 3: Verificar sintaxis del código
```bash
node -c server.js
✅ Sin errores de sintaxis
```

### Test 4: Servidor de prueba mínimo
Creé `test-server.js` con una ruta simple:
```javascript
app.post('/api/auth/login', (req, res) => {
  res.json({ success: true });
});
```

**Resultado**: ✅ Funciona correctamente en puerto 3002

### Test 5: Verificar orden de middlewares
**Hipótesis inicial**: `express.static('public')` estaba ANTES de las rutas API, interceptando las peticiones.

**Acción**: Moví `express.static` al final del archivo (después de todas las rutas)

**Resultado**: ❌ Sigue sin funcionar

### Test 6: Verificar que las rutas se registran
Agregué logs de debug:
```javascript
console.log('🚀 Iniciando Dashboard Humano v2 - VERSIÓN CORREGIDA');
console.log('📝 Registrando rutas de autenticación...');
```

**Resultado**: ✅ Los logs aparecen, las rutas SÍ se están registrando

### Test 7: Probar otras rutas API
```powershell
# Probar ruta GET protegida
Invoke-WebRequest -Uri http://localhost:3001/api/chats
```

**Resultado**: ✅ Devuelve `{"error": "No autorizado"}` - La ruta funciona!

### Test 8: Probar ruta GET sin protección
Agregué ruta de prueba:
```javascript
app.get('/api/test', (req, res) => {
  res.json({ success: true });
});
```

**Resultado**: ❌ También devuelve `{"error": "No autorizado"}`

---

## 🎯 Descubrimiento Importante

**TODAS las rutas que empiezan con `/api` están devolviendo "No autorizado"**, incluso las que NO tienen el middleware `authenticateToken`.

Esto sugiere que hay un middleware global que está aplicando autenticación a todas las rutas `/api/*`.

---

## 🔍 Próxima Investigación

1. ✅ Buscar `app.use` con `authenticateToken` - **No encontrado**
2. ⏳ Revisar si hay algún middleware que intercepte rutas `/api/*`
3. ⏳ Verificar si Socket.IO está interfiriendo
4. ⏳ Revisar el archivo `middleware/auth.js` por si tiene lógica global

---

## 📝 Hallazgos Clave

1. ✅ El servidor está corriendo correctamente
2. ✅ Las rutas se están registrando
3. ✅ Express funciona (servidor de prueba funciona)
4. ✅ El problema NO es `express.static`
5. ✅ El problema NO es el orden de middlewares básicos
6. ❌ **TODAS las rutas `/api/*` devuelven "No autorizado"**
7. ❓ Hay algo que está interceptando TODAS las rutas API

---

## 🎯 Causa Raíz IDENTIFICADA ✅

**Había DOS procesos Node.js escuchando en el puerto 3001 simultáneamente:**
- PID 28924: Servidor viejo (probablemente del VPS que se bajó con scp)
- PID 26584: Servidor nuevo (el que yo estaba iniciando)

Cuando hacía peticiones a `localhost:3001`, el sistema operativo las enviaba al servidor viejo, que tenía rutas diferentes y devolvía "No autorizado" para todo.

**Solución**: Matar ambos procesos e iniciar solo el servidor correcto.

---

## ✅ Verificación Final

```powershell
$body = @{username='admin';password='admin123'} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:3001/api/auth/login -Method POST -Body $body -ContentType 'application/json'
```

**Resultado**: ✅ Status 200, respuesta correcta con token JWT

---

**Estado**: ✅ RESUELTO  
**Causa raíz**: Conflicto de puertos - dos servidores en el mismo puerto  
**Solución**: Matar procesos viejos antes de iniciar servidor nuevo  
**Lección aprendida**: Siempre verificar qué procesos están usando un puerto antes de asumir que el servidor correcto está corriendo  
**Última actualización**: 2026-05-11 21:00
