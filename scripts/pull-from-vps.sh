#!/bin/bash

# Script para traer cambios del VPS a local
# Útil si hiciste cambios directamente en el VPS
# Uso: ./scripts/pull-from-vps.sh

set -e

# Configuración
VPS_HOST="forma@srv1658334.hstgr.cloud"
VPS_PATH="/home/forma/multi-tenant"
LOCAL_PATH="./multi-tenant"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}⬇️  Pull from VPS - Multi-Tenant${NC}"
echo ""

# Advertencia
echo -e "${YELLOW}⚠️  ADVERTENCIA:${NC}"
echo "Este script sobrescribirá archivos locales con los del VPS."
echo ""
read -p "¿Continuar? (y/n): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelado."
  exit 0
fi

# Backup local
echo -e "${YELLOW}💾 Creando backup local...${NC}"
BACKUP_NAME="multi-tenant-local-backup-$(date +%Y%m%d-%H%M%S)"
cp -r $LOCAL_PATH $BACKUP_NAME
echo -e "${GREEN}✅ Backup creado: $BACKUP_NAME${NC}"

# Sync from VPS
echo ""
echo -e "${YELLOW}⬇️  Descargando desde VPS...${NC}"

rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude 'backups/*' \
  --exclude 'clients/*/data' \
  --exclude 'clients/*/.wwebjs_auth' \
  $VPS_HOST:$VPS_PATH/ $LOCAL_PATH/

echo -e "${GREEN}✅ Sincronización completada${NC}"

# Mostrar diferencias con git
echo ""
echo -e "${BLUE}📊 Cambios detectados:${NC}"
git status --short multi-tenant/

echo ""
echo -e "${BLUE}💡 Próximos pasos:${NC}"
echo "  1. Revisar cambios: git diff multi-tenant/"
echo "  2. Si todo está bien: git add multi-tenant/ && git commit -m 'sync: pull from VPS'"
echo "  3. Si algo salió mal: rm -rf multi-tenant && mv $BACKUP_NAME multi-tenant"
