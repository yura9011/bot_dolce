# Milestone: Gestión Dinámica de Números Admin desde Dashboard

**Prioridad**: Media  
**Tipo**: Feature Enhancement  
**Duración Estimada**: 2-3 horas  
**Estado**: 📋 Planificado

---

## 🎯 Objetivo

Permitir gestionar dinámicamente los números de WhatsApp que son tratados como **admin** (pueden ejecutar comandos) o **ignorados** (el bot no les responde) directamente desde el Dashboard Humano, sin necesidad de editar `.env` y reiniciar el bot.

---

## 📊 Problema Actual

### Situación Actual:
- ✅ Sistema de números admin funciona (definidos en `.env`)
- ✅ Bot ignora mensajes de admins que no son comandos
- ❌ Para agregar/quitar admins hay que:
  1. Editar `.env` manualmente
  2. Reiniciar el bot con PM2
  3. Esperar a que se reconecte WhatsApp
- ❌ No hay visibilidad de qué números están configurados
- ❌ Proceso lento y propenso a errores

### Impacto:
- Empleados nuevos requieren intervención técnica
- Empleados que se van quedan con acceso
- No se puede hacer cambios rápidos en producción
- Difícil de auditar quién tiene acceso

---

## 🎨 Solución Propuesta

### Dashboard con Gestión de Números Admin

**Características principales**:
1. **Vista de números admin** - Lista actual de números configurados
2. **Agregar número** - Botón para agregar nuevo admin
3. **Quitar número** - Botón para remover admin
4. **Sincronización en tiempo real** - Sin reiniciar bot
5. **Persistencia** - Guardar en archivo JSON (no `.env`)
6. **Roles** - Diferenciar entre "admin" (comandos) e "ignorado" (no responde)

---

## 📐 Diseño Detallado

### UI del Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  🎈 Dolce Party - Santa Ana                    [👤 Forma] [⚙️]  │
├──────────────────┬──────────────────────────────────────────────┤
│                  │                                              │
│  📱 Chats (3)    │  ⚙️ Configuración de Números                │
│  ─────────────   │  ─────────────────────────────────────────  │
│                  │                                              │
│  🔍 Buscar...    │  👥 Números Admin (3)                       │
│                  │  ┌────────────────────────────────────────┐ │
│  [Chats]         │  │ 📱 +54 911 5864 7529                   │ │
│  [⚙️ Config]     │  │    Rol: Admin                      [❌] │ │
│                  │  └────────────────────────────────────────┘ │
│                  │                                              │
│                  │  ┌────────────────────────────────────────┐ │
│                  │  │ 📱 +54 935 1378 2559                   │ │
│                  │  │    Rol: Admin                      [❌] │ │
│                  │  └────────────────────────────────────────┘ │
│                  │                                              │
│                  │  ┌────────────────────────────────────────┐ │
│                  │  │ 📱 +1 193 4014 5860                    │ │
│                  │  │    Rol: Ignorado                   [❌] │ │
│                  │  └────────────────────────────────────────┘ │
│                  │                                              │
│                  │  [➕ Agregar Número]                        │
│                  │                                              │
│                  │  ─────────────────────────────────────────  │
│                  │                                              │
│                  │  💡 Tip: Los números "Admin" pueden         │
│                  │  ejecutar comandos. Los "Ignorados" no      │
│                  │  reciben respuestas del bot.                │
│                  │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

### Modal para Agregar Número

```
┌─────────────────────────────────────┐
│  ➕ Agregar Número                  │
├─────────────────────────────────────┤
│                                     │
│  Número de WhatsApp:                │
│  ┌───────────────────────────────┐  │
│  │ 5491158647529                 │  │
│  └───────────────────────────────┘  │
│  (Sin espacios ni símbolos)         │
│                                     │
│  Rol:                               │
│  ○ Admin (puede ejecutar comandos)  │
│  ○ Ignorado (bot no responde)       │
│                                     │
│  Nombre (opcional):                 │
│  ┌───────────────────────────────┐  │
│  │ María González                │  │
│  └───────────────────────────────┘  │
│                                     │
│  [Cancelar]  [Agregar]              │
│                                     │
└─────────────────────────────────────┘
```

