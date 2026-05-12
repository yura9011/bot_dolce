# Sistema de Control Manual del Bot

## ¿Qué es?

El bot ahora detecta automáticamente cuando el personal del local responde manualmente a un cliente y se pausa para ese cliente específico, evitando que bot y humano respondan al mismo tiempo.

---

## Cómo Funciona (Automático)

### 1. Detección Automática

**Cuando el personal responde manualmente:**
```
[Cliente] Hola, necesito ayuda
[Bot] ¡Hola! Bienvenido a Dolce Party...
[Cliente] No entiendo, quiero hablar con alguien

[Personal responde desde WhatsApp Web]
Hola! Soy María, ¿en qué puedo ayudarte?

[Bot detecta la respuesta manual]
[Bot se PAUSA automáticamente para ese cliente]
[Bot envía al cliente] ⏸️ Un agente está atendiendo tu consulta...

[Cliente sigue escribiendo]
Gracias María, necesito globos...

[Bot NO responde - está pausado]
[Personal sigue atendiendo normalmente]
```

**Ventajas:**
- ✅ No necesitan hacer nada especial
- ✅ El bot se pausa solo cuando detecta intervención manual
- ✅ Solo se pausa para ese cliente, otros siguen siendo atendidos por el bot
- ✅ El cliente recibe una notificación clara

---

## Comandos Administrativos

### Configuración Inicial

En el archivo `.env`, agregar los números autorizados:

```env
ADMIN_NUMBERS=5491171458944,5493515559145
```

Solo estos números pueden ejecutar comandos administrativos.

---

### Comandos Disponibles

#### 1. PAUSAR BOT GLOBAL

**Uso:** Escribir en cualquier chat de WhatsApp:
```
PAUSAR BOT GLOBAL
```

**Qué hace:**
- Pausa el bot COMPLETAMENTE
- El bot NO responde a NINGÚN cliente
- Útil para emergencias o mantenimiento

**Respuesta del bot:**
```
✅ Bot pausado globalmente. Ningún cliente recibirá respuestas automáticas.
```

---

#### 2. REANUDAR BOT GLOBAL

**Uso:**
```
REANUDAR BOT GLOBAL
```

**Qué hace:**
- Reactiva el bot completamente
- Vuelve a responder a todos los clientes

**Respuesta del bot:**
```
✅ Bot reanudado globalmente. Volviendo a responder automáticamente.
```

---

#### 3. ESTADO BOT

**Uso:**
```
ESTADO BOT
```

**Qué hace:**
- Muestra el estado actual del bot
- Lista usuarios en atención manual

**Respuesta del bot:**
```
📊 Estado del Bot

• Global: ✅ Activo
• Usuarios pausados: 2

Usuarios en atención manual:
  - 5491158647529 (hace 5 min)
  - 5493515551234 (hace 12 min)
```

---

#### 4. REANUDAR [numero]

**Uso:**
```
REANUDAR 5491158647529
```

**Qué hace:**
- Reactiva el bot solo para ese cliente específico
- El bot volverá a responderle automáticamente

**Respuesta del bot:**
```
✅ Usuario 5491158647529 reanudado. El bot volverá a responderle.
```

---

## Archivos Generados

### 1. data/pausas.json

**Qué contiene:** Estado actual de pausas

```json
{
  "global": false,
  "usuarios": {
    "5491158647529@c.us": {
      "pausado": true,
      "timestamp": 1713547200000,
      "razon": "intervencion_manual"
    }
  },
  "timestamp": 1713547200000
}
```

**Para qué sirve:**
- Si reiniciás el bot, recuerda qué usuarios están pausados
- No se pierde el control al reiniciar

---

### 2. data/historial.json

**Qué contiene:** Historial completo de conversaciones

```json
{
  "5491158647529@c.us": [
    {
      "timestamp": 1713547200000,
      "role": "user",
      "text": "Hola, necesito ayuda"
    },
    {
      "timestamp": 1713547201000,
      "role": "bot",
      "text": "¡Hola! Bienvenido a Dolce Party..."
    },
    {
      "timestamp": 1713547202000,
      "role": "manual",
      "text": "Hola! Soy María, te ayudo yo"
    }
  ]
}
```

**Para qué sirve:**
- Revisar conversaciones pasadas
- Backup de todo lo que se habló
- Analizar qué consultas son más frecuentes

---

## Casos de Uso

### Caso 1: Cliente Confundido

```
[Cliente] No entiendo nada de lo que me dice el bot
[Personal ve el mensaje en WhatsApp Web]
[Personal responde] Hola! Disculpá la confusión, te ayudo yo
[Bot se pausa automáticamente]
[Personal atiende normalmente]
```

**No necesitan hacer nada especial** - El bot se pausa solo.

