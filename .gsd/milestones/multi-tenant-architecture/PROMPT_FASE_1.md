# PROMPT PARA AGENTE DE CÓDIGO - FASE 1: Foundation & Core Refactoring

**Fecha**: 2026-05-10  
**Proyecto**: Arquitectura Multi-Tenant para WhatsApp Bot  
**Fase**: 1 de 6  
**Duración Estimada**: 1-2 semanas (40 horas)

---

## 🎯 OBJETIVO DE ESTA FASE

Crear la estructura base y fundamentos del sistema multi-tenant **SIN romper** la funcionalidad actual de producción.

Al finalizar esta fase deberás tener:
1. ✅ Estructura de directorios creada
2. ✅ Template extraído del bot actual
3. ✅ Sistema de configuración por cliente
4. ✅ Sistema de gestión de puertos automático

---

## 📍 CONTEXTO DEL PROYECTO

### Estado Actual
Tenemos 2 ambientes en el VPS (srv1658334.hstgr.cloud):
- **Producción**: `/home/forma/bot_dolce` - Dolce Party (cotillón)
- **Testing**: `/home/forma/bot_testing` - Ambiente de pruebas

**Problema**: Cada cliente nuevo requiere copiar todo manualmente (2-4 horas).

### Estado Objetivo
Sistema multi-tenant donde:
- Un solo template base
- Agregar cliente nuevo en 10-15 minutos con script
- Soporte para 10-15 clientes inicialmente, 50+ en el futuro
- Dashboard centralizado para monitorear todos los clientes

### Arquitectura Target
```
/home/forma/
├── dashboard-maestro/              → Port 3000 (admin)
│   └── monitoring.db              → Métricas compartidas
├── clients/
│   ├── dolce-party/
│   │   ├── config/client.json     → Configuración del cliente
│   │   ├── dashboard-cliente.js   → Port 5000
│   │   ├── santa-ana/             → Port 5001
│   │   │   ├── bot/               → Código del bot
│   │   │   ├── data/database.sqlite  ← DB aislada
│   │   │   └── .wwebjs_auth/      ← Sesión WhatsApp
│   │   └── centro/                → Port 5002
│   └── cliente-2/
│       └── local-1/               → Port 5011
├── templates/
│   └── bot-template/              → Template base
└── scripts/
    ├── add-client.sh
    ├── update-client.sh
    └── port-manager.js
```

---

## 📋 TAREAS DE LA FASE 1

### TAREA 1.1: Crear Estructura de Directorios (2 horas)

**Objetivo**: Crear la estructura base sin tocar los ambientes actuales.

**Comandos a ejecutar**:
```bash
# Conectarse al VPS
ssh forma@srv1658334.hstgr.cloud

# Crear estructura base
mkdir -p /home/forma/dashboard-maestro
mkdir -p /home/forma/clients
mkdir -p /home/forma/scripts
mkdir -p /home/forma/templates
mkdir -p /home/forma/config
mkdir -p /home/forma/backups

# Crear estructura del template
mkdir -p /home/forma/templates/bot-template/{bot,data,logs,catalogs,.wwebjs_auth}

# Verificar permisos
chown -R forma:forma /home/forma/dashboard-maestro
chown -R forma:forma /home/forma/clients
chown -R forma:forma /home/forma/scripts
chown -R forma:forma /home/forma/templates
chown -R forma:forma /home/forma/config

chmod -R 755 /home/forma/dashboard-maestro
chmod -R 755 /home/forma/clients
chmod -R 755 /home/forma/scripts
chmod -R 755 /home/forma/templates
```

**Criterios de Aceptación**:
- [ ] Todos los directorios creados
- [ ] Permisos correctos (755)
- [ ] Owner correcto (forma:forma)
- [ ] bot_dolce y bot_testing NO fueron tocados

**Verificación**:
```bash
ls -la /home/forma/ | grep -E "(dashboard-maestro|clients|scripts|templates)"
```

---

### TAREA 1.2: Extraer Template del Bot Actual (8 horas)

**Objetivo**: Crear un template reutilizable a partir de bot_dolce.

#### Sub-tarea 1.2.1: Identificar Archivos Compartidos vs Específicos (2h)

**Acción**: Analizar bot_dolce y clasificar archivos.

**Archivos COMPARTIDOS** (van al template):
- `orchestrator.js` - Orquestador de agentes
- `agent.js` - Lógica del agente
- `dashboard-central.js` - Dashboard base
- `dashboard-humano.js` - Dashboard humano
- `package.json` - Dependencias
- Carpeta `utils/` - Utilidades
- Carpeta `prompts/` - Prompts del sistema

