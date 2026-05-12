# Milestone: Dashboard Humano Estilo WhatsApp Web

**Prioridad**: Alta  
**Tipo**: Mejora de UX + Seguridad  
**Duración Estimada**: 3-4 horas  
**Estado**: 📋 Planificado

---

## 🎯 Objetivo

Mejorar el Dashboard Humano actual para que sea **intuitivo y familiar** para los empleados del cotillón, usando un diseño similar a WhatsApp Web.

---

## 📊 Problema Actual

### Situación Actual:
- ✅ Sistema de control manual funciona (pausar/reanudar con "MUCHAS GRACIAS")
- ❌ Dashboard humano es básico y poco intuitivo
- ❌ Empleados prefieren responder desde el teléfono
- ❌ No hay vista clara de conversaciones pendientes
- ❌ Interfaz no familiar para usuarios no técnicos

### Impacto:
- Empleados no usan el dashboard
- Responden desde teléfono (menos eficiente)
- No hay registro centralizado de atención humana
- Difícil de escalar a múltiples empleados

---

## 🎨 Solución Propuesta

### Dashboard Estilo WhatsApp Web

**Características principales**:
1. **Lista de chats** (izquierda) - Similar a WhatsApp
2. **Área de conversación** (derecha) - Mensajes en tiempo real
3. **Indicadores visuales** - Colores para prioridad
4. **Botones rápidos** - "MUCHAS GRACIAS" en un click
5. **Notificaciones** - Sonido cuando llega mensaje

---

## 📐 Diseño Detallado

### Layout Principal

```
┌─────────────────────────────────────────────────────────────────┐
│  🎈 Dolce Party - Santa Ana                    [👤 María] [⚙️]  │
├──────────────────┬──────────────────────────────────────────────┤
│                  │                                              │
│  📱 Chats (3)    │  👤 Juan Pérez (+54 351 123-4567)          │
│  ─────────────   │  🔴 Esperando respuesta                     │
│                  │  ─────────────────────────────────────────  │
│  🔍 Buscar...    │                                              │
│                  │  ┌────────────────────────────────────────┐ │
│  ┌────────────┐  │  │ Hola, necesito 100 globos      10:30  │ │
│  │ 🔴 Juan P. │  │  └────────────────────────────────────────┘ │
│  │ Necesito.. │  │                                              │
│  │ 10:30  [3] │  │      ┌──────────────────────────────────┐  │
│  └────────────┘  │      │ ¡Hola! ¿Para qué fecha?   10:31 │  │
│                  │      └──────────────────────────────────┘  │
│  ┌────────────┐  │                                              │
│  │ 🟢 María G.│  │  ┌────────────────────────────────────────┐ │
│  │ Gracias!   │  │  │ Para mañana a las 15hs         10:32  │ │
│  │ 09:15      │  │  └────────────────────────────────────────┘ │
│  └────────────┘  │                                              │
│                  │  ┌────────────────────────────────────────┐ │
│  ┌────────────┐  │  │ Necesito hablar con alguien    10:33  │ │
│  │ ⚪ Pedro L.│  │  └────────────────────────────────────────┘ │
│  │ Hola       │  │                                              │
│  │ Ayer       │  │      ┌──────────────────────────────────┐  │
│  └────────────┘  │      │ 🤖 Entendido 👋 Un agente... │  │
│                  │      └──────────────────────────────────┘  │
│                  │                                              │
│                  │  ⚠️ BOT PAUSADO - Responder manualmente     │
│                  │                                              │
│                  │  ─────────────────────────────────────────  │
│                  │  ┌──────────────────────────────────────┐   │
│                  │  │ Escribe tu mensaje...                │   │
│                  │  └──────────────────────────────────────┘   │
│                  │  [📎] [😊] [Enviar] [✅ MUCHAS GRACIAS]    │
│                  │                                              │
└──────────────────┴──────────────────────────────────────────────┘
```

---

## 🎨 Especificaciones de Diseño

### Colores e Indicadores

