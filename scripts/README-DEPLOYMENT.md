# 🚀 Scripts de Deployment - Multi-Tenant

Scripts para automatizar el deployment y sincronización entre local y VPS.

---

## 📋 Scripts Disponibles

### 1. `deploy-multitenant.sh` / `deploy-multitenant.ps1`
**Propósito**: Deployment completo de multi-tenant al VPS

**Uso**:
```bash
# Linux/Mac
./scripts/deploy-multitenant.sh

# Windows PowerShell
.\scripts\deploy-multitenant.ps1
```

**Opciones**:
- `--skip-git` / `-SkipGit`: Saltar operaciones de git
- `--skip-backup` / `-SkipBackup`: Saltar backup en VPS

**Qué hace**:
1. ✅ Verifica cambios locales
2. 📦 Commit y push a git (opcional)
3. 💾 Backup en VPS (opcional)
4. 🚀 Sincroniza archivos al VPS
5. ⚙️ Configura permisos y dependencias
6. 🔍 Verifica instalación
7. ✅ Confirma que producción sigue funcionando

**Ejemplo**:
```bash
# Deployment completo
./scripts/deploy-multitenant.sh

# Sin git (si ya hiciste commit)
./scripts/deploy-multitenant.sh --skip-git

# Sin backup (primera instalación)
./scripts/deploy-multitenant.sh --skip-backup
```

---

### 2. `quick-update.sh`
**Propósito**: Actualización rápida de solo archivos modificados

**Uso**:
```bash
./scripts/quick-update.sh
```

**Qué hace**:
1. 📝 Detecta archivos modificados (git diff)
2. 📤 Sube solo esos archivos al VPS
3. 🔐 Actualiza permisos si es necesario
4. 📦 Reinstala dependencias si cambió package.json

**Cuándo usar**:
- Cambios pequeños (1-3 archivos)
- Desarrollo iterativo rápido
- No quieres hacer commit todavía

**Ejemplo**:
```bash
# Editaste port-manager.js
nano multi-tenant/scripts/port-manager.js

# Actualización rápida
./scripts/quick-update.sh
```

---

### 3. `pull-from-vps.sh`
**Propósito**: Traer cambios del VPS a local

**Uso**:
```bash
./scripts/pull-from-vps.sh
```

**Qué hace**:
1. 💾 Backup local automático
2. ⬇️ Descarga archivos del VPS
3. 📊 Muestra diferencias con git

**Cuándo usar**:
- Hiciste cambios directamente en el VPS
- Quieres sincronizar configuraciones del VPS
- Debugging en producción

**Ejemplo**:
```bash
# Hiciste cambios en VPS
ssh forma@srv1658334.hstgr.cloud
nano /home/forma/multi-tenant/config/port-registry.json
exit

# Traer cambios a local
./scripts/pull-from-vps.sh

# Revisar y commitear
git diff multi-tenant/
git add multi-tenant/
git commit -m "sync: updated port registry from VPS"
```

---

## 🔄 Flujos de Trabajo Comunes

### Flujo 1: Desarrollo Normal
```bash
# 1. Hacer cambios localmente
nano multi-tenant/scripts/port-manager.js

# 2. Probar localmente (si es posible)
node multi-tenant/scripts/port-manager.js list

# 3. Deploy completo
./scripts/deploy-multitenant.sh

# 4. Verificar en VPS
ssh forma@srv1658334.hstgr.cloud
cd /home/forma/multi-tenant
node scripts/port-manager.js list
```

### Flujo 2: Cambios Rápidos
```bash
# 1. Editar archivo
nano multi-tenant/config/client-example.json

# 2. Update rápido (sin commit)
./scripts/quick-update.sh

# 3. Probar en VPS
ssh forma@srv1658334.hstgr.cloud "cd /home/forma/multi-tenant && node scripts/validate-config.js config/client-example.json"

# 4. Si funciona, commitear
git add multi-tenant/
git commit -m "fix: updated client example"
git push
```

### Flujo 3: Hotfix en Producción
```bash
# 1. Conectar a VPS y hacer fix
ssh forma@srv1658334.hstgr.cloud
nano /home/forma/multi-tenant/scripts/port-manager.js
# ... hacer cambios ...
exit

# 2. Traer cambios a local
./scripts/pull-from-vps.sh

# 3. Revisar cambios
git diff multi-tenant/

# 4. Commitear
git add multi-tenant/
git commit -m "hotfix: fixed port allocation bug"
git push
```

---

## ⚙️ Configuración Inicial

### Requisitos
- SSH configurado con clave pública (sin password)
- Git configurado
- rsync instalado (recomendado)

### Setup SSH sin Password

```bash
# Generar clave SSH (si no tienes)
ssh-keygen -t rsa -b 4096

# Copiar clave al VPS
ssh-copy-id forma@srv1658334.hstgr.cloud

# Probar conexión
ssh forma@srv1658334.hstgr.cloud "echo 'SSH OK'"
```

### Dar Permisos a Scripts

```bash
# Linux/Mac
chmod +x scripts/*.sh

# Windows (Git Bash)
git update-index --chmod=+x scripts/*.sh
```

---

## 🚨 Troubleshooting

### Error: "Permission denied (publickey)"
**Solución**: Configurar SSH con clave pública (ver arriba)

### Error: "rsync: command not found"
**Solución**: 
```bash
# Linux
sudo apt-get install rsync

# Mac
brew install rsync

# Windows
# Usar Git Bash o WSL
```

### Error: "multi-tenant: No such file or directory"
**Solución**: Ejecutar desde la raíz del proyecto
```bash
cd D:\tareas\exp010-whatsappbot
./scripts/deploy-multitenant.sh
```

### Scripts no ejecutan en Windows
**Solución**: Usar PowerShell o Git Bash
```powershell
# PowerShell
.\scripts\deploy-multitenant.ps1

# Git Bash
bash scripts/deploy-multitenant.sh
```

---

## 📊 Comparación de Scripts

| Script | Velocidad | Seguridad | Uso |
|--------|-----------|-----------|-----|
| `deploy-multitenant` | 🐢 Lento | 🛡️ Alta | Deployment completo |
| `quick-update` | 🚀 Rápido | ⚠️ Media | Desarrollo iterativo |
| `pull-from-vps` | 🐢 Medio | 🛡️ Alta | Sincronizar desde VPS |

---

## 💡 Mejores Prácticas

1. **Siempre hacer backup**: Los scripts lo hacen automáticamente
2. **Probar localmente primero**: Si es posible
3. **Usar quick-update para desarrollo**: Más rápido
4. **Usar deploy-multitenant para releases**: Más seguro
5. **Commitear antes de deploy**: Mantener git sincronizado
6. **Verificar producción después**: Asegurar que nada se rompió

---

## 🔗 Referencias

- [DEPLOYMENT.md](../multi-tenant/DEPLOYMENT.md) - Guía manual de deployment
- [REVISION_FASE_1.md](../multi-tenant/REVISION_FASE_1.md) - Revisión de Fase 1

---

**Última actualización**: 2026-05-10  
**Versión**: 1.0
