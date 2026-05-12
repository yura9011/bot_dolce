# Sesión: Scripts de deploy para VPS Ubuntu

**Fecha**: 2026-05-12  
**Duración**: ~5 min  
**Agente**: opencode  
**Usuario**: forma

---

## 🎯 Objetivos

Crear scripts bash que automaticen la sincronización de testing y el deploy a producción en el VPS Ubuntu.

---

## ✅ Tareas Completadas

### 1. scripts/sync-testing.sh
- `git fetch origin main && git reset --hard origin/main`
- `git clean -fd` excluyendo `data/`, `logs/`, `.wwebjs_auth_testing/`, `node_modules/`
- Backup/restore de `config/admin-numbers.json` y `config/phone-map.json`
- `npm install` y `pm2 restart` para servicios de testing

### 2. scripts/deploy-production.sh
- `git pull origin main`
- `npm install` en root y `dashboard-humano-v2/`
- `pm2 restart bot-dolce-prd`, `dashboard-humano-santa-ana`, `dashboard-prd`

---

## 📂 Archivos Creados

| Archivo | Permisos |
|---|---|
| `scripts/sync-testing.sh` | 100755 |
| `scripts/deploy-production.sh` | 100755 |

---

## 🚀 Commit

```bash
git add scripts/sync-testing.sh scripts/deploy-production.sh
git update-index --chmod=+x scripts/sync-testing.sh
git update-index --chmod=+x scripts/deploy-production.sh
git commit -m "feat(ops): Add sync-testing.sh and deploy-production.sh scripts for Ubuntu VPS"
git push origin main
```

### Uso en VPS:
```bash
# Sincronizar testing (resetea cambios locales):
bash /home/forma/bot_dolce/scripts/sync-testing.sh

# Deployar producción:
bash /home/forma/bot_dolce/scripts/deploy-production.sh
```

---

**Última actualización**: 2026-05-12