---

### Caso 2: Consulta Compleja

```
[Cliente] Necesito 500 globos personalizados para mañana
[Bot] Tenemos globos disponibles...
[Personal ve que es complejo]
[Personal responde] Hola! Para pedidos grandes te ayudo personalmente
[Bot se pausa automáticamente]
[Personal coordina el pedido]
```

---

### Caso 3: Error del Bot

```
[Bot está respondiendo mal por algún motivo]
[Personal desde su teléfono] PAUSAR BOT GLOBAL
[Bot se pausa completamente]
[Personal atiende todos los mensajes manualmente]
[Cuando se soluciona] REANUDAR BOT GLOBAL
```

---

### Caso 4: Horario de Cierre

```
[20:00 - Local cierra]
[Personal] PAUSAR BOT GLOBAL
[Bot deja de responder]
[Clientes que escriben de noche no reciben respuesta]
[09:00 - Local abre]
[Personal] REANUDAR BOT GLOBAL
[Bot vuelve a funcionar]
```

---

## Preguntas Frecuentes

### ¿Qué pasa si reinicio el bot?

**Con persistencia activada:**
- El bot recuerda qué usuarios están pausados
- Carga el estado desde `data/pausas.json`
- No se pierde el control

### ¿Cómo sé si un cliente está pausado?

**Opción 1:** Escribir `ESTADO BOT` para ver la lista

**Opción 2:** Ver los logs en consola:
```
⏸️ Usuario 5491158647529@c.us en atención manual - Bot no responde
```

### ¿El bot se reactiva solo después de un tiempo?

**No.** Una vez pausado, el bot queda pausado hasta que:
- Escribís `REANUDAR [numero]`
- O reiniciás el bot (se limpia todo)

Esto evita que el bot se reactive en horarios de cierre.

### ¿Puedo pausar varios clientes a la vez?

**Sí.** Cada cliente se pausa independientemente. El bot puede estar:
- Activo para Cliente A
- Pausado para Cliente B (atención manual)
- Pausado para Cliente C (atención manual)

### ¿Los comandos funcionan desde cualquier número?

**No.** Solo funcionan desde números configurados en `ADMIN_NUMBERS` del `.env`

### ¿El cliente ve algo cuando se pausa el bot?

**Sí.** Recibe un mensaje:
```
⏸️ Un agente está atendiendo tu consulta. Te responderá en breve.
```

Esto le da claridad de que está siendo atendido por una persona real.

---

## Logs del Sistema

### Logs de Detección

```
🤚 Intervención manual detectada para 5491158647529@c.us
⏸️ Usuario 5491158647529@c.us pausado (intervencion_manual)
```

### Logs de Comandos

```
🔴 Bot pausado globalmente por admin
🟢 Bot reanudado globalmente por admin
▶️ Usuario 5491158647529@c.us reanudado
```

### Logs de Mensajes Ignorados

```
⏸️ Bot pausado globalmente - Mensaje ignorado de 5491158647529@c.us
⏸️ Usuario 5491158647529@c.us en atención manual - Bot no responde
```

---

## Solución de Problemas

### El bot no detecta mi respuesta manual

**Posibles causas:**
1. Estás respondiendo desde un número diferente al que tiene el bot
2. El mensaje es de un tipo ignorado (audio, imagen, etc.)
3. Hay un error en los logs - revisar consola

### Los comandos no funcionan

**Verificar:**
1. Tu número está en `ADMIN_NUMBERS` del `.env`
2. Estás escribiendo el comando exacto (mayúsculas/minúsculas no importan)
3. El bot está corriendo

### El bot sigue respondiendo aunque pausé un usuario

**Verificar:**
1. El número del usuario es correcto (incluye código de país)
2. Ver logs: debería decir "Usuario pausado"
3. Ejecutar `ESTADO BOT` para confirmar que está pausado

---

## Mantenimiento

### Limpiar Historial Antiguo

El archivo `data/historial.json` puede crecer mucho. Para limpiarlo:

1. Detener el bot
2. Borrar o respaldar `data/historial.json`
3. Reiniciar el bot

### Resetear Pausas

Si querés limpiar todas las pausas:

1. Detener el bot
2. Borrar `data/pausas.json`
3. Reiniciar el bot

O usar el comando:
```
REANUDAR BOT GLOBAL
```

---

## Resumen

✅ **Detección automática** - El bot se pausa solo cuando respondés manualmente
✅ **Comandos admin** - Control total con comandos simples
✅ **Persistencia** - No se pierde el estado al reiniciar
✅ **Historial** - Backup de todas las conversaciones
✅ **Notificaciones** - El cliente sabe que lo atiende una persona real
✅ **Granular** - Pausar usuarios individuales o todo el bot
