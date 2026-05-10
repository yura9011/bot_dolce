#!/bin/bash

# Script para actualización rápida (solo archivos modificados)
# Uso: ./scripts/quick-update.sh

set -e

# Configuración
VPS_HOST="forma@srv1658334.hstgr.cloud"
VPS_PATH="/home/forma/multi-tenant"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Quick Update - Multi-Tenant${NC}"
echo ""

# Verificar cambios en git
if git diff --quiet multi-tenant/; then
  echo -e "${YELLOW}⚠️  No hay cambios en multi-tenant/${NC}"
  echo "Nada que actualizar."
  exit 0
fi

# Mostrar archivos modificados
echo -e "${BLUE}📝 Archivos modificados:${NC}"
git diff --name-only multi-tenant/

echo ""
read -p "¿Continuar con la actualización? (y/n): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelado."
  exit 0
fi

# Obtener lista de archivos modificados
MODIFIED_FILES=$(git diff --name-only multi-tenant/)

# Sincronizar solo archivos modificados
echo -e "${YELLOW}📤 Sincronizando archivos...${NC}"

for file in $MODIFIED_FILES; do
  if [ -f "$file" ]; then
    # Crear directorio en VPS si no existe
    DIR=$(dirname "$file")
    ssh $VPS_HOST "mkdir -p $VPS_PATH/${DIR#multi-tenant/}"
    
    # Copiar archivo
    scp "$file" "$VPS_HOST:$VPS_PATH/${file#multi-tenant/}"
    echo -e "${GREEN}✓${NC} $file"
  fi
done

# Si se modificaron scripts, actualizar permisos
if echo "$MODIFIED_FILES" | grep -q "scripts/.*\.js"; then
  echo -e "${YELLOW}🔐 Actualizando permisos de scripts...${NC}"
  ssh $VPS_HOST "chmod +x $VPS_PATH/scripts/*.js"
fi

# Si se modificó package.json, reinstalar dependencias
if echo "$MODIFIED_FILES" | grep -q "scripts/package.json"; then
  echo -e "${YELLOW}📦 Reinstalando dependencias...${NC}"
  ssh $VPS_HOST "cd $VPS_PATH/scripts && npm install"
fi

echo ""
echo -e "${GREEN}✅ Actualización completada${NC}"
echo ""
echo -e "${BLUE}Archivos actualizados: $(echo "$MODIFIED_FILES" | wc -l)${NC}"
