# Placeholders y Suposiciones - Lista Completa

## ✅ RESUELTO - Links de Seguimiento

### 1. Links de Seguimiento (flujos.js líneas 11-15)

```javascript
const LINKS = {
  correoArgentino: "https://www.correoargentino.com.ar/seguimiento-de-envios",
  andreani: null, // El cliente tiene el código en su app
  mercadoLibre: null, // El cliente tiene el código en su app
};
```

**Estado:** ✅ RESUELTO
- **Correo Argentino:** Link oficial agregado
- **Andreani:** El cliente ya tiene el seguimiento en su app
- **Mercado Libre:** El cliente ya tiene el seguimiento en su app

---

## 🟡 SUPOSICIONES IMPORTANTES (Pueden estar incorrectas)

### 2. Texto de estado de Correo Argentino (flujos.js línea 62)

**Supuse:**
> "Si dice 'Disponible para retiro en la sucursal Dolce Party', significa que ya está acá"

**Preguntas:**
- ¿El sistema de Correo Argentino dice exactamente "Disponible para retiro en la sucursal Dolce Party"?
- ¿O dice otra cosa? Ej: "Disponible para retiro", "En sucursal", etc.
- ¿Cuál es el texto EXACTO que aparece?

**Impacto:** Si el texto es diferente, los clientes pueden confundirse

---

### 3. Requisitos para retirar - Correo Argentino (flujos.js líneas 64-66)

**Supuse:**
- Venir con el titular y su DNI
- Si retira un tercero: autorización del titular + fotocopia del DNI del titular

**Preguntas:**
- ¿Estos son TODOS los requisitos?
- ¿Necesitan también el número de seguimiento?
- ¿Necesitan algún comprobante impreso?
- ¿La autorización debe ser escrita? ¿Hay un formato específico?

**Impacto:** Requisitos incorrectos = clientes van al local y no pueden retirar

---

### 4. Requisitos para retirar - Andreani (flujos.js línea 78)

**Supuse:**
- Solo necesitan el DNI del titular de la compra

**Preguntas:**
- ¿Es correcto?
- ¿No necesitan número de seguimiento?
- ¿No necesitan comprobante?
- ¿Puede retirar un tercero? ¿Con qué requisitos?

**Impacto:** Requisitos incorrectos = clientes van al local y no pueden retirar

---

### 5. Requisitos para retirar - Mercado Libre (flujos.js línea 90)

**Supuse:**
- Solo necesitan el código QR de la compra

**Preguntas:**
- ¿Es así de simple?
- ¿No piden DNI también?
- ¿El QR viene en el mail de Mercado Libre?
- ¿Puede retirar cualquier persona con el QR o debe ser el comprador?

**Impacto:** Requisitos incorrectos = clientes van al local y no pueden retirar

---

### 6. Preparación de paquete para envío (flujos.js líneas 106-108)

**Supuse:**
- Paquete bien envuelto y cerrado
- Carátula del envío impresa y pegada
- Envío ya pagado

**Preguntas:**
- ¿Estos son TODOS los requisitos?
- ¿Dónde se paga el envío? (¿En el local? ¿Online? ¿En Correo/Andreani?)
- ¿Hay límites de peso o tamaño?
- ¿Qué debe tener la carátula? (¿Dirección? ¿Código de barras?)
- ¿Dónde consiguen la carátula? (¿La imprimen ellos? ¿Se la dan en el local?)

**Impacto:** Información incompleta = clientes traen paquetes mal preparados

---

### 7. Tono del saludo después de dar el nombre (bot.js línea 246)

**Supuse:**
```javascript
await message.reply(`Encantado de conocerte, ${texto}! 😊`);
```

**Preguntas:**
- ¿Este tono está bien?
- ¿Preferís algo más formal? Ej: "Gracias, Juan. ¿En qué puedo ayudarte?"
- ¿O más informal/argentino? Ej: "Dale Juan! ¿Qué necesitás?"

**Impacto:** Bajo - Es solo cuestión de estilo

---

### 8. Mensaje al elegir "Realizar pedido" (bot.js línea 263)

**Supuse:**
```javascript
await message.reply("Perfecto! ¿Qué productos necesitás para tu pedido?");
```

**Preguntas:**
- ¿Está bien este mensaje?
- ¿Preferís algo diferente?

**Impacto:** Bajo - Es solo cuestión de estilo

---

### 9. Mensaje al elegir "Catálogo de globos" (bot.js línea 270)

**Supuse:**
```javascript
await message.reply("¡Claro! ¿Qué tipo de globos estás buscando? (cumpleaños, temáticos, números, etc.)");
```

