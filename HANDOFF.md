# 🚨 LEÉ ESTO PRIMERO — Instrucciones para el Agente

> **Proyecto**: Bot WhatsApp multi-agente para cotillón (Dolce Party)
> **Framework**: GSD (`.gsd/`) — No inventes tu propio plan, seguí el que existe.

---

## 📋 REGLAS OBLIGATORIAS

### 1. LEÉ `IMPLEMENTATION_PLAN.md` AHORA
- `.gsd/state/IMPLEMENTATION_PLAN.md` → Única fuente de verdad sobre qué hay que hacer
- No empieces a codificar sin leer esto primero

### 2. PLAN BEFORE YOU BUILD
- No toques código sin un plan
- Si el plan no existe: preguntale al usuario antes de crear uno

### 3. STATE IS SACRED
- Después de CADA acción: actualizá `.gsd/state/IMPLEMENTATION_PLAN.md`
- Si no actualizaste el estado, no terminaste la tarea

### 4. ATOMIC COMMITS
- `git commit -m "feat(scope): descripción"`
- Commits chicos, uno por funcionalidad

### 5. VERIFY EMPIRICALLY
- Probá lo que hacés. No digas "funciona" sin verificarlo.

### 6. NO TOQUES RUNTIME DATA
- `data/` está en `.gitignore` — son archivos generados por el bot
- `config/admin-numbers.json` y `config/agents.json` son configuración, se pueden editar

---

## 🗺️ MAPA DEL PROYECTO

```
HANDOFF.md                  ← Estás acá
.gsd/state/IMPLEMENTATION_PLAN.md   ← Tareas actuales
.gsd/memory/journal/        ← Historial de sesiones anteriores
.gsd/config/AGENTS.md       ← Comandos de build/test/ralph
.gsd/config/PROMPT_build.md ← Prompt de build del framework GSD

dashboard-humano-v2/        ← Dashboard humano (Express + Socket.IO)
  ├── server.js             ← Backend (API + WebSocket)
  ├── public/               ← Frontend (HTML + JS + CSS)
  └── middleware/auth.js    ← Autenticación JWT

lib/                        ← Módulos del bot
  ├── agent-manager.js      ← Clase principal del agente WhatsApp
  ├── admin-commands.js     ← Comandos admin + números ignorados
  └── control-manual.js     ← Sistema de pausas

config/                     ← Configuración
  ├── agents.json           ← Agentes y usuarios dashboard
  └── admin-numbers.json    ← Números admin/ignorados (CRUD desde dashboard)

data/santa-ana/             ← Runtime data (NO EDITAR, está en .gitignore)
```

---

## 🚀 PRÓXIMOS PASOS (si no hay una tarea activa)

1. **Multi-Tenant Fase 2**: Dashboard Maestro (unificado para varios agentes)
2. **Dashboard Admin Management**: Agregar notificaciones al agregar/eliminar números
3. **Mejoras**: tests, monitoreo, SSL

---

## ⚠️ ERRORES COMETIDOS POR AGENTES ANTERIORES (no los repitas)

| Error | Consecuencia | Cómo evitarlo |
|-------|-------------|---------------|
| No leer IMPLEMENTATION_PLAN.md | Hicieron tareas incorrectas | Leer el plan primero |
| Commits enormes sin dividir | 250+ archivos en 1 commit | Commits atómicos |
| Trackear runtime data | `git pull` pisó historial producción | `data/` en `.gitignore` |
| No verificar empíricamente | Bugs que parecían fixes | Probar antes de commitear |
| Codificar sin plan XML | Refactor innecesario | Plan antes de código |

---

**¿Ya leíste `IMPLEMENTATION_PLAN.md`? Hacelo ahora antes de seguir.**
