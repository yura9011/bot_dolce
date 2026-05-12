#!/bin/bash
# scripts/setup-cron.sh
# Instala los cron jobs para backup y log rotation
# Uso: bash scripts/setup-cron.sh (ejecutar UNA VEZ en el VPS)

PROD_DIR="/home/forma/bot_dolce"

echo "📅 Instalando cron jobs..."

(crontab -l 2>/dev/null | grep -v "bot_dolce/scripts"; echo "0 3 * * * bash $PROD_DIR/scripts/backup.sh >> /home/forma/logs/backup.log 2>&1"; echo "0 2 * * * bash $PROD_DIR/scripts/rotate-logs.sh >> /home/forma/logs/rotate.log 2>&1") | crontab -

mkdir -p /home/forma/logs

echo "✅ Cron jobs instalados:"
crontab -l | grep bot_dolce
echo ""
echo "Backup: todos los días a las 3:00 AM"
echo "Log rotation: todos los días a las 2:00 AM"
echo "Backups guardados en: /home/forma/backups/"