**Archivos ESPECÍFICOS** (NO van al template, se configuran por cliente):
- `.env` - Variables de entorno
- `config/agents.json` - Configuración de agentes
- `catalogs/catalogo-*.js` - Catálogos de productos
- `data/` - Bases de datos
- `.wwebjs_auth/` - Sesiones de WhatsApp

**Comando para listar archivos**:
```bash
cd /home/forma/bot_dolce
find . -type f -not -path "./node_modules/*" -not -path "./.wwebjs_auth/*" -not -path "./data/*" | sort
```

#### Sub-tarea 1.2.2: Copiar Archivos Compartidos al Template (3h)

**Acción**: Copiar archivos compartidos y reemplazar valores hardcodeados.

```bash
cd /home/forma/bot_dolce

# Copiar archivos principales
cp orchestrator.js /home/forma/templates/bot-template/bot/
cp agent.js /home/forma/templates/bot-template/bot/
cp dashboard-central.js /home/forma/templates/bot-template/
cp dashboard-humano.js /home/forma/templates/bot-template/
cp package.json /home/forma/templates/bot-template/

# Copiar carpetas
cp -r utils /home/forma/templates/bot-template/bot/
cp -r prompts /home/forma/templates/bot-template/bot/

# Crear .env.template
cat > /home/forma/templates/bot-template/.env.template <<'EOF'
# Client Configuration
CLIENT_ID={{CLIENT_ID}}
LOCATION_ID={{LOCATION_ID}}
PORT={{PORT}}

# API Keys
GEMINI_API_KEY={{GEMINI_API_KEY}}
OPENROUTER_API_KEY={{OPENROUTER_API_KEY}}

# System Configuration
SYSTEM_PROMPT={{SYSTEM_PROMPT}}
NODE_ENV=production
EOF

# Crear config.template.json
cat > /home/forma/templates/bot-template/config.template.json <<'EOF'
{
  "client_id": "{{CLIENT_ID}}",
  "name": "{{CLIENT_NAME}}",
  "enabled": true,
  "ports": {
    "dashboard": {{DASHBOARD_PORT}},
    "bots": [{{BOT_PORTS}}]
  },
  "business": {
    "name": "{{BUSINESS_NAME}}",
    "phone": "{{BUSINESS_PHONE}}",
    "address": "{{BUSINESS_ADDRESS}}",
    "hours": "{{BUSINESS_HOURS}}"
  },
  "features": {
    "voice_messages": false,
    "payments": false
  }
}
EOF

# Crear catálogo template
cat > /home/forma/templates/bot-template/catalogs/catalogo.template.js <<'EOF'
// Catálogo de productos para {{CLIENT_NAME}}
module.exports = {
  categorias: [
    {
      nombre: "Categoría 1",
      productos: [
        { nombre: "Producto 1", precio: 100 }
      ]
    }
  ]
};
EOF
```

**IMPORTANTE**: Reemplazar valores hardcodeados en los archivos copiados:
- En `agent.js`: Buscar rutas absolutas y reemplazar con variables
- En `dashboard-central.js`: Reemplazar puerto hardcodeado con `process.env.PORT`
- En `orchestrator.js`: Reemplazar rutas con variables de entorno

#### Sub-tarea 1.2.3: Crear README del Template (1h)

```bash
cat > /home/forma/templates/bot-template/README.md <<'EOF'
# WhatsApp Bot Template

Este es el template base para crear nuevos clientes.

## Placeholders

Los siguientes valores deben ser reemplazados al crear un cliente:

- `{{CLIENT_ID}}` - ID único del cliente (ej: "dolce-party")
- `{{CLIENT_NAME}}` - Nombre del cliente (ej: "Dolce Party")
- `{{LOCATION_ID}}` - ID del local (ej: "santa-ana")
- `{{PORT}}` - Puerto asignado al bot
- `{{DASHBOARD_PORT}}` - Puerto del dashboard cliente
- `{{BOT_PORTS}}` - Lista de puertos de bots
- `{{BUSINESS_NAME}}` - Nombre del negocio
- `{{BUSINESS_PHONE}}` - Teléfono del negocio
- `{{BUSINESS_ADDRESS}}` - Dirección del negocio
- `{{BUSINESS_HOURS}}` - Horario de atención
- `{{GEMINI_API_KEY}}` - API key de Gemini
- `{{OPENROUTER_API_KEY}}` - API key de OpenRouter
- `{{SYSTEM_PROMPT}}` - Prompt del sistema

## Estructura

```
bot-template/
├── bot/                    # Código del bot
│   ├── agent.js
│   ├── orchestrator.js
│   ├── utils/
│   └── prompts/
├── catalogs/               # Catálogos de productos
│   └── catalogo.template.js
├── data/                   # Bases de datos (vacío)
├── logs/                   # Logs (vacío)
├── .wwebjs_auth/          # Sesión WhatsApp (vacío)
├── .env.template          # Variables de entorno
├── config.template.json   # Configuración del cliente
└── package.json           # Dependencias
```

## Uso

No usar directamente. Usar el script `add-client.sh` para crear clientes.
EOF
```