**Preguntas:**
- ¿Está bien?
- ¿Hay otros tipos de globos que deberían mencionarse?
- ¿Los ejemplos son correctos? (cumpleaños, temáticos, números)

**Impacto:** Bajo - Es solo cuestión de estilo

---

### 10. Mensaje cuando no entiende la opción (flujos.js línea 130)

**Supuse:**
```javascript
return `Disculpá, no entendí tu respuesta. Por favor, elegí una de las opciones del menú usando el número correspondiente.`;
```

**Preguntas:**
- ¿Este tono está bien?
- ¿Preferís algo más directo? Ej: "Opción inválida. Elegí 1, 2 o 3."

**Impacto:** Bajo - Es solo cuestión de estilo

---

### 11. Mensaje después de responder con IA (bot.js línea 363)

**Supuse:**
```javascript
await message.reply("\n¿Necesitás algo más? Respondé *0* para volver al menú principal.");
```

**Preguntas:**
- ¿Está bien recordarles que pueden volver al menú?
- ¿O preferís que no se lo recuerdes cada vez?

**Impacto:** Bajo - Es solo cuestión de experiencia de usuario

---

### 12. Mensaje cuando detecta insulto pero no bloquea (bot.js línea 318)

**Supuse:**
- Registrar en log pero NO bloquear
- Responder profesionalmente igual

**Preguntas:**
- ¿Está bien esta estrategia?
- ¿O preferís que bloquee también los insultos?
- ¿O que responda con un mensaje específico? Ej: "Por favor, mantengamos un trato respetuoso"

**Impacto:** Medio - Afecta cómo se maneja el lenguaje ofensivo

---

## ❓ FUNCIONALIDAD NO IMPLEMENTADA

### 13. Flujo de "Realizar Envíos"

**El cliente mencionó:**
> "Y que cuando pongan Realizar envíos, le pongamos: '¿Tenés el paquete listo?, ¿no sabés cómo hacerlo?'"

**Estado:** ❌ NO IMPLEMENTADO

**Preguntas:**
- ¿Dónde va esta opción?
  - [ ] Como opción 4 en el menú principal
  - [ ] Como opción 4 en el menú de paquetería
  - [ ] En otro lugar (¿cuál?)

- ¿Qué servicios de envío ofrecen ustedes?
  - [ ] Solo Correo Argentino
  - [ ] Correo Argentino + Andreani
  - [ ] Otros (¿cuáles?)

- ¿Cuánto cuesta enviar?
  - [ ] Depende del peso/tamaño
  - [ ] Precio fijo
  - [ ] Se paga en Correo/Andreani directamente

**Impacto:** Alto - Es una funcionalidad que el cliente pidió explícitamente

---

## 📊 Resumen por Prioridad

### 🔴 CRÍTICO (Bloquea funcionalidad)
1. ~~Links de seguimiento (Correo, Andreani, Mercado Libre)~~ ✅ RESUELTO
2. Flujo de "Realizar Envíos" (ubicación y detalles)

### 🟡 IMPORTANTE (Puede causar problemas)
3. Requisitos exactos para retirar de Correo Argentino
4. Requisitos exactos para retirar de Andreani
5. Requisitos exactos para retirar de Mercado Libre
6. Requisitos completos para preparar paquete
7. Texto exacto de estado de Correo Argentino

### 🟢 MENOR (Solo estilo/tono)
8. Tono del saludo después de dar nombre
9. Mensaje al elegir "Realizar pedido"
10. Mensaje al elegir "Catálogo de globos"
11. Mensaje cuando no entiende opción
12. Mensaje después de responder con IA
13. Estrategia con insultos (bloquear o no)

---

## 📝 Cómo Actualizar

### Para actualizar links (flujos.js):
```javascript
const LINKS = {
  correoArgentino: "https://link-real-aqui.com",
  andreani: "https://link-real-aqui.com",
  mercadoLibre: "https://link-real-aqui.com",
};
```

### Para actualizar textos (flujos.js):
Buscar la función correspondiente y editar el texto dentro de las comillas.

### Para actualizar tono de mensajes (bot.js):
Buscar el mensaje específico y editarlo directamente.

---

## 🎯 Próximos Pasos Recomendados

1. **URGENTE:** Conseguir los 3 links de seguimiento
2. **URGENTE:** Decidir dónde va el flujo "Realizar Envíos"
3. **IMPORTANTE:** Confirmar requisitos de retiro para cada transportista
4. **IMPORTANTE:** Confirmar requisitos para preparar paquetes
5. **OPCIONAL:** Ajustar tono de mensajes si es necesario
