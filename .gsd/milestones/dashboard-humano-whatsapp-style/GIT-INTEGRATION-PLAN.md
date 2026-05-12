# Plan: Integrar Dashboard Humano v2 al Repositorio Git

**Fecha**: 2026-05-11  
**Tipo**: Repository Organization  
**Prioridad**: Alta  
**Duración Estimada**: 15 minutos

---

## 🎯 Objetivo

Agregar el Dashboard Humano v2 al repositorio Git para:
1. Versionarlo correctamente
2. Facilitar actualizaciones (local → git → VPS)
3. Mantener sincronizado entre entornos
4. Tener historial de cambios

---

## 📋 Archivos a Agregar

### Dashboard Humano v2
```
dashboard-humano-v2/
├── middleware/
│   └── auth.js
├── public/
│   ├── css/
│   ├── js/
│   ├── assets/
│   ├── index.html
│   └── login.html
├── server.js
├── package.json
└── package-lock.json
```

### Archivos Modificados
- `config/agents.json` (con dashboardUsers)
- `lib/agent-manager.js` (con fix de números ignorados)

### Documentación Nueva
- `.gsd/milestones/dashboard-humano-whatsapp-style/DEBUG.md`
- `.gsd/milestones/dashboard-humano-whatsapp-style/SUCCESS.md`
- `.gsd/milestones/dashboard-humano-whatsapp-style/FIX-LOGIN-BUG-PLAN.md`
- `.gsd/milestones/dashboard-humano-whatsapp-style/FIX-PLAN-V2.md`
- `.gsd/milestones/dashboard-humano-whatsapp-style/GIT-INTEGRATION-PLAN.md` (este archivo)

---

## 🔒 Archivos a Excluir (.gitignore)

Verificar que `.gitignore` excluya:
- `dashboard-humano-v2/node_modules/`
- `dashboard-humano-v2/.env` (si existe)
- Archivos de prueba temporales

---

## 📝 Commits a Realizar

### Commit 1: Agregar Dashboard Humano v2
```bash
git add dashboard-humano-v2/
git commit -m "feat(dashboard): Add Dashboard Humano v2 with authentication

- WhatsApp Web-style interface
- JWT authentication with httpOnly cookies
- User management in config/agents.json
- Real-time chat list and conversation area
- Socket.IO integration for live updates
- Rate limiting on login endpoint
- Bcrypt password hashing

Closes #dashboard-humano-milestone"
```

### Commit 2: Fix números ignorados
```bash
git add lib/agent-manager.js .env
git commit -m "fix(bot): Add return after admin check to ignore non-command messages

- Admins no longer receive bot responses for regular messages
- Only admin commands are processed
- Updated ADMIN_NUMBERS with WhatsApp IDs (not phone numbers)"
```

### Commit 3: Configuración de usuarios
```bash
git add config/agents.json
git commit -m "feat(config): Add dashboardUsers to agents.json

- Added 3 users: admin, maria, forma
- Passwords hashed with bcrypt
- Roles: admin and employee
- Required for Dashboard Humano v2 authentication"
```

### Commit 4: Documentación
```bash
git add .gsd/milestones/dashboard-humano-whatsapp-style/
git add .gsd/state/IMPLEMENTATION_PLAN.md
git commit -m "docs(dashboard): Add complete debugging and success documentation

- DEBUG.md: Full investigation process
- SUCCESS.md: Solution and verification
- Updated IMPLEMENTATION_PLAN.md with completed tasks"
```

---

## 🚀 Workflow Propuesto

### Flujo de Trabajo Ideal

```
┌─────────────┐
│   LOCAL     │  1. Desarrollar y probar
│  (tu PC)    │  2. Commit a git
└──────┬──────┘
       │ git push
       ↓
┌─────────────┐
│   GITHUB    │  3. Repositorio central
│  (remoto)   │  4. Historial de cambios
└──────┬──────┘
       │ git pull
       ↓
┌─────────────┐
│     VPS     │  5. Actualizar producción
│ (srv1658)   │  6. pm2 restart
└─────────────┘
```

### Comandos para Deploy

**En local** (después de hacer cambios):
```bash
git add .
git commit -m "feat: descripción del cambio"
git push origin main
```

**En VPS** (para actualizar):
```bash
ssh forma@srv1658334.hstgr.cloud
cd /home/forma/bot_dolce
git pull origin main
npm install  # si hay cambios en package.json
pm2 restart dashboard-humano-santa-ana
pm2 restart bot-dolce-prd  # si hay cambios en el bot
```

---

## ✅ Verificación

Después de hacer los commits:

1. **Verificar que todo está commiteado**:
```bash
git status
# Debería mostrar: "nothing to commit, working tree clean"
```

2. **Verificar que .gitignore funciona**:
```bash
git status --ignored
# node_modules/ debería aparecer como ignored
```

3. **Push a GitHub**:
```bash
git push origin main
```

4. **Verificar en GitHub**:
   - Abrir https://github.com/yura9011/bot_dolce
   - Verificar que `dashboard-humano-v2/` aparece
   - Verificar que los commits están ahí

---

## 📚 Beneficios

1. ✅ **Versionado**: Historial completo de cambios
2. ✅ **Sincronización**: Fácil actualizar VPS con `git pull`
3. ✅ **Backup**: GitHub como respaldo
4. ✅ **Colaboración**: Otros pueden ver y contribuir
5. ✅ **Rollback**: Fácil volver a versiones anteriores si algo falla

---

## 🚨 Importante

**ANTES de hacer push**:
- Verificar que NO hay contraseñas en texto plano
- Verificar que NO hay API keys expuestas
- Verificar que `.env` está en `.gitignore`
- Verificar que `node_modules/` está en `.gitignore`

---

**Estado**: 📋 Listo para ejecutar  
**Próximo paso**: Ejecutar commits en orden  
**Última actualización**: 2026-05-11 21:30