#### Sub-tarea 1.2.4: Probar Template (2h)

**Acción**: Clonar template y verificar que funciona.

```bash
# Clonar template a ubicación de prueba
cp -r /home/forma/templates/bot-template /tmp/test-template

# Reemplazar placeholders manualmente
cd /tmp/test-template
sed -i 's/{{CLIENT_ID}}/test-client/g' .env.template
sed -i 's/{{LOCATION_ID}}/test-local/g' .env.template
sed -i 's/{{PORT}}/9999/g' .env.template
# ... (reemplazar todos los placeholders)

# Renombrar .env.template a .env
mv .env.template .env

# Instalar dependencias
cd bot
npm install

# Verificar que no hay errores de sintaxis
node -c agent.js
node -c orchestrator.js

# Limpiar
rm -rf /tmp/test-template
```

**Criterios de Aceptación**:
- [ ] Template creado en `/home/forma/templates/bot-template`
- [ ] Todos los placeholders documentados
- [ ] README.md completo
- [ ] Template probado sin errores de sintaxis

---

### TAREA 1.3: Crear Sistema de Configuración (4 horas)

**Objetivo**: Definir el esquema de configuración por cliente.

#### Sub-tarea 1.3.1: Crear JSON Schema (2h)

```bash
cat > /home/forma/config/client-schema.json <<'EOF'
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Client Configuration",
  "type": "object",
  "required": ["client_id", "name", "business"],
  "properties": {
    "client_id": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "Unique client identifier (lowercase, no spaces)"
    },
    "name": {
      "type": "string",
      "description": "Client display name"
    },
    "enabled": {
      "type": "boolean",
      "default": true,
      "description": "Whether the client is active"
    },
    "created": {
      "type": "string",
      "format": "date-time",
      "description": "Creation timestamp"
    },
    "ports": {
      "type": "object",
      "required": ["dashboard", "bots"],
      "properties": {
        "dashboard": {
          "type": "number",
          "minimum": 3000,
          "maximum": 65535,
          "description": "Port for client dashboard"
        },
        "bots": {
          "type": "array",
          "items": {
            "type": "number",
            "minimum": 3000,
            "maximum": 65535
          },
          "description": "Ports for bot instances"
        }
      }
    },
    "business": {
      "type": "object",
      "required": ["name", "phone"],
      "properties": {
        "name": { "type": "string" },
        "phone": { "type": "string" },
        "address": { "type": "string" },
        "hours": { "type": "string" }
      }
    },
    "admins": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Admin WhatsApp numbers"
    },
    "features": {
      "type": "object",
      "properties": {
        "voice_messages": { "type": "boolean", "default": false },
        "payments": { "type": "boolean", "default": false }
      }
    }
  }
}
EOF
```

#### Sub-tarea 1.3.2: Crear Configuración de Ejemplo (1h)

```bash
cat > /home/forma/config/client-example.json <<'EOF'
{
  "client_id": "dolce-party",
  "name": "Dolce Party",
  "enabled": true,
  "created": "2026-05-10T00:00:00Z",
  "ports": {
    "dashboard": 5000,
    "bots": [5001, 5002]
  },
  "business": {
    "name": "Dolce Party - Cotillón",
    "phone": "+54351XXXXXXX",
    "address": "Santa Ana, Córdoba",
    "hours": "Lun-Sáb: 9-20hs"
  },
  "admins": ["+54351XXXXXXX"],
  "features": {
    "voice_messages": false,
    "payments": false
  }
}
EOF
```

#### Sub-tarea 1.3.3: Crear Validador de Configuración (1h)

