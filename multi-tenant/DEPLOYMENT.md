# 🚀 Guía de Deployment - Multi-Tenant en VPS

**Fecha**: 2026-05-10  
**VPS**: srv1658334.hstgr.cloud  
**Usuario**: forma

---

## 📋 Pre-requisitos

- Acceso SSH al VPS
- Git instalado en el VPS
- Node.js 18+ instalado
- PM2 instalado globalmente

---

## 🔧 PASO 1: Clonar Repositorio en VPS

```bash
# Conectarse al VPS
ssh forma@srv1658334.hstgr.cloud

# Navegar al directorio home
cd /home/forma

# Clonar el repositorio (ajustar URL según tu repo)
git clone <URL_DEL_REPOSITORIO> temp-repo

# Mover solo la carpeta multi-tenant
mv temp-repo/multi-tenant /home/forma/
rm -rf temp-repo

# Verificar estructura
ls -la /home/forma/multi-tenant/
```

---

## 🔧 PASO 2: Configurar Permisos

```bash
# Dar permisos de ejecución a scripts
chmod +x /home/forma/multi-tenant/scripts/*.js

# Verificar permisos
ls -la /home/forma/multi-tenant/scripts/
```

---

## 🔧 PASO 3: Instalar Dependencias

```bash
# Instalar dependencias de scripts
cd /home/forma/multi-tenant/scripts
npm install

# Verificar instalación
ls -la node_modules/
```

---

## 🔧 PASO 4: Configurar Variables de Entorno (Opcional)

```bash
# Crear archivo de variables globales
cat > ~/.env.multitenant <<'EOF'
# Multi-tenant paths
MULTITENANT_ROOT=/home/forma/multi-tenant
PORT_REGISTRY_PATH=/home/forma/multi-tenant/config/port-registry.json
CLIENT_SCHEMA_PATH=/home/forma/multi-tenant/config/client-schema.json
EOF

# Agregar a .bashrc para cargar automáticamente
echo '' >> ~/.bashrc
echo '# Multi-tenant environment' >> ~/.bashrc
echo 'if [ -f ~/.env.multitenant ]; then' >> ~/.bashrc
echo '  export $(cat ~/.env.multitenant | xargs)' >> ~/.bashrc
echo 'fi' >> ~/.bashrc

# Recargar .bashrc
source ~/.bashrc
```

---

## 🔧 PASO 5: Crear Alias Útiles (Opcional)

```bash
# Agregar alias a .bashrc
cat >> ~/.bashrc <<'EOF'

# Multi-tenant aliases
alias mt-ports='node /home/forma/multi-tenant/scripts/port-manager.js'
alias mt-validate='node /home/forma/multi-tenant/scripts/validate-config.js'
alias mt-list='mt-ports list'
alias mt-cd='cd /home/forma/multi-tenant'
EOF

# Recargar .bashrc
source ~/.bashrc
```

---

## ✅ PASO 6: Verificar Instalación

### Test 1: Port Manager
```bash
cd /home/forma/multi-tenant/scripts
node port-manager.js list
```

**Salida esperada**:
```json
{
  "platform": {
    "dashboard_maestro": 3000
  },
  "clients": {},
  "next_available": 5010,
  "reserved": [3000, 3011, 4000, 4011]
}
```

### Test 2: Validador de Configuración
```bash
cd /home/forma/multi-tenant/scripts
node validate-config.js ../config/client-example.json
```

**Salida esperada**:
```
✅ Configuration is valid
```

### Test 3: Verificar Producción Intacta
```bash
# Verificar procesos PM2
pm2 list

# Verificar dashboard producción
curl http://localhost:3000

# Verificar dashboard testing
curl http://localhost:4000
```

**Salida esperada**: Ambos dashboards deben responder correctamente.

---

## 🎯 PASO 7: Prueba de Asignación de Puertos

```bash
cd /home/forma/multi-tenant/scripts

# Test: Asignar dashboard a cliente de prueba
node port-manager.js assign-dashboard test-client
# Esperado: 5010

# Test: Asignar 2 bots
node port-manager.js assign-bots test-client 2
# Esperado: 5011 5012

# Test: Listar
node port-manager.js list
# Esperado: test-client aparece en la lista

# Test: Verificar puerto
node port-manager.js check 5010
# Esperado: Reserved

node port-manager.js check 6000
# Esperado: Available

# Test: Liberar puertos
node port-manager.js release test-client
# Esperado: Released ports for test-client

# Test: Verificar liberación
node port-manager.js list
# Esperado: test-client ya no aparece
```

---

## 🚨 Troubleshooting

### Problema: "Port registry not found"
**Solución**:
```bash
# Verificar que existe el archivo
ls -la /home/forma/multi-tenant/config/port-registry.json

# Si no existe, crearlo
cat > /home/forma/multi-tenant/config/port-registry.json <<'EOF'
{
  "platform": {
    "dashboard_maestro": 3000
  },
  "clients": {},
  "next_available": 5010,
  "reserved": [3000, 3011, 4000, 4011]
}
EOF
```

### Problema: "Cannot find module 'ajv'"
**Solución**:
```bash
cd /home/forma/multi-tenant/scripts
npm install
```

### Problema: "Permission denied"
**Solución**:
```bash
chmod +x /home/forma/multi-tenant/scripts/*.js
```

### Problema: Scripts no encuentran archivos
**Solución**: Usar variables de entorno
```bash
export PORT_REGISTRY_PATH=/home/forma/multi-tenant/config/port-registry.json
export CLIENT_SCHEMA_PATH=/home/forma/multi-tenant/config/client-schema.json
```

---

## 📊 Checklist de Deployment

- [ ] Repositorio clonado en VPS
- [ ] Carpeta `multi-tenant/` en `/home/forma/`
- [ ] Permisos de ejecución en scripts
- [ ] Dependencias instaladas (`npm install`)
- [ ] Variables de entorno configuradas (opcional)
- [ ] Alias creados (opcional)
- [ ] Port manager funciona (`mt-list`)
- [ ] Validador funciona
- [ ] Producción sigue funcionando (PM2)
- [ ] Tests de asignación de puertos pasan

---

## 🎉 Deployment Completo

Una vez completados todos los pasos, la Fase 1 está lista en el VPS.

**Próximo paso**: Fase 2 - Dashboard Maestro

---

## 📞 Comandos Útiles

```bash
# Ver estructura
tree /home/forma/multi-tenant/ -L 2

# Ver puertos asignados
mt-list

# Validar configuración
mt-validate /path/to/config.json

# Ver logs de producción
pm2 logs bot-dolce-prd

# Reiniciar producción (si es necesario)
pm2 restart bot-dolce-prd
```

---

**Última actualización**: 2026-05-10  
**Versión**: 1.0