| Estado | Color | Icono | Significado |
|--------|-------|-------|-------------|
| Urgente | 🔴 Rojo | Badge con número | Cliente esperando humano |
| Activo | 🟢 Verde | Sin badge | Conversación humana activa |
| Bot | ⚪ Gris | Sin badge | Bot manejando (no requiere atención) |
| Nuevo | 🔵 Azul | Badge "NUEVO" | Mensaje no leído |

### Tipografía
- **Fuente**: System UI (Segoe UI, Roboto, etc.)
- **Tamaños**:
  - Nombres: 16px bold
  - Mensajes: 14px regular
  - Hora: 12px light
  - Preview: 14px light

### Espaciado
- Padding interno: 12px
- Margen entre chats: 8px
- Ancho lista chats: 350px
- Ancho área conversación: Resto (flex)

---

## 🔧 Funcionalidades

### 1. Lista de Chats (Sidebar)

**Características**:
- ✅ Ordenados por más reciente primero
- ✅ Indicador de estado (🔴🟢⚪)
- ✅ Badge con número de mensajes no leídos
- ✅ Preview del último mensaje (truncado)
- ✅ Hora del último mensaje
- ✅ Búsqueda por nombre o número
- ✅ Filtros: Todos / Pendientes / Activos / Bot

**Interacción**:
- Click en chat → Abre conversación
- Hover → Resalta con fondo gris claro
- Seleccionado → Fondo verde claro

### 2. Área de Conversación

**Características**:
- ✅ Mensajes del cliente alineados a la izquierda (fondo blanco)
- ✅ Mensajes del humano alineados a la derecha (fondo verde claro)
- ✅ Mensajes del bot con icono 🤖
- ✅ Timestamp en cada mensaje
- ✅ Scroll automático a último mensaje
- ✅ Indicador "BOT PAUSADO" cuando aplica
- ✅ Indicador "escribiendo..." cuando cliente escribe

**Interacción**:
- Scroll suave
- Click en mensaje → Opciones (copiar, reenviar)
- Doble click → Seleccionar texto

### 3. Input de Mensaje

**Características**:
- ✅ Textarea con auto-resize (max 5 líneas)
- ✅ Placeholder: "Escribe tu mensaje..."
- ✅ Enter → Enviar (Shift+Enter → Nueva línea)
- ✅ Botón [📎] → Adjuntar imagen (futuro)
- ✅ Botón [😊] → Selector de emojis
- ✅ Botón [Enviar] → Enviar mensaje
- ✅ Botón [✅ MUCHAS GRACIAS] → Finalizar y reactivar bot

**Validación**:
- No enviar mensajes vacíos
- Máximo 4096 caracteres (límite WhatsApp)
- Deshabilitar si no hay chat seleccionado

### 4. Notificaciones

**Tipos**:
- 🔔 **Sonido**: Cuando llega mensaje nuevo
- 🔴 **Badge**: Número de chats pendientes en título
- 💬 **Desktop**: Notificación del navegador (opcional)
- 📱 **Vibración**: En móvil (opcional)

**Configuración**:
- Activar/desactivar sonido
- Activar/desactivar notificaciones desktop
- Volumen del sonido

### 5. WebSocket en Tiempo Real

**Eventos**:
- `new_message` → Nuevo mensaje del cliente
- `bot_paused` → Bot pausado, requiere atención
- `bot_resumed` → Bot reactivado
- `typing` → Cliente está escribiendo
- `message_sent` → Mensaje enviado por humano

### 6. Sistema de Autenticación 🔒

**Problema**: Actualmente los dashboards están abiertos sin autenticación. Cualquiera con la URL puede acceder.

**Solución**: Sistema de login simple y seguro

**Características**:
- ✅ Pantalla de login antes de acceder al dashboard
- ✅ Usuarios y contraseñas configurables por cliente
- ✅ Sesiones con JWT (JSON Web Tokens)
- ✅ Timeout de sesión (auto-logout después de inactividad)
- ✅ Roles: Admin (acceso completo) y Empleado (solo chat)
- ✅ Gestión de usuarios desde config/agents.json

