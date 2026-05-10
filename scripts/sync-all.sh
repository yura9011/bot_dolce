#!/bin/bash

# Script maestro para sincronizar todo: Local → Git → VPS
# Uso: ./scripts/sync-all.sh "mensaje de commit"

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

COMMIT_MSG=${1:-"chore: sync multi-tenant"}

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Sync All: Local → Git → VPS          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Git
echo -e "${YELLOW}📦 Paso 1/3: Git Operations${NC}"

if git diff --quiet multi-tenant/; then
  echo -e "${BLUE}ℹ️  No hay cambios en multi-tenant/${NC}"
else
  echo -e "${BLUE}Archivos modificados:${NC}"
  git status --short multi-tenant/
  
  git add multi-tenant/
  git commit -m "$COMMIT_MSG"
  git push
  
  echo -e "${GREEN}✅ Git push completado${NC}"
fi

# Step 2: Deploy
echo ""
echo -e "${YELLOW}🚀 Paso 2/3: Deploy to VPS${NC}"
./scripts/deploy-multitenant.sh --skip-git

# Step 3: Verify
echo ""
echo -e "${YELLOW}🔍 Paso 3/3: Verificación Final${NC}"

ssh forma@srv1658334.hstgr.cloud << 'ENDSSH'
  cd /home/forma/multi-tenant/scripts
  
  echo "✓ Port Manager:"
  node port-manager.js list | head -n 5
  
  echo ""
  echo "✓ Producción:"
  pm2 list | grep -E "(bot-dolce|dashboard)" | head -n 2
ENDSSH

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Sincronización Completa            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
