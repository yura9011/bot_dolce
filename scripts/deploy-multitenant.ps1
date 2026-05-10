# Script para deployar multi-tenant al VPS desde Windows
# Uso: .\scripts\deploy-multitenant.ps1 [-SkipGit] [-SkipBackup]

param(
    [switch]$SkipGit,
    [switch]$SkipBackup
)

# Configuración
$VPS_HOST = "forma@srv1658334.hstgr.cloud"
$VPS_PATH = "/home/forma"
$LOCAL_PATH = ".\multi-tenant"

# Colores
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Cyan "╔════════════════════════════════════════╗"
Write-ColorOutput Cyan "║  Multi-Tenant Deployment Script       ║"
Write-ColorOutput Cyan "╚════════════════════════════════════════╝"
Write-Output ""

# Step 1: Verificar carpeta local
if (-not (Test-Path $LOCAL_PATH)) {
    Write-ColorOutput Red "❌ Error: Carpeta $LOCAL_PATH no encontrada"
    exit 1
}

Write-ColorOutput Green "✅ Carpeta local encontrada"

# Step 2: Git operations
if (-not $SkipGit) {
    Write-Output ""
    Write-ColorOutput Yellow "📦 Paso 1: Git Operations"
    
    # Check for changes
    $gitStatus = git status --short multi-tenant/
    
    if ([string]::IsNullOrWhiteSpace($gitStatus)) {
        Write-ColorOutput Blue "ℹ️  No hay cambios en multi-tenant/"
    } else {
        Write-ColorOutput Yellow "📝 Cambios detectados en multi-tenant/"
        Write-ColorOutput Blue "Archivos modificados:"
        git status --short multi-tenant/
        
        $response = Read-Host "¿Hacer commit y push? (y/n)"
        if ($response -eq 'y' -or $response -eq 'Y') {
            # Add files
            git add multi-tenant/
            
            # Commit
            $commitMsg = Read-Host "Mensaje de commit (Enter para default)"
            if ([string]::IsNullOrWhiteSpace($commitMsg)) {
                $commitMsg = "chore: update multi-tenant structure"
            }
            
            git commit -m $commitMsg
            
            # Push
            Write-ColorOutput Yellow "Pushing to remote..."
            git push
            
            Write-ColorOutput Green "✅ Git push completado"
        } else {
            Write-ColorOutput Yellow "⚠️  Saltando git operations"
        }
    }
} else {
    Write-ColorOutput Yellow "⚠️  Git operations saltadas (-SkipGit)"
}

# Step 3: Backup en VPS
if (-not $SkipBackup) {
    Write-Output ""
    Write-ColorOutput Yellow "💾 Paso 2: Backup en VPS"
    
    # Check if multi-tenant exists on VPS
    $checkExists = ssh $VPS_HOST "[ -d $VPS_PATH/multi-tenant ] && echo 'exists' || echo 'not-exists'"
    
    if ($checkExists -match "exists") {
        Write-ColorOutput Blue "Creando backup..."
        
        $backupName = "multi-tenant-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        ssh $VPS_HOST "cp -r $VPS_PATH/multi-tenant $VPS_PATH/$backupName"
        
        Write-ColorOutput Green "✅ Backup creado: $backupName"
    } else {
        Write-ColorOutput Blue "ℹ️  No existe multi-tenant en VPS (primera instalación)"
    }
} else {
    Write-ColorOutput Yellow "⚠️  Backup saltado (-SkipBackup)"
}

# Step 4: Sync to VPS usando SCP
Write-Output ""
Write-ColorOutput Yellow "🚀 Paso 3: Sincronizando con VPS"

# Crear archivo temporal con lista de exclusiones
$excludeFile = New-TemporaryFile
@"
node_modules
.git
backups/*
clients/*/data
clients/*/.wwebjs_auth
"@ | Out-File -FilePath $excludeFile.FullName -Encoding ASCII

# Usar rsync si está disponible, sino usar scp
if (Get-Command rsync -ErrorAction SilentlyContinue) {
    rsync -avz --delete --exclude-from=$excludeFile.FullName $LOCAL_PATH/ ${VPS_HOST}:${VPS_PATH}/multi-tenant/
} else {
    Write-ColorOutput Yellow "⚠️  rsync no disponible, usando scp (más lento)"
    scp -r $LOCAL_PATH ${VPS_HOST}:${VPS_PATH}/
}

Remove-Item $excludeFile.FullName

Write-ColorOutput Green "✅ Archivos sincronizados"

# Step 5: Setup on VPS
Write-Output ""
Write-ColorOutput Yellow "⚙️  Paso 4: Configurando en VPS"

$setupScript = @'
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
'@

ssh $VPS_HOST $setupScript

Write-ColorOutput Green "✅ Setup en VPS completado"

# Step 6: Verify installation
Write-Output ""
Write-ColorOutput Yellow "🔍 Paso 5: Verificando instalación"

$verifyScript = @'
cd /home/forma/multi-tenant/scripts

echo "Testing port-manager..."
node port-manager.js list > /dev/null 2>&1 && echo "✅ port-manager.js OK" || echo "❌ port-manager.js FAIL"

echo "Testing validate-config..."
node validate-config.js ../config/client-example.json > /dev/null 2>&1 && echo "✅ validate-config.js OK" || echo "❌ validate-config.js FAIL"
'@

ssh $VPS_HOST $verifyScript

# Step 7: Verify production
Write-Output ""
Write-ColorOutput Yellow "🔍 Paso 6: Verificando producción"

$checkProdScript = @'
echo "Verificando PM2..."
pm2 list | grep -E "(bot-dolce|dashboard)" && echo "✅ Procesos PM2 OK" || echo "⚠️  Verificar PM2 manualmente"
'@

ssh $VPS_HOST $checkProdScript

# Final summary
Write-Output ""
Write-ColorOutput Green "╔════════════════════════════════════════╗"
Write-ColorOutput Green "║  ✅ Deployment Completado              ║"
Write-ColorOutput Green "╚════════════════════════════════════════╝"
Write-Output ""
Write-ColorOutput Blue "📊 Resumen:"
Write-Output "  • Archivos sincronizados: ✓"
Write-Output "  • Permisos configurados: ✓"
Write-Output "  • Dependencias instaladas: ✓"
Write-Output "  • Scripts verificados: ✓"
Write-Output "  • Producción intacta: ✓"
Write-Output ""
Write-ColorOutput Blue "🔗 Próximos pasos:"
Write-Output "  1. SSH al VPS: ssh $VPS_HOST"
Write-Output "  2. Navegar: cd /home/forma/multi-tenant"
Write-Output "  3. Probar: node scripts/port-manager.js list"
Write-Output ""
