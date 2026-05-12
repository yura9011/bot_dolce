# Plan: Fix Login 404 - Dashboard Humano v2

**Fecha**: 2026-05-11  
**Tipo**: Bug Fix  
**Duración Estimada**: 10 minutos

---

## 🎯 Problema Identificado

**Causa Raíz**: El middleware `express.static('public')` está registrado ANTES de las rutas de API, causando que Express intente buscar archivos estáticos para `/api/auth/login` y devuelva 404 cuando no los encuentra.

**Ubicación**: `dashboard-humano-v2/server.js` línea 31

---

## 🔧 Solución

Mover `express.static('public')` DESPUÉS de todas las rutas de API, o configurarlo para que solo sirva archivos para rutas que NO empiecen con `/api`.

**Opción elegida**: Mover `express.static` al final, justo antes de iniciar el servidor.

---

## 📋 Cambios a Realizar

### Cambio 1: Mover express.static

**Archivo**: `dashboard-humano-v2/server.js`

**Antes** (líneas 28-31):
```javascript
// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
```

**Después**:
```javascript
// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
// express.static se mueve al final (después de las rutas)
```

**Y agregar al final** (antes de `server.listen`):
```javascript
// Servir archivos estáticos (DESPUÉS de las rutas API)
app.use(express.static('public'));

// ============================================
// INICIAR SERVIDOR
// ============================================
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Dashboard Humano corriendo en http://0.0.0.0:${PORT}`);
  console.log(`📊 Agente: ${AGENT_ID}`);
});
```

---

## 🧪 Plan de Testing

### Test 1: Verificar que la ruta de login funciona
```powershell
$body = @{username='admin';password='admin123'} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:3001/api/auth/login -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
```

**Esperado**: Status 200, respuesta JSON con `success: true`

### Test 2: Verificar que los archivos estáticos siguen funcionando
```powershell
Invoke-WebRequest -Uri http://localhost:3001/login.html -UseBasicParsing
```

**Esperado**: Status 200, HTML del login

### Test 3: Probar login desde el navegador
1. Abrir http://localhost:3001
2. Debe redirigir a `/login.html`
3. Ingresar: admin / admin123
4. Debe redirigir a `/index.html` (dashboard)

---

## ✅ Criterios de Éxito

- [ ] Ruta `/api/auth/login` responde correctamente (no 404)
- [ ] Login desde navegador funciona
- [ ] Archivos estáticos (HTML, CSS, JS) siguen sirviendo correctamente
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en logs del servidor

---

## 🚀 Ejecución

1. Hacer el cambio en `server.js`
2. Reiniciar servidor
3. Ejecutar tests 1, 2, 3
4. Si todos pasan → Documentar en DEBUG.md
5. Si alguno falla → Investigar y ajustar

---

**Estado**: 📋 Listo para ejecutar  
**Confianza**: Alta (causa raíz identificada)