---

## 🛠️ Implementación Técnica

### Arquitectura

**Backend**:
- Nuevo archivo: `config/admin-numbers.json`
- API endpoints para CRUD de números
- Sincronización con bot sin reiniciar

**Frontend**:
- Nueva vista: "Configuración"
- Componente de lista de números
- Modal para agregar/editar

### Estructura de Datos

**config/admin-numbers.json**:
```json
{
  "admins": [
    {
      "id": "5491158647529",
      "nombre": "Tamara",
      "rol": "admin",
      "agregadoPor": "forma",
      "fechaAgregado": "2026-05-11T22:00:00Z"
    },
    {
      "id": "5493513782559",
      "nombre": "María",
      "rol": "admin",
      "agregadoPor": "forma",
      "fechaAgregado": "2026-05-11T22:00:00Z"
    },
    {
      "id": "119340145860821",
      "nombre": "Empleado 1",
      "rol": "ignorado",
      "agregadoPor": "forma",
      "fechaAgregado": "2026-05-11T22:00:00Z"
    }
  ]
}
```

### API Endpoints

```javascript
// GET /api/admin-numbers - Obtener lista de números
// POST /api/admin-numbers - Agregar número
// DELETE /api/admin-numbers/:id - Eliminar número
// PUT /api/admin-numbers/:id - Actualizar rol
```

### Sincronización con Bot

**Opción 1: Polling** (más simple)
```javascript
// En agent-manager.js
setInterval(() => {
  this.recargarAdminNumbers();
}, 30000); // Cada 30 segundos
```

**Opción 2: WebSocket** (más eficiente)
```javascript
// Dashboard emite evento cuando cambia
socket.emit('admin_numbers_updated');

// Bot escucha y recarga
socket.on('admin_numbers_updated', () => {
  this.recargarAdminNumbers();
});
```

**Opción 3: File Watcher** (más robusto)
```javascript
// Bot observa cambios en admin-numbers.json
fs.watch('config/admin-numbers.json', () => {
  this.recargarAdminNumbers();
});
```

### Migración desde .env

**Script de migración**:
```javascript
// scripts/migrate-admin-numbers.js
const fs = require('fs');
require('dotenv').config();

const adminNumbers = process.env.ADMIN_NUMBERS.split(',').map(n => n.trim());

const config = {
  admins: adminNumbers.map(id => ({
    id,
    nombre: "Migrado desde .env",
    rol: "admin",
    agregadoPor: "sistema",
    fechaAgregado: new Date().toISOString()
  }))
};

fs.writeFileSync('config/admin-numbers.json', JSON.stringify(config, null, 2));
console.log('✅ Migración completada');
```

---

## 📋 Tareas de Implementación

### Fase 1: Backend (1 hora)

- [ ] **1.1** Crear estructura de datos
  - Crear `config/admin-numbers.json`
  - Script de migración desde `.env`
  - Validación de formato

- [ ] **1.2** API REST
  - GET /api/admin-numbers
  - POST /api/admin-numbers
  - DELETE /api/admin-numbers/:id
  - PUT /api/admin-numbers/:id
  - Middleware de autenticación (solo admins)

- [ ] **1.3** Integración con bot
  - Modificar `lib/admin-commands.js` para leer de JSON
  - Implementar recarga dinámica (file watcher)
  - Mantener compatibilidad con `.env` (fallback)

### Fase 2: Frontend (1 hora)

- [ ] **2.1** Vista de configuración
  - Nueva ruta `/config` en dashboard
  - Botón en sidebar para acceder
  - Layout de la vista

- [ ] **2.2** Lista de números
  - Componente de lista
  - Mostrar número, nombre, rol
  - Botón de eliminar por número
  - Indicador de rol (badge)

- [ ] **2.3** Modal agregar número
  - Formulario con validación
  - Input de número (solo dígitos)
  - Selector de rol (admin/ignorado)
  - Input de nombre opcional

### Fase 3: Testing y Ajustes (30 min)

- [ ] **3.1** Testing funcional
  - Agregar número desde dashboard
  - Verificar que bot lo reconoce sin reiniciar
  - Eliminar número
  - Cambiar rol

