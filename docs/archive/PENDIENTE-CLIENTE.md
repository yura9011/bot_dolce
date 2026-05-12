# Información Pendiente del Cliente

## ✅ Información Actualizada

- ✅ Nombre: Dolce Party - Santa Ana
- ✅ Dirección: Sta. Ana 2637, X5010EEK Córdoba
- ✅ Teléfono: 0351 855-9145
- ✅ Horario: Lunes a Sábado 9:00 a 20:00hs | Domingo Cerrado

---

## 🔴 URGENTE - Links de Seguimiento

### Correo Argentino
**Actual:** `[PENDIENTE: Link de tracking de Correo Argentino]`
**Necesito:** El link exacto que le dan a los clientes para rastrear paquetes

### Andreani
**Actual:** `[PENDIENTE: Link de tracking de Andreani]`
**Necesito:** El link exacto que le dan a los clientes para rastrear paquetes

### Mercado Libre
**Actual:** `[PENDIENTE: Link de seguimiento de Mercado Libre]`
**Necesito:** El link exacto que le dan a los clientes para ver sus compras

---

## 🟡 IMPORTANTE - Textos y Requisitos

### 1. Texto de Correo Argentino
**Actual:**
> "Si dice 'Disponible para retiro en la sucursal Dolce Party', significa que ya está acá"

**Preguntas:**
- [ ] ¿El texto exacto que aparece en Correo Argentino es "Disponible para retiro en la sucursal Dolce Party"?
- [ ] ¿O dice otra cosa? ¿Cuál es el texto exacto?

### 2. Requisitos para retirar - Correo Argentino
**Actual:**
- Venir con el titular y su DNI
- Si retira un tercero, necesita autorización del titular + fotocopia del DNI del titular

**Preguntas:**
- [ ] ¿Estos son los requisitos exactos?
- [ ] ¿Falta algo más? (¿Comprobante? ¿Número de seguimiento?)

### 3. Requisitos para retirar - Andreani
**Actual:**
- Venir con el DNI del titular de la compra

**Preguntas:**
- [ ] ¿Es correcto?
- [ ] ¿Falta algo más? (¿Comprobante? ¿Número de seguimiento?)

### 4. Requisitos para retirar - Mercado Libre
**Actual:**
- Solo necesitás venir con el código QR de tu compra

**Preguntas:**
- [ ] ¿Es así?
- [ ] ¿No piden DNI también?
- [ ] ¿Falta algo más?

### 5. Preparación de paquete para envío
**Actual:**
- Paquete bien envuelto y cerrado
- Carátula del envío impresa y pegada
- Envío ya pagado

**Preguntas:**
- [ ] ¿Estos son todos los requisitos?
- [ ] ¿Dónde se paga el envío? (¿En la sucursal? ¿Online?)
- [ ] ¿Hay límites de peso o tamaño?
- [ ] ¿Falta alguna otra indicación?

---

## 🟢 OPCIONAL - Tono y Mensajes

### 6. Saludo después de dar el nombre
**Actual:** "Encantado de conocerte, Juan! 😊"

**Pregunta:**
- [ ] ¿Está bien este tono?
- [ ] ¿Preferís algo más formal? Ej: "Gracias, Juan. ¿En qué puedo ayudarte?"
- [ ] ¿O más informal? Ej: "Dale Juan! ¿Qué necesitás?"

### 7. Respuesta al elegir "Realizar pedido"
**Actual:** "Perfecto! ¿Qué productos necesitás para tu pedido?"

**Pregunta:**
- [ ] ¿Está bien?
- [ ] ¿Preferís otro mensaje?

### 8. Respuesta al elegir "Catálogo de globos"
**Actual:** "¡Claro! ¿Qué tipo de globos estás buscando? (cumpleaños, temáticos, números, etc.)"

**Pregunta:**
- [ ] ¿Está bien?
- [ ] ¿Hay otros tipos de globos que deberían mencionarse?

---

## ❓ PENDIENTE - Flujo de "Realizar Envíos"

El cliente mencionó:
> "Y que cuando pongan Realizar envíos, le pongamos: '¿Tenés el paquete listo?, ¿no sabés cómo hacerlo?'"

**Preguntas:**
- [ ] ¿Dónde va esta opción?
  - [ ] Como opción 4 en el menú principal
  - [ ] Como opción 4 en el menú de paquetería
  - [ ] Otro lugar (¿cuál?)

- [ ] ¿Qué servicios de envío ofrecen ustedes?
  - [ ] Solo Correo Argentino
  - [ ] Correo Argentino + Andreani
  - [ ] Otros (¿cuáles?)

---

## 📝 Cómo Actualizar Cuando Tengas la Info

### Para actualizar links:
1. Abrir `flujos.js`
2. Buscar la sección `LINKS` (línea 11)
3. Reemplazar los placeholders:
```javascript
const LINKS = {
  correoArgentino: "https://link-real-aqui.com",
  andreani: "https://link-real-aqui.com",
  mercadoLibre: "https://link-real-aqui.com",
};
```

### Para actualizar textos:
1. Abrir `flujos.js`
2. Buscar la función correspondiente (ej: `getInfoCorreoArgentino`)
3. Editar el texto dentro de las comillas
4. Guardar y reiniciar el bot

---

## 📊 Prioridades

| Prioridad | Qué | Por qué |
|-----------|-----|---------|
| 🔴 Alta | Links de seguimiento | Sin esto, los clientes no pueden rastrear sus paquetes |
| 🟡 Media | Requisitos de retiro | Información incorrecta puede causar problemas |
| 🟡 Media | Preparación de paquete | Clientes necesitan saber cómo preparar envíos |
| 🟢 Baja | Tono de mensajes | Funciona igual, solo es cuestión de estilo |
| ❓ Pendiente | Flujo "Realizar envíos" | Necesita decisión de dónde ubicarlo |
