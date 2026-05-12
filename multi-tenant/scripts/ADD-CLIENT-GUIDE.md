# 📘 Guía: add-client.sh

Script para agregar nuevos clientes al sistema multi-tenant en 10-15 minutos.

---

## 🎯 Qué Hace

El script `add-client.sh` automatiza completamente el proceso de agregar un nuevo cliente:

1. ✅ Asigna puertos automáticamente (sin conflictos)
2. ✅ Crea estructura de directorios
3. ✅ Clona el template del bot
4. ✅ Genera configuración personalizada
5. ✅ Instala dependencias
6. ✅ Configura PM2
7. ✅ Abre puertos en firewall
8. ✅ Rollback automático si algo falla

---

## 📋 Requisitos

- Node.js instalado
- PM2 instalado
- Permisos sudo (para firewall)
- Template del bot en `../templates/bot-template/`

---

## 🚀 Uso Básico

### Modo Interactivo (Recomendado)

```bash
cd /home/forma/multi-tenant/scripts
./add-client.sh
```

El script te preguntará:
1. **Client ID**: Identificador único (ej: `dolce-party`)
2. **Nombre**: Nombre del cliente (ej: `Dolce Party`)
3. **Teléfono**: Teléfono del negocio (ej: `+54351123456`)
4. **Dirección**: Dirección física
5. **Horario**: Horario de atención (ej: `Lun-Sáb 9-20hs`)
6. **Locations**: Número de locales (ej: `2`)
7. **Admin**: WhatsApp del administrador

---

## 🧪 Modo de Prueba

Para probar sin riesgo:

```bash
./test-add-client.sh
```

Esto creará un cliente de prueba llamado `test-client`.

---

## 📊 Ejemplo Completo

```bash
$ ./add-client.sh

╔════════════════════════════════════════╗
║     Add Client - Multi-Tenant         ║
╚════════════════════════════════════════╝

Por favor, ingresa la información del nuevo cliente:

Client ID (ej: dolce-party): panaderia-lopez
Nombre del cliente (ej: Dolce Party): Panadería López
Teléfono del negocio (con código de país): +54351987654
Dirección del negocio: Av. Colón 1234, Córdoba
Horario de atención (ej: Lun-Sáb 9-20hs): Lun-Dom 7-22hs
Número de locations/locales: 2
Número de WhatsApp del admin (con código de país): +54351123456

═══════════════════════════════════════
📋 Resumen:
  Client ID: panaderia-lopez
  Nombre: Panadería López
  Teléfono: +54351987654
  Dirección: Av. Colón 1234, Córdoba
  Horario: Lun-Dom 7-22hs
  Locations: 2
  Admin: +54351123456
═══════════════════════════════════════

¿Continuar? (y/n): y

📡 Asignando puertos...
✓ Dashboard port: 5010
✓ Bot ports: 5011 5012
📁 Creando estructura de directorios...
✓ Creado: local-1
✓ Creado: local-2
✅ Estructura creada
📦 Clonando template...
✓ Template clonado para local-1
✓ Template clonado para local-2
✅ Template clonado
⚙️  Generando configuración...
✅ Configuración válida
📦 Instalando dependencias...
Instalando en local-1...
✓ Dependencias instaladas en local-1
Instalando en local-2...
✓ Dependencias instaladas en local-2
✅ Dependencias instaladas
🔧 Configurando PM2...
✅ PM2 configurado
🔥 Configurando firewall...
✓ Puerto 5010 abierto
✓ Puerto 5011 abierto
✓ Puerto 5012 abierto
✅ Firewall configurado

╔════════════════════════════════════════╗
║  ✅ Cliente Agregado Exitosamente      ║
╚════════════════════════════════════════╝

📊 Resumen:
  Cliente ID: panaderia-lopez
  Nombre: Panadería López
  Locations: 2
  Dashboard Port: 5010
  Bot Ports: 5011 5012

📱 Próximos pasos:

1. Iniciar los bots:
   cd /home/forma/multi-tenant/clients/panaderia-lopez
   pm2 start ecosystem.config.js

2. Escanear códigos QR:
   pm2 logs bot-panaderia-lopez-local-1 --lines 50
   pm2 logs bot-panaderia-lopez-local-2 --lines 50

3. Editar catálogos:
   nano /home/forma/multi-tenant/clients/panaderia-lopez/local-1/catalogs/catalogo.js
   nano /home/forma/multi-tenant/clients/panaderia-lopez/local-2/catalogs/catalogo.js

4. Copiar API keys:
   Editar archivos .env en cada location y agregar:
   - GEMINI_API_KEY
   - OPENROUTER_API_KEY

🔧 Comandos útiles:
  Ver logs: pm2 logs bot-panaderia-lopez-local-1
  Reiniciar: pm2 restart bot-panaderia-lopez-local-1
  Detener: pm2 stop bot-panaderia-lopez-local-1
```

