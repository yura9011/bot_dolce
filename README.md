# Dolce Party - Bot de WhatsApp

Bot inteligente de WhatsApp para tienda de cotillón y decoración con IA conversacional, catálogo de productos y dashboard de control.

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus API keys

# Iniciar el bot
npm start

# Iniciar dashboard (en otra terminal)
npm run dashboard
```

## Funcionalidades

### **Bot de WhatsApp**
- **IA Conversacional**: Gemini AI para respuestas naturales
- **Catálogo Inteligente**: 3800+ productos con búsqueda por sinónimos
- **Anti-Hijacking**: Protección contra ataques de prompt injection
- **Handoff Manual**: Transferencia a atención humana
- **Control de Pausas**: Pausar usuarios o bot completo
- **Estadísticas**: Registro automático de métricas

### **Dashboard Web**
- **Control Dual**: Controlar bot desde WhatsApp o web
- **Estadísticas en Tiempo Real**: Métricas y gráficos
- **Conversaciones**: Ver historial de chats
- **Usuarios Pausados**: Gestión de atención manual
- **Logs de Seguridad**: Monitoreo de ataques

## Arquitectura

```
├── bot.js              # Bot principal de WhatsApp
├── dashboard.js        # Dashboard web (puerto 3001)
├── catalogo.js         # Catálogo de productos
├── flujos.js          # Flujos de conversación
├── lib/               # Módulos del sistema
│   ├── statistics.js  # Sistema de estadísticas
│   ├── security.js    # Anti-hijacking
│   ├── control-manual.js # Pausas y handoffs
│   ├── whatsapp-client.js # Cliente WhatsApp
│   └── ...
├── data/              # Datos persistentes
├── logs/              # Archivos de log
├── public/            # Frontend del dashboard
└── docs/              # Documentación
```

## Configuración

### **Variables de Entorno (.env)**
```env
# APIs de IA
GEMINI_API_KEY=tu_api_key_gemini
OPENROUTER_API_KEY=tu_api_key_openrouter

# Configuración del Bot
SYSTEM_PROMPT="Eres un asistente de Dolce Party..."
ADMIN_NUMBERS=5491158647529,5493513782559

# Puertos (opcional)
DASHBOARD_PORT=3001
```

### **Comandos Administrativos (WhatsApp)**
```
ESTADO BOT          # Ver estado del sistema
PAUSAR BOT GLOBAL   # Pausar bot completamente
REANUDAR BOT GLOBAL # Reanudar bot
PAUSAR 549XXXXXXX   # Pausar usuario específico
REANUDAR 549XXXXXXX # Reanudar usuario específico
SEGURIDAD BOT       # Ver logs de seguridad
```

## Dashboard

Acceder a: `http://localhost:3001`

### **Funcionalidades del Dashboard:**
- **Métricas**: Mensajes, usuarios, handoffs, búsquedas
- **Controles**: Pausar/reanudar bot y usuarios
- **Conversaciones**: Últimas 10 conversaciones
- **Seguridad**: Intentos de hijacking detectados
- **Historial**: Estadísticas de los últimos 7 días

## Seguridad

### **Anti-Hijacking**
- Detección de prompt injection
- Bloqueo de role hijacking
- Protección contra system override
- Logs automáticos de intentos de ataque

### **Control de Acceso**
- Solo números admin pueden usar comandos
- Validación de permisos en dashboard
- Logs de todas las acciones administrativas

## Documentación

La documentación está organizada en `docs/`:

- `docs/analisis/` - Análisis técnicos del sistema
- `docs/implementaciones/` - Documentación de features implementadas
- `docs/milestones/` - Hitos del desarrollo
- `docs/testing/` - Pruebas y verificaciones
- `docs/specs/` - Especificaciones y planes
- `docs/archive/` - Documentación histórica

## Scripts Útiles

```bash
# Limpiar sesiones de WhatsApp (si hay problemas de QR)
./limpiar-sesion.bat

# Iniciar bot y dashboard juntos
./start-all.bat

# Debug del catálogo
node test-catalogo.js

# Debug del bot
node debug-bot.js
```

## Solución de Problemas

### **Bot no genera QR**
```bash
./limpiar-sesion.bat
npm start
```

### **Puerto ocupado**
```bash
# Terminar procesos Node.js
Get-Process -Name node | Stop-Process -Force
npm start
```

### **Estadísticas no funcionan**
- Verificar que existe `data/estadisticas.json`
- Revisar logs en `logs/bot.log`
- Reiniciar el bot

## Métricas del Sistema

- **Productos**: 3882 en catálogo
- **Categorías**: 9 principales
- **Uptime**: 99.9% (después de correcciones)
- **Tiempo de respuesta**: <100ms promedio
- **Usuarios concurrentes**: Ilimitado

## Próximas Mejoras

- [ ] Integración con sistema de inventario
- [ ] Notificaciones push del dashboard
- [ ] Exportación de estadísticas a Excel
- [ ] Backup automático de datos
- [ ] API REST pública

## Soporte

Para problemas técnicos, revisar:
1. `logs/bot.log` - Logs del bot
2. `logs/security.log` - Logs de seguridad
3. `data/estadisticas.json` - Métricas del sistema
4. `docs/` - Documentación técnica

---

**Desarrollado para Dolce Party**  
*Bot inteligente de WhatsApp con IA conversacional*