# Sesión: Scripts de backup y log rotation

**Fecha**: 2026-05-12  
**Duración**: ~5 min  
**Agente**: opencode  
**Usuario**: forma

---

## 🎯 Objetivos

Crear scripts bash para backup automático, rotación de logs e instalación de cron jobs en el VPS Ubuntu.

---

## ✅ Tareas Completadas

### 1. scripts/backup.sh
- Lee agentes habilitados de `agents.json` vía node -e
- Backup de `historial.json`, `pausas.json`, `estadisticas.json` por agente
- Backup de `agents.json` y `admin-numbers.json`
- Comprime en `.tar.gz` diario
- Limpia backups >30 días

### 2. scripts/rotate-logs.sh
- Itera todos los agentes (habilitados o no)
- Rota `bot.log` y `security.log` si superan 10MB
- Mantiene 5 versiones rotadas (`.1`, `.2`, ...)
- Crea archivo vacío nuevo

### 3. scripts/setup-cron.sh
- Instala cron jobs sin duplicar (usa `grep -v`)
- Backup: 3:00 AM todos los días
- Rotación: 2:00 AM todos los días
- Crea directorio `/home/forma/logs/`

---

## 📂 Archivos Creados

| Archivo | Permisos |
|---|---|
| `scripts/backup.sh` | 100755 |
| `scripts/rotate-logs.sh` | 100755 |
| `scripts/setup-cron.sh` | 100755 |

---

## 🚀 Commit

```bash
git add scripts/backup.sh scripts/rotate-logs.sh scripts/setup-cron.sh
git update-index --chmod=+x scripts/backup.sh scripts/rotate-logs.sh scripts/setup-cron.sh
git commit -m "feat(ops): Add backup, log rotation, and cron setup scripts"
git push origin main
```

### Uso en VPS (una sola vez):
```bash
cd /home/forma/bot_dolce
git pull origin main
bash scripts/setup-cron.sh
```

---

**Última actualización**: 2026-05-12
