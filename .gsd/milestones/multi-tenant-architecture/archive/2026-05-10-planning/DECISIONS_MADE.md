# Decisiones Tomadas - Arquitectura Multi-Tenant

**Fecha:** 2026-05-10  
**Decisor:** Product Owner  
**Status:** ✅ Aprobado para implementación

---

## 📋 Resumen de Decisiones

### 1. Data Isolation Strategy
**Decisión:** ✅ **Opción C - Hybrid**
- Datos operacionales: DB por cliente (SQLite)
- Datos de monitoreo: DB compartida (para dashboard maestro)

**Justificación:**
- Aislamiento total de datos de clientes
- Fácil de mantener con 5-10 clientes
- Dashboard maestro puede agregar métricas

---

### 2. Update & Deployment Strategy
**Decisión:** ✅ **Opción B - Script Semi-Automático**

**Plan:**
- Crear `update-client.sh` script
- Proceso: backup → pull → restart → verify
- Rollback automático si falla
- Ejecutado manualmente por admin

**Próximos pasos:**
- Diseñar script en Fase 1
- Implementar en Fase 2

---

### 3. Monitoring & Alerting
**Decisión:** ✅ **Opción B - Dashboard + Notificaciones**

**Implementación:**
- Dashboard maestro (port 3000) - Vista de todos los clientes
- Notificaciones automáticas cuando:
  - Bot se cae
  - Error rate > 5%
  - No mensajes en 1 hora (si debería haber)
  
**Canales de notificación:**
- Email (prioritario)
- WhatsApp (opcional, a definir)

---

### 4. Backup Strategy
**Decisión:** ✅ **Opción C - Automático Diario** (a evaluar frecuencia)

**Plan inicial:**
- Backup automático vía cron job
- Frecuencia: A definir (diario vs semanal)
- Ubicación: A definir (mismo servidor vs cloud)

**Acción requerida:**
- Evaluar frecuencia óptima
- Decidir ubicación de backups
- Implementar en Fase 2

---

### 5. Client Onboarding Process
**Decisión:** ✅ **Opción B - Script Semi-Automático**

**Implementación:**
```bash
./scripts/add-client.sh

# Prompts:
# - Nombre del cliente
# - Datos de contacto
# - Configuración inicial
# - Catálogo (opcional)

# Output:
# - Estructura de carpetas creada
# - Puertos asignados
# - PM2 configurado
# - Firewall abierto
# - Listo para escanear QR
```

**Tiempo estimado:** 10-15 minutos por cliente

---

### 6. Customization Level
**Decisión:** ✅ **Opción B - Config-Based Customization**

**Implementación:**
```json
{
  "client_id": "dolce-party",
  "branding": {
    "name": "Dolce Party",
    "colors": {...},
    "logo": "..."
  },
  "features": {
    "voice_messages": false,
    "payments": false,
    "custom_flows": false
  },
  "business": {
    "phone": "...",
    "address": "...",
    "hours": "..."
  }
}
```

**Beneficios:**
- Flexible sin tocar código
- Fácil de mantener
- Escalable

**Nota:** Si un cliente necesita customización de código, se evalúa caso por caso.

---

### 7. Pricing & Billing
**Decisión:** ✅ **Subscripción Mensual**

**Modelo:**
- Cobro mensual por subscripción
- Estructura de precios: A definir
- Tracking de uso: Opcional (para métricas internas)

**Pendiente:**
- Definir tiers (Básico, Pro, Enterprise)
- Definir precios por tier
- Decidir si trackear uso para futuro pricing

---

### 8. Support & SLA
**Decisión:** ⏸️ **Indefinido - A evaluar**

**Consideraciones:**
- Empezar con best effort
- Definir SLA cuando haya más clientes
- Evaluar necesidad de soporte 24/7

**Acción futura:**
- Definir en Fase 2 o 3
- Basado en feedback de primeros clientes

---

### 9. Scaling Strategy
**Decisión:** ⏸️ **No planteado aún**

**Plan tentativo:**
- Empezar con servidor actual (4GB RAM)
- Monitorear uso de recursos
- Escalar verticalmente cuando sea necesario
- Evaluar horizontal si > 50 clientes

**Triggers para escalar:**
- CPU > 70% sostenido
- RAM > 80% sostenido
- Response time > 3 segundos

---

### 10. Security & Compliance
**Decisión:** ✅ **Protección de Datos Personales (Argentina)**

**Ley 25.326 - Consideraciones:**
- ✅ Consentimiento para guardar datos
- ✅ Derecho a borrar datos (implementar)
- ✅ Seguridad de datos (backups, acceso)

