# IMPLEMENTATION_PLAN.md

> **Dynamic Task Tracker for Ralph Loop Autonomous Execution**

---

## Current Status

**Project**: exp010-whatsappbot
**Phase**: Estabilización Multi-Agente (pre-onboarding Asturias)
**Last Updated**: 2026-05-14

---

## 🚨 Milestone Activo: Estabilización Multi-Agente

**Objetivo**: Garantizar que el sistema soporte 2 agentes (Santa Ana + Asturias) en paralelo sin errores.
**Pipeline**: Local → Testing (VPS) → Producción (VPS)
**Deadline**: Semana siguiente (onboarding Asturias)

### Problemas Detectados (Sesión /interrógame 2026-05-14)

| # | Problema | Archivo | Severidad |
|---|----------|---------|-----------|
| 1 | `admin-commands.js` importa funciones que no existen de `control-manual.js` | `lib/admin-commands.js:7-14` | 🔴 ALTO (comandos admin rotos) |
| 2 | `adminNumbers` singleton global compartido entre agentes | `lib/admin-commands.js` | 🔴 ALTO |
| 3 | `notificarDashboard()` usa env var global, ignora puerto por agente | `lib/agent-manager.js:903` | 🔴 ALTO |
| 4 | Dashboard server no se levanta automáticamente por agente | `orchestrator.js` | 🔴 ALTO |
| 5 | Media (imágenes, videos, docs, stickers) ignorados en silencio | `lib/agent-manager.js:244` | 🟡 MEDIO |
| 6 | Emojis en menú no manejados (usuario escribe 😊, bot no entiende) | `lib/agent-manager.js` | 🟡 MEDIO |
| 7 | `agents.json` inconsistencia: `enabled: false` en Asturias | `config/agents.json` | 🟢 BAJO |
| 8 | Catálogo Asturias apunta al mismo archivo que Santa Ana | `config/agents.json` | 🟢 BAJO (aceptado) |

---

## 📋 Plan de Estabilización

```
Fase 1: Foundation (cambios estructurales)
├── 1.1 Refactor admin-commands.js → factory pattern
├── 1.2 Mover admin-numbers.json a data/{agentId}/
├── 1.3 Convertir notificarDashboard() en método de instancia
└── 1.4 Arreglar BOT_API_PORT por agente en dashboard server

Fase 2: Multi-Agent Runtime
├── 2.1 Orchestrator: auto-levantar dashboard por agente
├── 2.2 Verificar aislamiento de sesiones WhatsApp (LocalAuth)
├── 2.3 Dashboard server: leer CONFIG_AGENT_ID de agents.json
└── 2.4 Probar 2 agentes en paralelo localmente

Fase 3: UX & Media
├── 3.1 Respuesta explícita por tipo de media no soportada
├── 3.2 Manejo de emojis en flujo de menú
└── 3.3 Validación de body vacío antes de procesar

Fase 4: Onboarding Asturias
├── 4.1 Habilitar asturias en agents.json
├── 4.2 Crear data/asturias/ con archivos iniciales
├── 4.3 Configurar números admin de Asturias
└── 4.4 Escanear QR de Asturias (sesión WhatsApp)

Fase 5: Testing (Local → Testing → Producción)
├── 5.1 Probar ambos agentes localmente
├── 5.2 Deploy a entorno testing en VPS
├── 5.3 Probar funcionalidad completa en testing
└── 5.4 Deploy a producción
```

---

## Current Tasks

### 🔴 Fase 1: Foundation (Prioridad Alta)

- [x] **1.1 Refactor admin-commands.js → factory pattern** ✅ 2026-05-14
  - Convertido singleton a `createAdminCommands(agentConfig, controlManager)`
  - Fix: imports rotos reemplazados por métodos del controlManager recibido
  - Cada AgentManager crea su propia instancia con sus propios admins
  - Commits: `9aed38d`