**Flujo de Autenticación**:
1. Usuario abre dashboard → Redirige a `/login`
2. Ingresa usuario y contraseña
3. Backend valida credenciales
4. Si es válido → Genera JWT y guarda en cookie/localStorage
5. Redirige a dashboard principal
6. Cada request valida el JWT
7. Si JWT inválido/expirado → Redirige a login

**Configuración en agents.json**:
```json
{
  "id": "santa-ana",
  "dashboardUsers": [
    {
      "username": "maria",
      "password": "$2b$10$...", // bcrypt hash
      "role": "employee",
      "name": "María González"
    },
    {
      "username": "admin",
      "password": "$2b$10$...",
      "role": "admin",
      "name": "Administrador"
    }
  ]
}
```

**Seguridad**:
- Contraseñas hasheadas con bcrypt (nunca en texto plano)
- JWT con expiración de 8 horas
- HTTPS recomendado en producción
- Rate limiting en endpoint de login (prevenir fuerza bruta)
- Logout manual disponible

**UI de Login**:
```
┌─────────────────────────────────────┐
│                                     │
│         🎈 Dolce Party              │
│         Dashboard Humano            │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Usuario                       │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Contraseña                    │  │
│  └───────────────────────────────┘  │
│                                     │
│  [ Recordarme ]                     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │      Iniciar Sesión           │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

---

## 🛠️ Implementación Técnica

### Stack Tecnológico

**Backend**:
- Node.js + Express
- Socket.IO para WebSocket
- Reutilizar código existente de `dashboard-central.js`

**Frontend**:
- HTML5 + CSS3 (sin frameworks pesados)
- Vanilla JavaScript
- Socket.IO client
- LocalStorage para preferencias

### Estructura de Archivos

```
dashboard-humano-v2/
├── server.js                 # Servidor Express + Socket.IO
├── public/
│   ├── index.html           # HTML principal
│   ├── css/
│   │   ├── main.css         # Estilos principales
│   │   ├── chat-list.css    # Estilos lista de chats
│   │   └── conversation.css # Estilos área conversación
│   ├── js/
│   │   ├── app.js           # Lógica principal
│   │   ├── chat-list.js     # Manejo lista de chats
│   │   ├── conversation.js  # Manejo conversación
│   │   ├── websocket.js     # Conexión WebSocket
│   │   └── notifications.js # Sistema de notificaciones
│   └── assets/
│       ├── sounds/
│       │   └── notification.mp3
│       └── icons/
│           └── favicon.ico
└── package.json
```

### API Endpoints

```javascript
// GET /api/chats - Obtener lista de chats
// GET /api/chats/:userId/messages - Obtener mensajes de un chat
// POST /api/chats/:userId/message - Enviar mensaje
// POST /api/chats/:userId/finish - Finalizar (MUCHAS GRACIAS)
// GET /api/chats/:userId/status - Estado del chat (pausado/activo)
```

### WebSocket Events

```javascript
// Cliente → Servidor
socket.emit('join_dashboard', { agentId: 'santa-ana' });
socket.emit('send_message', { userId, message });
socket.emit('finish_conversation', { userId });