**Implementación:**
- Agregar términos y condiciones
- Implementar función "borrar mis datos"
- Documentar políticas de privacidad

**Pendiente:**
- Revisar compliance completo
- Consultar con legal si es necesario
- Implementar en Fase 2

---

## 🎯 Arquitectura Resultante

### Estructura de Archivos
```
/home/forma/
├── dashboard-maestro/              → Port 3000 (TU control)
│   ├── server.js
│   ├── monitoring.db              → Métricas agregadas
│   └── config.json                → Lista de clientes
│
└── clients/
    ├── dolce-party/
    │   ├── dashboard-cliente.js   → Port 5000 (Cliente ve sus locales)
    │   ├── config.json            → Configuración del cliente
    │   │
    │   ├── santa-ana/             → Local 1
    │   │   ├── bot/               → Código del bot
    │   │   ├── dashboard-humano/  → Port 5001 (Conversaciones)
    │   │   ├── data/
    │   │   │   └── database.sqlite  ← DB aislada
    │   │   ├── .wwebjs_auth/      ← Sesión WhatsApp
    │   │   └── catalogs/
    │   │
    │   └── centro/                → Local 2
    │       └── [misma estructura]
    │
    └── cliente-2/
        └── [misma estructura]
```

### Puertos Asignados
```
3000       → Dashboard Maestro (admin)

Cliente 1 (Dolce Party):
5000       → Dashboard Cliente
5001       → Bot Santa Ana (API + Dashboard Humano)
5002       → Bot Centro (API + Dashboard Humano)

Cliente 2:
5010       → Dashboard Cliente
5011       → Bot Local 1 (API + Dashboard Humano)

Cliente N:
5000+(N×10) → Dashboard Cliente
5001+(N×10) → Bot Local 1
...
```

### Scripts a Crear
```
scripts/
├── add-client.sh              → Agregar cliente nuevo
├── update-client.sh           → Actualizar un cliente
├── update-all-clients.sh      → Actualizar todos
├── backup-client.sh           → Backup de un cliente
├── backup-all.sh              → Backup de todos
├── remove-client.sh           → Remover cliente
└── health-check.sh            → Verificar estado de todos
```

---

## 📊 Niveles de Dashboards

### Nivel 1: Dashboard Maestro (Port 3000)
**Usuarios:** Vos (admin/operador)  
**Funciones:**
- Ver TODOS los clientes
- Ver TODOS los bots
- Métricas agregadas
- Start/Stop cualquier bot
- Logs centralizados
- Alertas y notificaciones

### Nivel 2: Dashboard Cliente (Ports 5000, 5010, 5020...)
**Usuarios:** Cliente (ej: Dueño de Dolce Party)  
**Funciones:**
- Ver SOLO sus locales
- Estadísticas de sus bots
- Acceso a dashboards humanos de sus locales
- NO puede ver otros clientes

### Nivel 3: Dashboard Humano (Ports 5001, 5002, 5011...)
**Usuarios:** Empleados del cliente (ej: Vendedor de Santa Ana)  
**Funciones:**
- Ver conversaciones en tiempo real
- Tomar control de conversación
- Responder como humano
- Ver historial
- Estadísticas del local

---

## ✅ Próximos Pasos

### Inmediato (Esta semana)
1. ✅ Decisiones documentadas
2. ⏳ Diseñar arquitectura detallada
3. ⏳ Crear milestone actualizado
4. ⏳ Estimar timeline

### Corto Plazo (Próximas 2 semanas)
1. Implementar estructura base
2. Crear scripts de onboarding
3. Desarrollar dashboard maestro básico
4. Sistema de notificaciones

### Mediano Plazo (Próximas 4-6 semanas)
1. Migrar Dolce Party a nueva estructura
2. Implementar backups automáticos
3. Refinar monitoring
4. Documentación completa

---

## 📝 Notas Adicionales

### Decisiones Pendientes
- Frecuencia exacta de backups (diario vs semanal)
- Ubicación de backups (servidor vs cloud)
- Estructura de pricing (tiers y precios)
- SLA y soporte (definir en futuro)
- Plan de scaling (cuando sea necesario)

### Riesgos Identificados
- ⚠️ Compliance legal (revisar con abogado)
- ⚠️ Backup strategy (definir ubicación segura)
- ⚠️ Scaling (monitorear recursos)

### Oportunidades
- ✅ Arquitectura flexible (permite growth)
- ✅ Scripts automatizan operaciones
- ✅ Dashboard maestro da control total
- ✅ Config-based permite customización

---

**Status:** ✅ Listo para diseño detallado e implementación  
**Próximo documento:** Arquitectura final detallada con estas decisiones
