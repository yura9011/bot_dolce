#!/bin/bash
# scripts/sync-testing.sh
# Sincroniza bot_testing con el último código del repositorio
# Preserva: data/, logs/, .wwebjs_auth/, config/admin-numbers.json, config/phone-map.json
# Resetea: todo lo demás al estado del repo

set -e

TESTING_DIR="/home/forma/bot_testing"
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BOLD}🔄 Sincronizando bot_testing con repositorio...${NC}\n"

cd "$TESTING_DIR"

# 1. Hacer backup de archivos runtime que NO deben sobreescribirse
echo -e "${YELLOW}📦 Guardando archivos runtime...${NC}"
cp config/admin-numbers.json /tmp/admin-numbers.backup.json 2>/dev/null || true
cp config/phone-map.json /tmp/phone-map.backup.json 2>/dev/null || true
cp config/agents.override.json /tmp/agents-override.backup.json 2>/dev/null || true

# 2. Resetear al estado del repo (descarta cambios locales)
echo -e "${YELLOW}🔄 Reseteando al estado del repositorio...${NC}"
git fetch origin main
git reset --hard origin/main
git clean -fd --exclude=data/ --exclude=logs/ --exclude=.wwebjs_auth_testing/ --exclude=node_modules/

# 3. Restaurar archivos runtime
echo -e "${YELLOW}📂 Restaurando archivos runtime...${NC}"
cp /tmp/admin-numbers.backup.json config/admin-numbers.json 2>/dev/null || true
cp /tmp/phone-map.backup.json config/phone-map.json 2>/dev/null || true
cp /tmp/agents-override.backup.json config/agents.override.json 2>/dev/null || true

# 4. Instalar dependencias si cambiaron
echo -e "${YELLOW}📦 Verificando dependencias...${NC}"
npm install --silent

# 5. Reiniciar servicios
echo -e "${YELLOW}🔄 Reiniciando servicios de testing...${NC}"
pm2 restart bot-dolce-dev || true
pm2 restart dashboard-humano-testing || true
pm2 restart dashboard-dev || true

echo -e "\n${GREEN}✅ bot_testing sincronizado correctamente${NC}"
echo -e "Commit actual: $(git log --oneline -1)"