// Servidor → Cliente
socket.on('new_message', { userId, message, timestamp });
socket.on('bot_paused', { userId, reason });
socket.on('bot_resumed', { userId });
socket.on('typing', { userId, isTyping });
```

---

## 📋 Tareas de Implementación

### Fase 1: Backend (1 hora)

- [ ] **1.1** Crear servidor Express básico
  - Puerto configurable (default: 3001)
  - Servir archivos estáticos
  - CORS configurado

- [ ] **1.2** Implementar Socket.IO
  - Conexión WebSocket
  - Rooms por agente
  - Eventos básicos

- [ ] **1.3** API REST
  - GET /api/chats
  - GET /api/chats/:userId/messages
  - POST /api/chats/:userId/message
  - POST /api/chats/:userId/finish

- [ ] **1.4** Integración con sistema actual
  - Leer de `data/historial.json`
  - Leer de `data/pausas.json`
  - Escribir mensajes vía WhatsApp client

### Fase 2: Frontend - Estructura (30 min)

- [ ] **2.1** HTML base
  - Layout de 2 columnas
  - Header con título y usuario
  - Sidebar para lista de chats
  - Área principal para conversación

- [ ] **2.2** CSS base
  - Reset CSS
  - Variables de colores
  - Layout responsive
  - Fuentes y tipografía

### Fase 3: Frontend - Lista de Chats (45 min)

- [ ] **3.1** Componente lista de chats
  - Renderizar chats desde API
  - Indicadores de estado
  - Preview de último mensaje
  - Ordenar por más reciente

- [ ] **3.2** Búsqueda y filtros
  - Input de búsqueda
  - Filtrar por nombre/número
  - Filtros por estado

- [ ] **3.3** Interactividad
  - Click para seleccionar
  - Hover effects
  - Actualización en tiempo real

### Fase 4: Frontend - Conversación (45 min)

- [ ] **4.1** Área de mensajes
  - Renderizar mensajes
  - Alineación (cliente/humano)
  - Timestamps
  - Scroll automático

- [ ] **4.2** Input de mensaje
  - Textarea con auto-resize
  - Botones de acción
  - Validación
  - Enter para enviar

- [ ] **4.3** Botón "MUCHAS GRACIAS"
  - Estilo destacado
  - Confirmación
  - Envío automático

### Fase 5: Sistema de Autenticación (45 min)

- [ ] **5.1** Backend - Autenticación
  - Instalar dependencias (bcrypt, jsonwebtoken)
  - Middleware de autenticación
  - Endpoint POST /api/auth/login
  - Endpoint POST /api/auth/logout
  - Validación de JWT en todas las rutas protegidas

- [ ] **5.2** Gestión de usuarios
  - Leer usuarios de config/agents.json
  - Validar credenciales con bcrypt
  - Generar JWT con expiración
  - Rate limiting en login (max 5 intentos/minuto)

- [ ] **5.3** Frontend - Login
  - Página de login (HTML/CSS)
  - Formulario con validación
  - Guardar JWT en localStorage
  - Redirigir a dashboard si autenticado
  - Interceptor para agregar JWT a requests

- [ ] **5.4** Protección de rutas
  - Verificar JWT antes de servir dashboard
  - Redirigir a login si no autenticado
  - Botón de logout en header
  - Auto-logout después de 8 horas

### Fase 6: Notificaciones (30 min)

- [ ] **6.1** Sonido
  - Reproducir al recibir mensaje
  - Control de volumen
  - Activar/desactivar

- [ ] **6.2** Badge en título
  - Actualizar número de pendientes
  - Formato: "(3) Dashboard Humano"

- [ ] **6.3** Notificaciones desktop
  - Solicitar permiso
  - Mostrar notificación
  - Click → Abrir chat

### Fase 7: Testing y Ajustes (30 min)

- [ ] **7.1** Testing funcional
  - Enviar mensajes
  - Recibir mensajes
  - Finalizar conversación
  - Notificaciones
  - Login/Logout
  - Sesiones expiradas

- [ ] **7.2** Testing responsive
  - Desktop (1920x1080)
  - Tablet (768x1024)
  - Móvil (375x667)

- [ ] **7.3** Ajustes finales
  - Correcciones de bugs
  - Mejoras de UX
  - Optimización de performance

---

## ✅ Criterios de Aceptación

### Funcionales:
- [ ] Lista de chats muestra todos los chats activos
- [ ] Indicadores de estado funcionan correctamente
- [ ] Mensajes se muestran en tiempo real
- [ ] Enviar mensaje funciona
- [ ] Botón "MUCHAS GRACIAS" finaliza y reactiva bot
- [ ] Notificaciones suenan cuando llega mensaje
- [ ] Búsqueda de chats funciona
- [ ] **Sistema de login funciona correctamente**
- [ ] **Solo usuarios autorizados pueden acceder**
- [ ] **Sesiones expiran después de 8 horas**

### Seguridad:
- [ ] **Contraseñas hasheadas (nunca en texto plano)**
- [ ] **JWT con expiración configurada**
- [ ] **Rate limiting en login (prevenir fuerza bruta)**
- [ ] **Rutas protegidas con middleware de autenticación**
- [ ] **Logout funciona correctamente**

### No Funcionales:
- [ ] Interfaz intuitiva (similar a WhatsApp Web)
- [ ] Responsive (funciona en móvil)
- [ ] Rápido (< 1 segundo para cargar)
- [ ] Sin errores en consola
- [ ] Accesible (teclado navigation)

### UX:
- [ ] Empleados pueden usarlo sin capacitación
- [ ] Más rápido que responder desde teléfono
- [ ] Interfaz familiar y cómoda

---

## 📊 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Tiempo de respuesta | < 2 minutos |
| Adopción por empleados | > 80% usan dashboard |
| Satisfacción | > 4/5 estrellas |
| Errores | < 1% de mensajes fallan |
| Performance | < 1 segundo carga inicial |

---

## 🚀 Deployment

### Desarrollo:
```bash
cd dashboard-humano-v2
npm install
npm run dev
# Abre en http://localhost:3001
```

### Producción:
```bash
# En VPS
cd /home/forma/bot_dolce
pm2 start dashboard-humano-v2/server.js --name dashboard-humano-santa-ana
pm2 save

