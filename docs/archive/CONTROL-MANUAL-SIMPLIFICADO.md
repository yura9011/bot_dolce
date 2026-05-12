# Sistema de Control Manual Simplificado

## 🎯 Cambios Implementados

### ❌ Eliminado
- **Detección automática de intervención manual** (causaba falsos positivos)
- **Set de mensajes del bot** (ya no necesario)
- **Event handler `message_create`** (problemático)

### ✅ Mantenido
- **Handoff cuando usuario pide "humano"** → se pausa automáticamente
- **Comandos administrativos** para control manual
- **Persistencia de pausas** (sobrevive reinicio)
- **Historial de conversaciones**

---

## 🎮 Comandos Disponibles

### Para Admins (números configurados en .env)

#### 1. **PAUSAR [numero]**
Pausa un usuario específico manualmente.

**Uso:**
```
PAUSAR 5491158647529
```

**Respuesta:**
```
✅ Usuario 5491158647529 pausado. El bot dejará de responderle.
```

**Casos:**
- ✅ Usuario tiene conversación activa → se pausa
- ⚠️ Usuario no tiene conversación → mensaje de error

---

#### 2. **REANUDAR [numero]**
Reactiva un usuario pausado.

**Uso:**
```
REANUDAR 5491158647529
```

**Respuesta:**
```
✅ Usuario 5491158647529 reanudado. El bot volverá a responderle.
```

---

#### 3. **ESTADO BOT**
Muestra el estado global y usuarios pausados.

**Uso:**
```
ESTADO BOT
```

**Respuesta:**
```
📊 Estado del Bot

• Global: ✅ Activo
• Usuarios pausados: 2

Usuarios en atención manual:
  - 5491158647529 (hace 5 min)
  - 5493513782559 (hace 12 min)
```

---

#### 4. **PAUSAR BOT GLOBAL**
Pausa todo el bot (no responde a ningún cliente).

**Uso:**
```
PAUSAR BOT GLOBAL
```

**Respuesta:**
```
✅ Bot pausado globalmente. Ningún cliente recibirá respuestas automáticas.
```

---

#### 5. **REANUDAR BOT GLOBAL**
Reactiva el bot globalmente.

**Uso:**
```
REANUDAR BOT GLOBAL
```

**Respuesta:**
```
✅ Bot reanudado globalmente. Volviendo a responder automáticamente.
```

---

## 🤖 Handoff Automático

### Cuando Usuario Pide Humano

**Usuario escribe:**
- "quiero hablar con un humano"
- "necesito un humano"
- "hablar con una persona"
- etc. (cualquier mensaje que contenga "humano")

**Bot responde:**
```
Entendido 👋 Un agente se va a comunicar con vos a la brevedad. ¡Gracias por tu paciencia!
```

**Resultado:**
- ✅ Usuario queda pausado automáticamente
- ✅ Bot deja de responder a ese usuario
- ✅ Se registra en logs como "handoff_solicitado"

**Para reactivar:**
```
REANUDAR [numero]
```

---

## 📋 Flujo de Trabajo Recomendado

### Escenario 1: Cliente Confundido
```
1. Cliente escribe cosas raras al bot
2. Admin escribe: PAUSAR [numero_cliente]
3. Admin atiende manualmente desde WhatsApp Web
4. Cuando termina: REANUDAR [numero_cliente]
```

### Escenario 2: Cliente Pide Humano
```
1. Cliente: "quiero hablar con un humano"
2. Bot: "Un agente se va a comunicar..."
3. Bot se pausa automáticamente
4. Admin atiende desde WhatsApp Web
5. Cuando termina: REANUDAR [numero_cliente]
```

### Escenario 3: Mantenimiento
```
1. Admin: PAUSAR BOT GLOBAL
2. Bot deja de responder a todos
3. Admin hace mantenimiento/testing
4. Admin: REANUDAR BOT GLOBAL
```

---

## 🔧 Configuración

### Números Admin

En `.env`:
```
ADMIN_NUMBERS=5491158647529,5493513782559,119340145860821
```

**Formatos soportados:**
- `@c.us` (WhatsApp normal)
- `@lid` (WhatsApp Web/Business)

---

## 📁 Archivos de Persistencia

### `data/pausas.json`
```json
{
  "global": false,
  "usuarios": {
    "5491158647529@c.us": {
      "pausado": true,
      "timestamp": 1234567890,
      "razon": "pausado_por_admin",
      "notificado": false
    }
  },
  "timestamp": 1234567890
}
```

### `data/historial.json`
```json
{
  "5491158647529@c.us": [
    {
      "timestamp": 1234567890,
      "role": "user",
      "text": "hola"
    },
    {
      "timestamp": 1234567891,
      "role": "bot", 
      "text": "¡Hola! Bienvenido..."
    }
  ]
}
```

---

## 🧪 Testing

### Test 1: Handoff Automático
```
1. Usuario: "quiero hablar con un humano"
2. Verificar: Bot responde y se pausa
3. Usuario: "hola" 
4. Verificar: Bot NO responde
5. Admin: REANUDAR [numero]
6. Usuario: "hola"
7. Verificar: Bot responde normalmente
```

### Test 2: Pausa Manual
```
1. Usuario inicia conversación normal
2. Admin: PAUSAR [numero]
3. Usuario: "hola"
4. Verificar: Bot NO responde
5. Admin: REANUDAR [numero]
6. Usuario: "hola"
7. Verificar: Bot responde normalmente
```

### Test 3: Pausa Global
```
1. Admin: PAUSAR BOT GLOBAL
2. Cualquier usuario: "hola"
3. Verificar: Bot NO responde a nadie
4. Admin: REANUDAR BOT GLOBAL
5. Usuario: "hola"
6. Verificar: Bot responde normalmente
```

---

## ✅ Ventajas de Esta Solución

1. **Sin falsos positivos** - No más detección automática problemática
2. **Control total** - Admin decide cuándo pausar/reanudar
3. **Handoff automático** - Cuando cliente pide humano
4. **Persistencia** - Estado se mantiene al reiniciar
5. **Simplicidad** - Lógica clara y predecible
6. **Flexibilidad** - Pausa individual o global

---

## ⚠️ Limitaciones

1. **No detecta automáticamente** cuando personal responde manualmente
2. **Requiere comando explícito** para pausar usuarios
3. **Admin debe recordar** reanudar usuarios después de atender

---

## 🎯 Casos de Uso

### ✅ Funciona Bien Para:
- Cliente pide hablar con humano
- Admin quiere pausar bot para cliente específico
- Mantenimiento del bot
- Control total sobre cuándo el bot responde

### ❌ No Funciona Para:
- Detección automática de respuestas manuales
- Pausas automáticas basadas en comportamiento
- Integración con sistemas de tickets externos

---

## 📊 Comparación

| Característica | Antes (Automático) | Ahora (Manual) |
|----------------|-------------------|----------------|
| Falsos positivos | ❌ Muchos | ✅ Ninguno |
| Control admin | ✅ Sí | ✅ Sí |
| Handoff usuario | ✅ Sí | ✅ Sí |
| Detección auto | ❌ Problemática | ❌ Removida |
| Simplicidad | ❌ Complejo | ✅ Simple |
| Confiabilidad | ❌ Baja | ✅ Alta |

---

## 🚀 Próximos Pasos

1. **Testing completo** de los comandos
2. **Documentar** flujo de trabajo para el personal
3. **Capacitar** al equipo en los comandos
4. **Monitorear** uso en producción
5. **Evaluar** si se necesita detección automática en el futuro