```bash
cat > /home/forma/scripts/validate-config.js <<'EOF'
#!/usr/bin/env node

const fs = require('fs');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv();
addFormats(ajv);

// Load schema
const schema = JSON.parse(fs.readFileSync('/home/forma/config/client-schema.json', 'utf8'));
const validate = ajv.compile(schema);

// Load config
const configPath = process.argv[2];
if (!configPath) {
  console.error('Usage: validate-config.js <config-file>');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Validate
const valid = validate(config);

if (valid) {
  console.log('✅ Configuration is valid');
  process.exit(0);
} else {
  console.error('❌ Configuration is invalid:');
  console.error(validate.errors);
  process.exit(1);
}
EOF

chmod +x /home/forma/scripts/validate-config.js

# Instalar dependencias
cd /home/forma/scripts
npm init -y
npm install ajv ajv-formats
```

**Criterios de Aceptación**:
- [ ] Schema JSON creado
- [ ] Ejemplo de configuración válido
- [ ] Validador funciona correctamente

---

### TAREA 1.4: Sistema de Gestión de Puertos (6 horas)

**Objetivo**: Crear sistema automático para asignar puertos sin conflictos.

#### Sub-tarea 1.4.1: Crear Registro de Puertos (2h)

```bash
cat > /home/forma/config/port-registry.json <<'EOF'
{
  "platform": {
    "dashboard_maestro": 3000
  },
  "clients": {},
  "next_available": 5000,
  "reserved": [3000, 3011, 4000, 4011]
}
EOF
```

#### Sub-tarea 1.4.2: Implementar Port Manager (3h)

```bash
cat > /home/forma/scripts/port-manager.js <<'EOF'
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const REGISTRY_FILE = '/home/forma/config/port-registry.json';

class PortManager {
  constructor() {
    this.loadRegistry();
  }
  
  loadRegistry() {
    if (fs.existsSync(REGISTRY_FILE)) {
      this.registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
    } else {
      throw new Error('Port registry not found');
    }
  }
  
  saveRegistry() {
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(this.registry, null, 2));
  }
  
  assignDashboard(clientId) {
    if (this.registry.clients[clientId]) {
      throw new Error(`Client ${clientId} already exists`);
    }
    
    const port = this.registry.next_available;
    this.registry.next_available += 10;  // Reserve block of 10
    this.registry.reserved.push(port);
    
    this.registry.clients[clientId] = { dashboard: port, bots: [] };
    this.saveRegistry();
    
    return port;
  }
  
  assignBots(clientId, count) {
    if (!this.registry.clients[clientId]) {
      throw new Error(`Client ${clientId} not found`);
    }
    
    const ports = [];
    const basePort = this.registry.clients[clientId].dashboard + 1;
    
    for (let i = 0; i < count; i++) {
      const port = basePort + i;
      
      if (this.registry.reserved.includes(port)) {
        throw new Error(`Port ${port} already reserved`);
      }
      
      ports.push(port);
      this.registry.reserved.push(port);
    }
    
    this.registry.clients[clientId].bots = ports;
    this.saveRegistry();
    
    return ports;
  }
  
  release(clientId) {
    if (!this.registry.clients[clientId]) {
      throw new Error(`Client ${clientId} not found`);
    }
    
    const client = this.registry.clients[clientId];
    
    // Remove from reserved
    this.registry.reserved = this.registry.reserved.filter(
      p => p !== client.dashboard && !client.bots.includes(p)
    );
    
    delete this.registry.clients[clientId];
    this.saveRegistry();
  }
  
  list() {
    return this.registry;
  }
  
  isAvailable(port) {
    return !this.registry.reserved.includes(port);
  }
}

// CLI
const manager = new PortManager();
const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

try {
  switch (command) {
    case 'assign-dashboard':
      if (!arg1) throw new Error('Client ID required');
      console.log(manager.assignDashboard(arg1));
      break;
      
    case 'assign-bots':
      if (!arg1 || !arg2) throw new Error('Client ID and count required');
      console.log(manager.assignBots(arg1, parseInt(arg2)).join(' '));
      break;
      
    case 'release':
      if (!arg1) throw new Error('Client ID required');
      manager.release(arg1);
      console.log(`Released ports for ${arg1}`);
      break;
      
    case 'list':
      console.log(JSON.stringify(manager.list(), null, 2));
      break;
      
    case 'check':
      if (!arg1) throw new Error('Port required');
      const available = manager.isAvailable(parseInt(arg1));
      console.log(available ? 'Available' : 'Reserved');
      process.exit(available ? 0 : 1);
      break;
      
    default:
      console.error('Usage: port-manager.js <command> [args]');
      console.error('Commands:');
      console.error('  assign-dashboard <client-id>');
      console.error('  assign-bots <client-id> <count>');
      console.error('  release <client-id>');
      console.error('  list');
      console.error('  check <port>');
      process.exit(1);
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
EOF

chmod +x /home/forma/scripts/port-manager.js
```

