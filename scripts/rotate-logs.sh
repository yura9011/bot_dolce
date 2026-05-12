#!/bin/bash
# scripts/rotate-logs.sh
# Rotación de logs de todos los agentes
# Cron: 0 2 * * * bash /home/forma/bot_dolce/scripts/rotate-logs.sh

PROD_DIR="/home/forma/bot_dolce"
MAX_SIZE_MB=10
KEEP_ROTATED=5

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔄 Rotando logs...${NC}"

cd "$PROD_DIR"

AGENT_IDS=$(node -e "
  const c = require('./config/agents.json');
  c.agents.forEach(a => console.log(a.id));
")

for AGENT_ID in $AGENT_IDS; do
  LOG_DIR="$PROD_DIR/logs/$AGENT_ID"

  if [ ! -d "$LOG_DIR" ]; then continue; fi

  for LOG_FILE in "$LOG_DIR/bot.log" "$LOG_DIR/security.log"; do
    if [ ! -f "$LOG_FILE" ]; then continue; fi

    SIZE_MB=$(du -m "$LOG_FILE" | cut -f1)

    if [ "$SIZE_MB" -ge "$MAX_SIZE_MB" ]; then
      echo -e "  📄 Rotando $LOG_FILE (${SIZE_MB}MB)..."

      for i in $(seq $((KEEP_ROTATED-1)) -1 1); do
        if [ -f "${LOG_FILE}.${i}" ]; then
          mv "${LOG_FILE}.${i}" "${LOG_FILE}.$((i+1))"
        fi
      done

      mv "$LOG_FILE" "${LOG_FILE}.1"
      touch "$LOG_FILE"

      echo -e "    ✅ Rotado correctamente"
    else
      echo -e "  📄 $AGENT_ID/$(basename $LOG_FILE): ${SIZE_MB}MB (sin rotar)"
    fi
  done
done

echo -e "${GREEN}✅ Rotación completada${NC}"
