# Sistema de Flujos y Menús - Bot de WhatsApp

## Arquitectura del Sistema

El bot ahora funciona con un **sistema de flujos guiados** en lugar de conversación libre.

### Flujo Principal

```
Usuario escribe por primera vez
    ↓
Mensaje de bienvenida
• Nombre de sucursal
• Horario de atención
• Aviso: no audios ni llamadas
    ↓
Pedir nombre del usuario
    ↓
Menú Principal
├─ 1. Realizar pedido → IA conversacional
├─ 2. Catálogo de globos → IA conversacional
└─ 3. Consulta paquetería
       ├─ 1. Correo Argentino → Info + link
       ├─ 2. Andreani → Info + link
       └─ 3. Mercado Libre → Info + link
```

## Estados del Flujo

| Estado | Descripción |
|--------|-------------|
| `INICIAL` | Primera vez que escribe |
| `ESPERANDO_NOMBRE` | Esperando que indique su nombre |
| `MENU_PRINCIPAL` | En el menú principal (3 opciones) |
| `MENU_PAQUETERIA` | En el submenú de paquetería |
| `PEDIDO` | Haciendo un pedido (IA conversacional) |
| `CATALOGO` | Consultando catálogo (IA conversacional) |
| `INFO_CORREO` | Viendo info de Correo Argentino |
| `INFO_ANDREANI` | Viendo info de Andreani |
| `INFO_MERCADOLIBRE` | Viendo info de Mercado Libre |

## Mensajes del Sistema

### Bienvenida (primera vez)
```
¡Hola! 👋

Bienvenido/a a *Dolce Party - Sucursal Centro*

📍 *Horario de atención:*
Lunes a Viernes: 9:00 a 18:00hs | Sábados: 9:00 a 13:00hs

⚠️ *Importante:*
• No recibimos llamadas ni audios en este momento
• Por favor, escribí tus consultas por mensaje de texto

¿En qué puedo ayudarte hoy?
```

### Menú Principal
```
Por favor, elegí una opción:

1️⃣ Realizar pedido
2️⃣ Catálogo de globos
3️⃣ Consulta sobre paquetería

Respondé con el número de la opción que necesitás.
```

### Menú Paquetería
```
*Consulta sobre paquetería*

Elegí el servicio de envío:

1️⃣ Correo Argentino
2️⃣ Andreani
3️⃣ Mercado Libre

0️⃣ Volver al menú principal
```

### Info Correo Argentino
```
*📦 Correo Argentino*

Podés consultar el estado de tu pedido acá:
[link]

⚠️ *Importante:* Si dice "Disponible para retiro en la sucursal Dolce Party", significa que ya está acá.

*Para retirar:*
• Venir con el *titular* y su *DNI*
• Si retira un tercero, necesita autorización del titular + fotocopia del DNI del titular
```

### Info Andreani
```
*📦 Andreani*

Podés consultar el estado de tu pedido acá:
[link]

*Para retirar:*
• Venir con el *DNI del titular* de la compra
```

### Info Mercado Libre
```
*📦 Mercado Libre*

Podés consultar tus compras acá:
[link]

*Para retirar:*
• Solo necesitás venir con el *código QR* de tu compra
```

## Navegación

- **Opción 0**: Vuelve al menú principal desde cualquier submenú
- **Palabra "HUMANO"**: Activa handoff a agente humano
- **Audios/Llamadas**: Rechazados automáticamente con mensaje

## Configuración

### Editar información de la sucursal
Archivo: `flujos.js`

```javascript
const INFO_SUCURSAL = {
  nombre: "Dolce Party - Sucursal Centro",
  horario: "Lunes a Viernes: 9:00 a 18:00hs | Sábados: 9:00 a 13:00hs",
  direccion: "Av. Ejemplo 123, Córdoba Capital",
};
```

### Editar links de seguimiento
Archivo: `flujos.js`

```javascript
const LINKS = {
  correoArgentino: "https://www.correoargentino.com.ar/formularios/e-tracking",
  andreani: "https://www.andreani.com/#!/personas/tracking",
  mercadoLibre: "https://www.mercadolibre.com.ar/ventas",
};
```

## Comportamiento Especial

### Audios y Llamadas
Si el usuario envía audio o intenta llamar:
```
⚠️ No recibimos audios en este momento. Por favor, escribí tu consulta por mensaje de texto.
```

### Pedidos y Catálogo
Cuando el usuario elige opción 1 o 2, el bot cambia a **modo conversacional con IA**:
- Usa el catálogo de productos (RAG)
- Responde con Gemini
- Mantiene historial de conversación
- Ofrece volver al menú con "0"

### Paquetería
Cuando el usuario elige opción 3, el bot muestra **información estática**:
- Links de seguimiento
- Requisitos para retirar
- Sin IA, respuestas predefinidas

## Testing

### Test 1: Primera interacción
```
Usuario: "Hola"
Bot: [Mensaje de bienvenida]
Bot: "¿Podrías indicarme tu nombre?"
Usuario: "Juan"
Bot: "Encantado de conocerte, Juan!"
Bot: [Menú principal]
```

### Test 2: Consulta paquetería
```
Usuario: "3"
Bot: [Menú paquetería]
Usuario: "1"
Bot: [Info Correo Argentino con link]
Usuario: "0"
Bot: [Menú principal]
```

### Test 3: Hacer pedido
```
Usuario: "1"
Bot: "¿Qué productos necesitás?"
Usuario: "Globos de cumpleaños"
Bot: [Respuesta con IA + productos del catálogo]
```

### Test 4: Audio rechazado
```
Usuario: [Envía audio]
Bot: "⚠️ No recibimos audios en este momento..."
```

## Logs

El sistema registra:
- `👋 Nuevo usuario` - Primera interacción
- `✅ Usuario registrado como: [nombre]` - Nombre guardado
- `🛒 Usuario inició pedido` - Opción 1
- `🎈 Usuario consultó catálogo` - Opción 2
- `🚨 HANDOFF solicitado` - Pidió humano

## Próximas Mejoras

1. Agregar opción de "Realizar envíos" en menú paquetería
2. Botones interactivos de WhatsApp (en lugar de números)
3. Imágenes del catálogo
4. Confirmación de pedidos
