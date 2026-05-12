#!/bin/bash
# scripts/deploy-production.sh
# Deploya el último código a producción
# Uso: bash scripts/deploy-production.sh

set -e

PROD_DIR="/home/forma/bot_dolce"
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BOLD}🚀 Deployando a producción...${NC}\n"

cd "$PROD_DIR"

# 1. Pull
echo -e "${YELLOW}📥 Descargando cambios...${NC}"
git pull origin main

# 2. Instalar dependencias si cambiaron
echo -e "${YELLOW}📦 Verificando dependencias...${NC}"
npm install --silent
cd dashboard-humano-v2 && npm install --silent && cd ..

# 3. Reiniciar servicios
echo -e "${YELLOW}🔄 Reiniciando servicios...${NC}"
pm2 restart bot-dolce-prd
pm2 restart dashboard-humano-santa-ana
pm2 restart dashboard-prd

echo -e "\n${GREEN}✅ Producción actualizada${NC}"
echo -e "Commit actual: $(git log --oneline -1)"
pm2 list