# Abrir puerto
sudo ufw allow 3001/tcp

# Acceder desde navegador
http://2.24.89.243:3001
```

---

## 🔗 Relación con Milestone Multi-Tenant

Este milestone es **complementario** al milestone multi-tenant:

- **Ahora**: Implementar para Santa Ana (bot_dolce actual)
- **Fase 4 Multi-Tenant**: Adaptar para múltiples clientes
- **Beneficio**: Probar y mejorar antes de escalar

---

## 📝 Notas Adicionales

### Consideraciones:
- Mantener compatibilidad con sistema actual
- No romper funcionalidad de "MUCHAS GRACIAS" por WhatsApp
- Dashboard es opcional (pueden seguir usando teléfono)
- **Seguridad**: Usar HTTPS en producción para proteger JWT
- **Usuarios**: Crear usuarios iniciales para cada cliente

### Futuras Mejoras:
- Adjuntar imágenes
- Mensajes de voz
- Respuestas rápidas (templates)
- Asignación de conversaciones a empleados específicos
- Estadísticas de atención humana
- **Autenticación con 2FA (Two-Factor Authentication)**
- **Integración con SSO (Single Sign-On)**
- **Logs de auditoría (quién accedió y cuándo)**

---

**Creado**: 2026-05-10  
**Última actualización**: 2026-05-10  
**Estado**: 📋 Planificado  
**Prioridad**: Alta


---

## 🔐 Resumen de Seguridad

### Problema Identificado:
Actualmente cualquier persona con la URL puede acceder a los dashboards sin autenticación.

### Solución Implementada en Milestone:
- Sistema de login con usuario/contraseña
- Contraseñas hasheadas con bcrypt
- Sesiones con JWT (8 horas de expiración)
- Rate limiting para prevenir fuerza bruta
- Middleware de autenticación en todas las rutas
- Roles: Admin y Empleado

### Configuración de Usuarios:
Los usuarios se configuran en `config/agents.json` por cada cliente:

```json
{
  "id": "santa-ana",
  "dashboardUsers": [
    {
      "username": "maria",
      "password": "$2b$10$hashedpassword",
      "role": "employee",
      "name": "María González"
    }
  ]
}
```

### Comandos para Generar Contraseñas:
```bash
# Instalar bcrypt-cli
npm install -g bcrypt-cli

# Generar hash de contraseña
bcrypt-cli "mi_contraseña_segura"
```

**Última actualización**: 2026-05-11
