# 🤖 WhatsApp Bot — Cotillón MVP

Bot mínimo funcional con IA para WhatsApp. Usa `whatsapp-web.js` y Google Gemini.

---

## ✅ Requisitos

- **Node.js** instalado (versión 18 o superior)  
  Descargalo de: https://nodejs.org  
  Para verificar que lo tenés: `node -v`

- **API Key de Google Gemini** (es gratis para empezar)  
  Conseguila en: https://aistudio.google.com/app/apikey

---

## 🚀 Setup paso a paso

### 1. Abrí la carpeta del proyecto en tu terminal

```bash
cd whatsapp-bot
```

### 2. Instalá las dependencias

```bash
npm install
```

> La primera vez tarda un par de minutos porque descarga Chromium (que usa internamente para conectarse a WhatsApp Web).

### 3. Pegá tu API Key en el archivo `bot.js`

Abrí `bot.js` y reemplazá esta línea:

```js
const GEMINI_API_KEY = "TU_API_KEY_ACÁ";
```

Por tu clave real, por ejemplo:

```js
const GEMINI_API_KEY = "AIzaSyABC123...";
```

### 4. Corré el bot

```bash
npm start
```

### 5. Escaneá el QR

Va a aparecer un QR en la terminal. Abrí WhatsApp en tu celu → Dispositivos vinculados → Vincular dispositivo → escaneá el QR.

✅ Una vez conectado, el bot empieza a responder automáticamente.

---

## 💬 ¿Cómo probarlo?

Pedile a alguien que te mande un mensaje por WhatsApp (o usá un número secundario). El bot va a responder solo.

Si el cliente escribe **HUMANO**, el bot lo avisa en la consola y manda un mensaje diciéndole que un agente lo va a atender.

---

## 📁 Estructura del proyecto

```
whatsapp-bot/
├── bot.js          ← el bot (toda la lógica acá)
├── package.json    ← dependencias
└── .wwebjs_auth/   ← se crea solo, guarda la sesión de WhatsApp
```

---

## ⚠️ Cosas a tener en cuenta

- Mientras el bot está corriendo, tu WhatsApp queda "ocupado" en la notebook (igual que WhatsApp Web). En el celu podés usarlo normalmente.
- Si cerrás la terminal, el bot se apaga.
- La sesión queda guardada en `.wwebjs_auth/`, así que la próxima vez que corras `npm start` no necesitás escanear el QR de nuevo.

---

## 🔜 Próximos pasos (cuando esto funcione)

1. **Agregar el catálogo** — meter los productos en un archivo JSON o conectar a la base de datos existente, y que el bot consulte antes de responder (RAG simple).
2. **Handoff real** — conectar Chatwoot para que el equipo reciba las conversaciones cuando el cliente pide un humano.
3. **Hostear** — subir a un VPS para que corra 24/7 sin necesidad de tener la notebook prendida.