- [ ] **3.2** Testing de seguridad
  - Solo admins pueden acceder a /config
  - Validación de formato de números
  - No permitir duplicados

- [ ] **3.3** Documentación
  - Actualizar README.md
  - Documentar API endpoints
  - Guía de migración desde .env

---

## ✅ Criterios de Aceptación

### Funcionales:
- [ ] Dashboard muestra lista de números admin/ignorados
- [ ] Agregar número funciona y se refleja inmediatamente
- [ ] Eliminar número funciona
- [ ] Bot reconoce cambios sin reiniciar (< 30 segundos)
- [ ] Migración desde .env funciona correctamente
- [ ] Roles "admin" e "ignorado" funcionan como esperado

### Seguridad:
- [ ] Solo usuarios con rol "admin" pueden acceder a /config
- [ ] Validación de formato de números (solo dígitos)
- [ ] No permitir duplicados
- [ ] Logs de auditoría (quién agregó/eliminó qué)

### UX:
- [ ] Interfaz intuitiva y clara
- [ ] Feedback inmediato al agregar/eliminar
- [ ] Mensajes de error claros
- [ ] Confirmación antes de eliminar

---

## 🔄 Compatibilidad con .env

Para mantener compatibilidad con configuración existente:

```javascript
// lib/admin-commands.js
function cargarAdminNumbers() {
  // Prioridad 1: Leer de JSON
  if (fs.existsSync('config/admin-numbers.json')) {
    const config = JSON.parse(fs.readFileSync('config/admin-numbers.json'));
    return config.admins.map(a => a.id);
  }
  
  // Prioridad 2: Fallback a .env
  if (process.env.ADMIN_NUMBERS) {
    return process.env.ADMIN_NUMBERS.split(',').map(n => n.trim());
  }
  
  return [];
}
```

---

## 📊 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Tiempo para agregar admin | < 30 segundos |
| Tiempo de sincronización | < 30 segundos |
| Errores al agregar | < 1% |
| Adopción por usuarios | > 80% usan dashboard vs .env |

---

## 🚀 Deployment

### Desarrollo:
```bash
# Migrar números existentes
node scripts/migrate-admin-numbers.js

# Iniciar dashboard
cd dashboard-humano-v2
npm run dev
```

### Producción:
```bash
# En VPS
cd /home/forma/bot_dolce

# Migrar números
node scripts/migrate-admin-numbers.js

# Reiniciar servicios
pm2 restart dashboard-humano-santa-ana
pm2 restart bot-dolce-prd

# Verificar
pm2 logs dashboard-humano-santa-ana --lines 50
```

---

## 🔗 Relación con Otros Milestones

- **Dashboard Humano WhatsApp Style**: Extiende funcionalidad del dashboard
- **Multi-Tenant Architecture**: Cada cliente tendrá su propia lista de admins

---

## 📝 Notas Adicionales

### Consideraciones:
- Mantener `.env` como fallback para compatibilidad
- Agregar logs de auditoría para seguridad
- Considerar límite de números admin (ej: máximo 10)
- Validar que número existe en WhatsApp antes de agregar

### Futuras Mejoras:
- Importar números desde CSV
- Exportar lista de admins
- Historial de cambios (quién agregó/eliminó cuándo)
- Notificaciones cuando se agrega/elimina admin
- Permisos granulares (algunos admins solo pueden pausar, otros todo)
- Integración con sistema de usuarios del dashboard

---

## 🎯 Valor de Negocio

### Beneficios:
- ✅ **Agilidad**: Agregar/quitar admins en segundos
- ✅ **Seguridad**: Auditoría de cambios
- ✅ **Autonomía**: No requiere conocimientos técnicos
- ✅ **Escalabilidad**: Fácil gestionar múltiples empleados
- ✅ **Visibilidad**: Ver quién tiene acceso en todo momento

### ROI:
- **Antes**: 5-10 minutos por cambio (editar .env, reiniciar, verificar)
- **Después**: 30 segundos por cambio (click en dashboard)
- **Ahorro**: 90% de tiempo en gestión de accesos

---

**Creado**: 2026-05-11  
**Última actualización**: 2026-05-11  
**Estado**: 📋 Planificado  
**Prioridad**: Media