#### Sub-tarea 1.4.3: Probar Port Manager (1h)

```bash
# Test 1: Assign dashboard
node /home/forma/scripts/port-manager.js assign-dashboard test-client
# Expected: 5000

# Test 2: Assign bots
node /home/forma/scripts/port-manager.js assign-bots test-client 3
# Expected: 5001 5002 5003

# Test 3: List
node /home/forma/scripts/port-manager.js list
# Expected: JSON with test-client

# Test 4: Check port
node /home/forma/scripts/port-manager.js check 5000
# Expected: Reserved

node /home/forma/scripts/port-manager.js check 6000
# Expected: Available

# Test 5: Release
node /home/forma/scripts/port-manager.js release test-client
# Expected: Released ports for test-client

# Test 6: Verify release
node /home/forma/scripts/port-manager.js list
# Expected: test-client removed
```

**Criterios de Aceptación**:
- [ ] Port manager funciona correctamente
- [ ] No permite conflictos de puertos
- [ ] Persiste el registro en JSON
- [ ] Todos los tests pasan

---

## ✅ CRITERIOS DE ACEPTACIÓN FINAL DE LA FASE 1

Al completar esta fase, debes poder demostrar:

1. **Estructura creada**:
   ```bash
   ls -la /home/forma/ | grep -E "(dashboard-maestro|clients|scripts|templates|config)"
   ```

2. **Template funcional**:
   ```bash
   ls -la /home/forma/templates/bot-template/
   cat /home/forma/templates/bot-template/README.md
   ```

3. **Configuración validable**:
   ```bash
   node /home/forma/scripts/validate-config.js /home/forma/config/client-example.json
   # Output: ✅ Configuration is valid
   ```

4. **Port manager operativo**:
   ```bash
   node /home/forma/scripts/port-manager.js list
   # Output: JSON con registro de puertos
   ```

5. **Ambientes actuales intactos**:
   ```bash
   pm2 list
   # bot_dolce y bot_testing deben seguir corriendo
   
   curl http://localhost:3000
   # Dashboard de producción debe responder
   ```

---

## 🚨 REGLAS IMPORTANTES

### ❌ NO HACER:
- NO tocar `/home/forma/bot_dolce` (producción)
- NO tocar `/home/forma/bot_testing` (testing)
- NO detener procesos PM2 existentes
- NO modificar puertos actuales (3000, 3011, 4000, 4011)
- NO hacer cambios que rompan funcionalidad actual

### ✅ SÍ HACER:
- Crear nuevos directorios
- Copiar archivos (no mover)
- Probar en ubicaciones temporales
- Documentar todo lo que hagas
- Hacer commits frecuentes si usas git
- Pedir confirmación antes de acciones irreversibles

---

## 📝 ENTREGABLES

Al finalizar, debes entregar:

1. **Reporte de progreso** con:
   - Tareas completadas
   - Problemas encontrados
   - Soluciones aplicadas
   - Tiempo invertido por tarea

2. **Documentación** de:
   - Estructura de directorios creada
   - Placeholders del template
   - Esquema de configuración
   - Uso del port manager

3. **Scripts funcionales**:
   - `validate-config.js`
   - `port-manager.js`

4. **Verificación** de que:
   - Ambientes actuales siguen funcionando
   - Template es reutilizable
   - Port manager previene conflictos

---

## 🔄 PRÓXIMOS PASOS (Fase 2)

Una vez completada esta fase, continuaremos con:
- Fase 2: Dashboard Maestro (monitoreo centralizado)
- Fase 3: Scripts de automatización (add-client.sh, etc.)

---

## 📞 SOPORTE

Si encuentras problemas o necesitas clarificación:
1. Documenta el problema específico
2. Incluye logs de error
3. Describe qué intentaste
4. Pregunta antes de hacer cambios destructivos

---

**IMPORTANTE**: Esta fase es la fundación de todo el sistema. Tómate el tiempo necesario para hacerlo bien. Es mejor ir despacio y seguro que rápido y romper producción.

**¡Éxito con la implementación!** 🚀
