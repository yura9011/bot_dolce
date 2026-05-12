# Plan: Arreglar Bug de Login en Dashboard Humano v2

**Fecha**: 2026-05-11  
**Tipo**: Bug Fix  
**Prioridad**: Alta  
**Duración Estimada**: 30 minutos

---

## 🎯 Objetivo

Arreglar el bug del sistema de autenticación del Dashboard Humano v2 que causa que el login redirija a sí mismo en lugar de al dashboard principal.

---

## 🐛 Problema Identificado

**Síntoma**: Al hacer login, la página redirige de vuelta a `/login.html` en lugar de ir a `/index.html`

**Causa Raíz**: Desajuste entre cómo el cliente y el servidor manejan el JWT:
- **Servidor**: Envía JWT en cookie httpOnly
- **Cliente**: Intenta leer JWT de localStorage y enviarlo en header `Authorization`
- **Resultado**: El middleware de autenticación no encuentra el token y redirige a login

---

## 🔧 Solución

Sincronizar el manejo de JWT entre cliente y servidor para usar **cookies httpOnly** exclusivamente.

---

## 📋 Tareas

### Tarea 1: Actualizar `login.js` para usar cookies
**Archivo**: `dashboard-humano-v2/public/js/login.js`

**Cambios**:
1. Agregar `credentials: 'include'` al fetch de login
2. Eliminar `localStorage.setItem('token', data.token)`
3. Solo guardar flag de "recordarme" si aplica

**Verificación**: Login debe redirigir a `/index.html` correctamente

---

### Tarea 2: Actualizar `auth.js` para leer de cookies
**Archivo**: `dashboard-humano-v2/public/js/auth.js`

**Cambios**:
1. Modificar `getToken()` para retornar `null` (el navegador maneja la cookie automáticamente)
2. Agregar `credentials: 'include'` en `checkAuth()`
3. Agregar `credentials: 'include'` en `logout()`
4. Eliminar referencias a localStorage para el token

**Verificación**: `checkAuth()` debe validar correctamente sin errores

---

### Tarea 3: Actualizar `app.js` para incluir credentials
**Archivo**: `dashboard-humano-v2/public/js/app.js`

**Cambios**:
1. Agregar `credentials: 'include'` en `loadChats()`
2. Eliminar uso de `getToken()` y header `Authorization`

**Verificación**: Dashboard debe cargar chats correctamente después del login

---

### Tarea 4: Simplificar middleware de autenticación
**Archivo**: `dashboard-humano-v2/middleware/auth.js`

**Cambios**:
1. Leer token **solo** de `req.cookies.token`
2. Eliminar fallback a header `Authorization`

**Verificación**: Middleware debe validar correctamente el token de la cookie

---

### Tarea 5: Verificar otros archivos JS
**Archivos**: `conversation.js`, `chat-list.js`, `websocket.js`

**Cambios**:
- Revisar si hacen fetch a la API
- Agregar `credentials: 'include'` donde sea necesario

**Verificación**: Todas las peticiones deben incluir la cookie automáticamente

---

## 🧪 Plan de Testing

### Testing Local (PRIMERO)

1. **Instalar dependencias**:
```bash
cd dashboard-humano-v2
npm install
```

2. **Configurar entorno local**:
   - Copiar `.env` con configuración local
   - Verificar que `config/agents.json` tenga usuarios de prueba

3. **Iniciar servidor local**:
```bash
node server.js
```

4. **Probar flujo completo**:
   - [ ] Abrir http://localhost:3001
   - [ ] Debe redirigir a `/login.html`
   - [ ] Ingresar credenciales (admin/admin123)
   - [ ] Debe redirigir a `/index.html`
   - [ ] Dashboard debe cargar chats
   - [ ] Refrescar página → debe mantener sesión
   - [ ] Hacer logout → debe redirigir a login
   - [ ] Intentar acceder a `/index.html` sin login → debe redirigir a login

5. **Verificar en consola del navegador**:
   - [ ] No debe haber errores 401/403
   - [ ] Cookie `token` debe estar presente
   - [ ] Requests deben incluir cookie automáticamente

---

### Testing en VPS (DESPUÉS de local)

1. **Subir cambios al VPS**:
```bash
scp -r dashboard-humano-v2/public/js/*.js forma@srv1658334.hstgr.cloud:/home/forma/bot_dolce/dashboard-humano-v2/public/js/
scp dashboard-humano-v2/middleware/auth.js forma@srv1658334.hstgr.cloud:/home/forma/bot_dolce/dashboard-humano-v2/middleware/
```

2. **Reiniciar dashboard en PM2**:
```bash
ssh forma@srv1658334.hstgr.cloud "pm2 restart dashboard-humano-santa-ana"
```

3. **Probar en producción**:
   - [ ] Abrir http://2.24.89.243:3001
   - [ ] Repetir todos los tests del punto 4 anterior

---

## ✅ Criterios de Éxito

- [ ] Login funciona correctamente (redirige a dashboard)
- [ ] Dashboard carga chats después del login
- [ ] Sesión persiste al refrescar página
- [ ] Logout funciona correctamente
- [ ] No hay errores en consola del navegador
- [ ] Cookie httpOnly está presente y se envía automáticamente
- [ ] Middleware valida correctamente el JWT

---

## 🚨 Rollback Plan

Si algo falla en producción:

```bash
# Revertir cambios
ssh forma@srv1658334.hstgr.cloud "cd /home/forma/bot_dolce && git checkout dashboard-humano-v2/"

# Reiniciar
ssh forma@srv1658334.hstgr.cloud "pm2 restart dashboard-humano-santa-ana"
```

---

## 📝 Notas

- **NO modificar producción hasta probar local**
- **NO subir cambios sin verificar que funcionan**
- **Seguir el orden**: Local → Testing → Producción
- Los cambios ya están hechos localmente, solo falta probar

---

**Estado**: 📋 Listo para ejecutar  
**Próximo paso**: Testing local
