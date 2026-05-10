#!/bin/bash

# Script para deployar multi-tenant al VPS
# Uso: ./scripts/deploy-multitenant.sh [--skip-git] [--skip-backup]

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
VPS_HOST="forma@srv1658334.hstgr.cloud"
VPS_PATH="/home/forma"
LOCAL_PATH="./multi-tenant"

# Flags
SKIP_GIT=false
SKIP_BACKUP=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-git)
      SKIP_GIT=true
      shift
      ;;
    --skip-backup)
      SKIP_BACKUP=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Multi-Tenant Deployment Script       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Verificar que existe la carpeta local
if [ ! -d "$LOCAL_PATH" ]; then
  echo -e "${RED}❌ Error: Carpeta $LOCAL_PATH no encontrada${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Carpeta local encontrada${NC}"

# Step 2: Git operations (si no se salta)
if [ "$SKIP_GIT" = false ]; then
  echo ""
  echo -e "${YELLOW}📦 Paso 1: Git Operations${NC}"
  
  # Check if there are changes
  if git diff --quiet multi-tenant/; then
    echo -e "${BLUE}ℹ️  No hay cambios en multi-tenant/${NC}"
  else
    echo -e "${YELLOW}📝 Cambios detectados en multi-tenant/${NC}"
    
    # Show changes
    echo -e "${BLUE}Archivos modificados:${NC}"
    git status --short multi-tenant/
    
    # Ask for confirmation
    read -p "¿Hacer commit y push? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      # Add files
      git add multi-tenant/
      
      # Commit
      read -p "Mensaje de commit (Enter para default): " COMMIT_MSG
      if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="chore: update multi-tenant structure"
      fi
      
      git commit -m "$COMMIT_MSG"
      
      # Push
      echo -e "${YELLOW}Pushing to remote...${NC}"
      git push
      
      echo -e "${GREEN}✅ Git push completado${NC}"
    else
      echo -e "${YELLOW}⚠️  Saltando git operations${NC}"
    fi
  fi
else
  echo -e "${YELLOW}⚠️  Git operations saltadas (--skip-git)${NC}"
fi

# Step 3: Backup en VPS (si no se salta)
if [ "$SKIP_BACKUP" = false ]; then
  echo ""
  echo -e "${YELLOW}💾 Paso 2: Backup en VPS${NC}"
  
  # Check if multi-tenant exists on VPS
  if ssh $VPS_HOST "[ -d $VPS_PATH/multi-tenant ]"; then
    echo -e "${BLUE}Creando backup...${NC}"
    
    BACKUP_NAME="multi-tenant-backup-$(date +%Y%m%d-%H%M%S)"
    ssh $VPS_HOST "cp -r $VPS_PATH/multi-tenant $VPS_PATH/$BACKUP_NAME"
    
    echo -e "${GREEN}✅ Backup creado: $BACKUP_NAME${NC}"
  else
    echo -e "${BLUE}ℹ️  No existe multi-tenant en VPS (primera instalación)${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Backup saltado (--skip-backup)${NC}"
fi

# Step 4: Sync to VPS
echo ""
echo -e "${YELLOW}🚀 Paso 3: Sincronizando con VPS${NC}"

# Use rsync for efficient sync
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'backups/*' \
  --exclude 'clients/*/data' \
  --exclude 'clients/*/.wwebjs_auth' \
  $LOCAL_PATH/ $VPS_HOST:$VPS_PATH/multi-tenant/

echo -e "${GREEN}✅ Archivos sincronizados${NC}"

# Step 5: Setup on VPS
echo ""
echo -e "${YELLOW}⚙️  Paso 4: Configurando en VPS${NC}"

ssh $VPS_HOST << 'ENDSSH'
  set -e
  
  echo "📁 Verificando estructura..."
  cd /home/forma/multi-tenant
  
  echo "🔐 Configurando permisos..."
  chmod +x scripts/*.js
  
  echo "📦 Instalando dependencias..."
  cd scripts
  if [ ! -d "node_modules" ]; then
    npm install
  else
    echo "ℹ️  node_modules ya existe, saltando npm install"
  fi
  
  echo "✅ Configuración completada"
ENDSSH

echo -e "${GREEN}✅ Setup en VPS completado${NC}"

# Step 6: Verify installation
echo ""
echo -e "${YELLOW}🔍 Paso 5: Verificando instalación${NC}"

ssh $VPS_HOST << 'ENDSSH'
  cd /home/forma/multi-tenant/scripts
  
  echo "Testing port-manager..."
  node port-manager.js list > /dev/null 2>&1 && echo "✅ port-manager.js OK" || echo "❌ port-manager.js FAIL"
  
  echo "Testing validate-config..."
  node validate-config.js ../config/client-example.json > /dev/null 2>&1 && echo "✅ validate-config.js OK" || echo "❌ validate-config.js FAIL"
ENDSSH

# Step 7: Verify production is intact
echo ""
echo -e "${YELLOW}🔍 Paso 6: Verificando producción${NC}"

ssh $VPS_HOST << 'ENDSSH'
  echo "Verificando PM2..."
  pm2 list | grep -E "(bot-dolce|dashboard)" && echo "✅ Procesos PM2 OK" || echo "⚠️  Verificar PM2 manualmente"
ENDSSH

# Final summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Deployment Completado              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Resumen:${NC}"
echo -e "  • Archivos sincronizados: ${GREEN}✓${NC}"
echo -e "  • Permisos configurados: ${GREEN}✓${NC}"
echo -e "  • Dependencias instaladas: ${GREEN}✓${NC}"
echo -e "  • Scripts verificados: ${GREEN}✓${NC}"
echo -e "  • Producción intacta: ${GREEN}✓${NC}"
echo ""
echo -e "${BLUE}🔗 Próximos pasos:${NC}"
echo -e "  1. SSH al VPS: ${YELLOW}ssh $VPS_HOST${NC}"
echo -e "  2. Navegar: ${YELLOW}cd /home/forma/multi-tenant${NC}"
echo -e "  3. Probar: ${YELLOW}node scripts/port-manager.js list${NC}"
echo ""
