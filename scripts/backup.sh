#!/bin/bash
# scripts/backup.sh
# Backup diario de datos de todos los agentes
# Uso: bash scripts/backup.sh
# Cron: 0 3 * * * bash /home/forma/bot_dolce/scripts/backup.sh

set -e

PROD_DIR="/home/forma/bot_dolce"
BACKUP_DIR="/home/forma/backups"
DATE=$(date +%Y-%m-%d)
KEEP_DAYS=30

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}📦 Iniciando backup - ${DATE}${NC}"

mkdir -p "$BACKUP_DIR/$DATE"

cd "$PROD_DIR"
AGENTS=$(node -e "
  const c = require('./config/agents.json');
  c.agents.filter(a => a.enabled).forEach(a => console.log(a.id + ':' + a.paths.data));
")

for AGENT_DATA in $AGENTS; do
  AGENT_ID=$(echo $AGENT_DATA | cut -d: -f1)
  DATA_PATH=$(echo $AGENT_DATA | cut -d: -f2)

  echo -e "  📁 Backup de ${AGENT_ID}..."

  AGENT_BACKUP="$BACKUP_DIR/$DATE/$AGENT_ID"
  mkdir -p "$AGENT_BACKUP"

  cp "$PROD_DIR/$DATA_PATH/historial.json" "$AGENT_BACKUP/" 2>/dev/null || echo "    ⚠️  historial.json no encontrado"
  cp "$PROD_DIR/$DATA_PATH/pausas.json" "$AGENT_BACKUP/" 2>/dev/null || true
  cp "$PROD_DIR/$DATA_PATH/estadisticas.json" "$AGENT_BACKUP/" 2>/dev/null || true
done

echo -e "  📁 Backup de config..."
cp "$PROD_DIR/config/agents.json" "$BACKUP_DIR/$DATE/" 2>/dev/null || true
cp "$PROD_DIR/config/admin-numbers.json" "$BACKUP_DIR/$DATE/" 2>/dev/null || true

echo -e "  🗜️  Comprimiendo..."
cd "$BACKUP_DIR"
tar -czf "$DATE.tar.gz" "$DATE/" && rm -rf "$DATE/"

echo -e "  🧹 Limpiando backups viejos..."
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$KEEP_DAYS -delete

echo -e "${GREEN}✅ Backup completado: $BACKUP_DIR/$DATE.tar.gz${NC}"
ls -lh "$BACKUP_DIR/"