---

## 📁 Estructura Creada

Después de ejecutar el script, se crea:

```
clients/panaderia-lopez/
├── config/
│   └── client.json              # Configuración del cliente
├── ecosystem.config.js          # PM2 configuration
├── local-1/
│   ├── bot/                     # Código del bot
│   │   ├── orchestrator.js
│   │   ├── agent.js
│   │   └── lib/
│   ├── catalogs/
│   │   └── catalogo.js          # Catálogo de productos
│   ├── data/                    # Base de datos
│   ├── logs/                    # Logs
│   ├── .wwebjs_auth/           # Sesión WhatsApp
│   ├── .env                     # Variables de entorno
│   ├── dashboard-humano.js      # Dashboard para empleados
│   └── package.json
└── local-2/
    └── [misma estructura]
```

---

## ⚙️ Configuración Post-Instalación

### 1. Copiar API Keys

Editar cada `.env`:

```bash
nano /home/forma/multi-tenant/clients/panaderia-lopez/local-1/.env
```

Agregar:
```env
GEMINI_API_KEY=tu_api_key_aqui
OPENROUTER_API_KEY=tu_api_key_aqui
```

### 2. Editar Catálogo

```bash
nano /home/forma/multi-tenant/clients/panaderia-lopez/local-1/catalogs/catalogo.js
```

Agregar productos:
```javascript
categorias: [
  {
    nombre: "Panadería",
    productos: [
      { nombre: "Pan francés", precio: 150, descripcion: "Pan fresco del día" },
      { nombre: "Medialunas", precio: 200, descripcion: "Docena de medialunas" }
    ]
  }
]
```

### 3. Iniciar Bots

```bash
cd /home/forma/multi-tenant/clients/panaderia-lopez
pm2 start ecosystem.config.js
pm2 save
```

### 4. Escanear QR

```bash
pm2 logs bot-panaderia-lopez-local-1 --lines 50
```

Escanear el código QR con WhatsApp.

---

## 🚨 Troubleshooting

### Error: "Client ID ya existe"
**Solución**: Usar otro ID o eliminar el cliente existente:
```bash
rm -rf ../clients/panaderia-lopez
node port-manager.js release panaderia-lopez
```

### Error: "Port already reserved"
**Solución**: Verificar puertos disponibles:
```bash
node port-manager.js list
```

### Error: "npm install failed"
**Solución**: Verificar conexión a internet y permisos:
```bash
cd /home/forma/multi-tenant/clients/panaderia-lopez/local-1
npm install
```

### Error: "Permission denied (firewall)"
**Solución**: Ejecutar con sudo o abrir puertos manualmente:
```bash
sudo ufw allow 5010/tcp
sudo ufw allow 5011/tcp
```

---

## 🔄 Rollback Automático

Si algo falla durante la ejecución, el script hace rollback automático:

1. Libera los puertos asignados
2. Elimina el directorio del cliente
3. Muestra mensaje de error

No quedan cambios parciales en el sistema.

---

## 🧹 Eliminar Cliente

Para eliminar un cliente completamente:

```bash
# 1. Detener procesos PM2
pm2 delete bot-panaderia-lopez-local-1
pm2 delete bot-panaderia-lopez-local-2
pm2 save

# 2. Liberar puertos
node port-manager.js release panaderia-lopez

# 3. Cerrar puertos firewall (opcional)
sudo ufw delete allow 5010/tcp
sudo ufw delete allow 5011/tcp
sudo ufw delete allow 5012/tcp

# 4. Eliminar directorio
rm -rf ../clients/panaderia-lopez
```

O usar el script `remove-client.sh` (cuando esté disponible).

---

## 📊 Verificación

Después de agregar un cliente, verificar:

```bash
# 1. Estructura creada
ls -la /home/forma/multi-tenant/clients/panaderia-lopez/

# 2. Configuración válida
node validate-config.js ../clients/panaderia-lopez/config/client.json

# 3. Puertos asignados
node port-manager.js list

# 4. PM2 procesos
pm2 list | grep panaderia-lopez

# 5. Logs
pm2 logs bot-panaderia-lopez-local-1 --lines 20
```

---

## 💡 Tips

1. **Client ID**: Usar formato `nombre-apellido` o `negocio-sucursal`
2. **Locations**: Empezar con 1, agregar más después si es necesario
3. **API Keys**: Copiar de un cliente existente (ej: bot_dolce)
4. **Catálogo**: Empezar simple, agregar productos gradualmente
5. **Testing**: Probar primero con `test-add-client.sh`

---

## 🔗 Scripts Relacionados

- `port-manager.js` - Gestión de puertos
- `validate-config.js` - Validación de configuración
- `remove-client.sh` - Eliminar cliente (futuro)
- `update-client.sh` - Actualizar cliente (futuro)

---

**Última actualización**: 2026-05-10  
**Versión**: 1.0