- [x] **1.2 Mover admin-numbers.json a data/{agentId}/** ✅ 2026-05-14
  - Migrado `config/admin-numbers.json` → `data/santa-ana/admin-numbers.json` y `data/asturias/admin-numbers.json`
  - Dashboard humano: CRUD ahora apunta a `DATA_PATH/admin-numbers.json`
  - Fallback chain: per-agent file → .env → agents.json
  - Commits: `d443156`

- [x] **1.3 Convertir notificarDashboard() en método de instancia** ✅ 2026-05-14
  - Movida función global a método `AgentManager.notificarDashboard(chatId)`
  - Usa `this.config.ports.dashboard` en vez de env var global
  - Commits: `09ada5e`

- [x] **1.4 BOT_API_PORT dinámico por agente** ✅ 2026-05-14
  - `dashboard-humano-v2/server.js`: agregado `getBotApiPort()` que lee desde agents.json
  - Reemplazados hardcodes de 3011 en ambos endpoints (message/finish)
  - Commits: <pending>

### 🟡 Fase 2: Multi-Agent Runtime (Prioridad Alta)

- [x] **2.1 Orchestrator auto-levanta dashboard por agente** ✅ 2026-05-14
  - Spawn proceso dashboard-humano-v2 con env vars correctas por agente
  - Graceful shutdown: mata dashboard al detener agente
  - Comando `list` muestra estado de dashboard
  - Commits: <pending>

- [ ] **2.2 Verificar aislamiento de sesiones WhatsApp**
  - Probar `LocalAuth` con clientId separados en mismo dataPath
  - `node orchestrator.js start` con ambos enabled → 2 QR distintos
  - Dependency: Ninguna

### 🟡 Fase 3: UX & Media (Prioridad Media)

- [ ] **3.1 Respuesta explícita por tipo de media**
  - image → "No puedo procesar imágenes, escribime por texto"
  - video → "No recibo videos, escribime tu consulta"
  - document → "No recibo documentos"
  - sticker → ignorar silenciosamente
  - location → "No proceso ubicaciones"
  - Dependency: Ninguna

- [ ] **3.2 Manejo de emojis en menú**
  - Detectar mensajes sin texto (solo emojis) en estados de menú
  - Responder pidiendo opción numérica
  - Dependency: Ninguna

### 🟢 Fase 4: Onboarding Asturias (Prioridad Alta)

- [ ] **4.1 Habilitar asturias en agents.json** (`enabled: true`)
- [ ] **4.2 Crear data/asturias/** con historial.json, pausas.json, admin-numbers.json
- [ ] **4.3 Configurar números admin de Asturias**
- [ ] **4.4 Escanear QR de Asturias** (sesión WhatsApp)
- [ ] Dependency: Fases 1-3 completadas

### 🟢 Fase 5: Testing Pipeline (Prioridad Alta)

- [ ] **5.1 Probar ambos agentes localmente**
  - Windows: node orchestrator.js start (los dos)
  - Verificar: respuestas, dashboards, comandos admin
- [ ] **5.2 Deploy a testing (VPS)**
  - git push → pull en bot_testing
  - Iniciar con agents.override.json para puertos de testing
- [ ] **5.3 Probar funcionalidad completa en testing**
  - Enviar mensajes desde WhatsApp real
  - Verificar notificaciones en tiempo real
  - Probar comandos admin
- [ ] **5.4 Deploy a producción**
  - git push → pull en bot_dolce
  - PM2 restart
  - Dependency: 5.3 ✅

---

### ✅ Milestone 1: Dual Environment Setup (COMPLETED)
**Status**: Production Ready  
**Completion Date**: 2026-05-10

**Achievements:**
- ✅ Production environment running on VPS (bot_dolce)
- ✅ Testing environment configured (bot_testing)
- ✅ Separate ports and configurations
- ✅ Dashboards accessible (ports 3000 and 4000)
- ✅ WhatsApp sessions isolated
- ✅ PM2 process management configured

**Current Production Setup:**
- **Production**: http://2.24.89.243:3000 (bot_dolce)
- **Testing**: http://2.24.89.243:4000 (bot_testing)
- **Ports**: PRD (3011, 3000) | DEV (4011, 4000)

---

### ✅ Milestone 2: Multi-Tenant Architecture - Phase 1 (COMPLETED)
**Status**: Foundation Complete  
**Completion Date**: 2026-05-10  
**Priority**: High

**Phase 1 Achievements:**
- ✅ Multi-tenant directory structure created
- ✅ Bot template extracted and refactored
- ✅ Configuration system with JSON Schema validation
- ✅ Automatic port management system
- ✅ Deployment automation scripts
- ✅ Complete documentation

**Deployed on VPS:**
- **Location**: `/home/forma/multi-tenant/`
- **Port Manager**: ✅ Functional
- **Config Validator**: ✅ Functional
- **Template**: ✅ Ready for cloning
- **Production**: ✅ Unaffected (bot_dolce still running)

---
### ✅ Milestone 4: Dashboard Redesign (COMPLETADO)
**Status**: Rediseño finalizado con éxito  
**Completion Date**: 2026-05-12

**Achievements:**
- ✅ Sistema de diseño base (Tokens) creado
- ✅ Biblioteca de componentes Atoms implementada
- ✅ Layout responsive y moderno (Shell)
- ✅ Vistas de Chats, Conversación, Config y Stats rediseñadas
- ✅ Animaciones y micro-interacciones pulidas
- ✅ Auditoría de accesibilidad y performance realizada
- ✅ Login rediseñado y unificado

---


## Notes

### Recent Changes (2026-05-11)
- ✅ **Dashboard Humano v2 - Deploy a Producción Completado**
  - git pull + PM2 restart en VPS
  - Login y CSS verificados en http://2.24.89.243:3001
  - Mensajes renderizados correctamente con ancho 65%
- ✅ **Dashboard Admin Management - Fase 1 Backend Completa**
  - CRUD API endpoints en server.js (GET, POST, PUT, DELETE)
  - config/admin-numbers.json con datos migrados
  - admin-commands.js ahora lee desde JSON con file watcher y fallback a .env
  - agent-manager.js reconoce roles "admin" e "ignorado"
  - Script de migración: scripts/migrate-admin-numbers.js
  - Frontend: vista configuración con tabs, lista, modal agregar
  - API endpoints verificados localmente
- ✅ **Dashboard Admin Management - Deploy a Producción Completado** 2026-05-12
  - Fix: runtime data files removidos de git tracking (data/ en .gitignore)
  - Fix: chatCount null error corregido (faltaba en refactor tabs)
  - historial.json restaurado via SCP al VPS
  - Deploy verificado en http://2.24.89.243:3001
- ✅ Completed dual environment setup on VPS
- ✅ Fixed firewall configuration for dashboard access
- ✅ Configured separate `.env` files for PRD and DEV
- ✅ Updated `agents.json` with different ports per environment
- ✅ Modified `dashboard-central.js` to listen on `0.0.0.0`
- ✅ **Phase 1 Complete**: Multi-tenant foundation deployed to VPS
  - Created `/home/forma/multi-tenant/` structure
  - Port manager and config validator functional
  - Template ready for client cloning
  - Deployment automation scripts created
- ✅ **Dashboard Humano v2 - Login Fix Complete**
  - Identificada causa raíz: conflicto de puertos (dos servidores en puerto 3001)
  - Configurados usuarios con bcrypt en `config/agents.json`
  - Login funciona correctamente en local
  - Usuario `forma` / `forma2026` agregado
  - Listo para deploy a producción

### Recent Changes (2026-05-12)
- ✅ **Dashboard fixes — renderizado, CSS, config.js bug Completado**
  - conversation.js: debug logging + error handling
  - config.js: fix renderAdminNumbers() escribía en adminNumbersList
  - server.js: chat preview multi-formato (text || texto || parts[0].text)
  - Patrón de formato inconsistente documentado en .gsd/memory/patterns/
- ✅ **Fix envío de mensajes + WebSocket tiempo real Completado**
  - server.js: message/finish endpoints escriben directo a historial.json y pausas.json
  - agent-manager.js: notificarDashboard() via HTTP local al dashboard
  - Endpoint interno /api/internal/new-message + Socket.IO broadcast
  - Limpieza variable BOT_API_URL huérfana + debug logs
  - Template multi-tenant actualizada
- ✅ **Testing environment visual differentiation Completado**
  - AGENT_ID / DATA_PATH dinámicos por env var
  - Banner naranja + header negro + sufijo [TEST] en testing
  - Endpoint /api/env para detección frontend
  - Datos separados: testing usa data/testing/, prod usa data/santa-ana/
  - Deploy: DASHBOARD_HUMANO_PORT=4002 DASHBOARD_AGENT_ID=testing NODE_ENV=development

### Next Steps
1. **Immediate**: Deploy a VPS y verificar en producción
2. **Short-term**: Review and approve multi-tenant milestone
3. **Medium-term**: Begin implementation of multi-tenant architecture
4. **Long-term**: Scale to multiple clients

### Important Links
- [Multi-Tenant Milestone](.gsd/milestones/multi-tenant-architecture/MILESTONE.md)
- [Client Config Example](.gsd/milestones/multi-tenant-architecture/client-config-example.txt)
- [Client Add Script Example](.gsd/milestones/multi-tenant-architecture/client-add-script-example.sh)



---

## 📦 Milestone Documentation

### Multi-Tenant Architecture Milestone

Complete documentation package created in `.gsd/milestones/multi-tenant-architecture/`:

#### 📄 Available Documents

1. **[README.md](../milestones/multi-tenant-architecture/README.md)**
   - Documentation index
   - Quick start guide
   - Status overview

2. **[EXECUTIVE_SUMMARY.md](../milestones/multi-tenant-architecture/EXECUTIVE_SUMMARY.md)**
   - Business case and ROI
   - Time/cost savings analysis
   - Investment vs return
   - Recommendation

3. **[MILESTONE.md](../milestones/multi-tenant-architecture/MILESTONE.md)**
   - Complete implementation plan
   - 6 phases with detailed tasks
   - Timeline and deliverables
   - Risk assessment

4. **[ARCHITECTURE_DIAGRAM.md](../milestones/multi-tenant-architecture/ARCHITECTURE_DIAGRAM.md)**
   - Visual architecture overview
   - Current vs target comparison
   - Data flow diagrams
   - Scaling capacity

5. **[client-config-example.txt](../milestones/multi-tenant-architecture/client-config-example.txt)**
   - Example client configuration
   - Configuration schema
   - Best practices

6. **[client-add-script-example.sh](../milestones/multi-tenant-architecture/client-add-script-example.sh)**
   - Automated client onboarding script
   - Complete workflow example
   - Error handling

---

## 🎯 Key Takeaways

### Current State (As of 2026-05-10)
- ✅ Production environment operational
- ✅ Testing environment configured
- ✅ Dual environment setup complete
- ✅ Ready for phone number change tomorrow

### Future State (After Multi-Tenant Implementation)
- 🎯 Single codebase for all clients
- 🎯 Add client in < 5 minutes
- 🎯 Support 100+ clients
- 🎯 Centralized management
- 🎯 Automated operations

### Business Impact
- **96% faster** client onboarding
- **90% reduction** in maintenance costs
- **10x growth** potential
- **Foundation** for SaaS platform

---

## 🚀 Recommended Next Steps

### Immediate (Next 24 hours)
1. ✅ Handle Dolce Party phone number change
2. ✅ Test procedure in DEV environment
3. ✅ Document the process

### Short-term (Next week)
1. Review multi-tenant milestone documentation
2. Approve or request changes
3. Estimate resources and timeline
4. Schedule kickoff meeting

### Medium-term (Next 4-6 weeks)
1. Execute Phase 1: Core Refactoring
2. Build automation scripts
3. Create unified dashboard
4. Migrate existing clients
5. Complete documentation

### Long-term (3+ months)
1. Onboard new clients rapidly
2. Scale to 20+ clients
3. Optimize performance
4. Consider SaaS offering

---

## 📊 Success Criteria

The multi-tenant implementation will be considered successful when:

- [ ] Add new client in < 5 minutes
- [ ] Zero port conflicts
- [ ] All clients in single dashboard
- [ ] 100% data isolation verified
- [ ] Zero downtime during client operations
- [ ] Migration completed with zero data loss
- [ ] Documentation complete
- [ ] Team trained on new system

---

**Last Updated**: 2026-05-14  
**Status**: Milestone Estabilización Multi-Agente activo — 9 tareas priorizadas  
**Next Milestone Review**: Antes de onboarding Asturias
