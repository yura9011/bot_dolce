const { GoogleGenerativeAI } = require("@google/generative-ai");
const { log } = require("./logging");

// ─── CONFIGURACIÓN DE MODELOS ────────────────────────────────────────────────

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

// Función para llamar a OpenRouter como fallback
async function llamarOpenRouter(mensajes, texto, modelo = "inclusionai/ling-2.6-flash:free") {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT;
  
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key no configurada");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": modelo,
      "messages": [
        {
          "role": "system",
          "content": SYSTEM_PROMPT
        },
        ...mensajes.map(msg => ({
          "role": msg.role === "model" ? "assistant" : msg.role,
          "content": msg.parts[0].text
        })),
        {
          "role": "user", 
          "content": texto
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Función que reintenta la llamada a Gemini hasta MAX_RETRIES veces
async function llamarGeminiConReintentos(chat, texto) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT;
  
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  let lastError;
  
  for (let intento = 1; intento <= MAX_RETRIES; intento++) {
    try {
      log(`🔄 Intento ${intento}/${MAX_RETRIES} de llamada a Gemini`);
      const result = await chat.sendMessage(texto);
      const respuesta = result.response.text();
      return respuesta;
    } catch (error) {
      lastError = error;
      log(`⚠️ Error en intento ${intento}: ${error.message}`, "WARN");
      
      // Si es error de modelo no disponible, intentar con 1.5-flash
      if (error.message.includes("2.5-flash") || error.message.includes("model not found")) {
        log("🔄 Intentando con gemini-1.5-flash...", "WARN");
        await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa 1 segundo
        try {
          const fallbackModel = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: SYSTEM_PROMPT,
          });
          const fallbackChat = fallbackModel.startChat({
            history: chat._history || [],
          });
          const result = await fallbackChat.sendMessage(texto);
          const respuesta = result.response.text();
          log("✅ Fallback a gemini-1.5-flash exitoso");
          return respuesta;
        } catch (fallbackError) {
          log(`❌ Fallback gemini-1.5-flash también falló: ${fallbackError.message}`, "ERROR");
        }
      }
      
      if (intento < MAX_RETRIES) {
        log(`⏳ Esperando ${RETRY_DELAY_MS}ms antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }
  
  // Si Gemini falló completamente, intentar OpenRouter
  if (OPENROUTER_API_KEY) {
    log("⏳ Esperando 2 segundos antes de intentar OpenRouter...");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Pausa 2 segundos
    
    // Intentar primero con Ling-2.6-flash
    try {
      log("🔄 Intentando con OpenRouter (inclusionai/ling-2.6-flash:free)...", "WARN");
      const respuesta = await llamarOpenRouter(chat._history || [], texto, "inclusionai/ling-2.6-flash:free");
      log("✅ Fallback a OpenRouter Ling-2.6-flash exitoso");
      return respuesta;
    } catch (lingError) {
      log(`❌ OpenRouter Ling-2.6-flash falló: ${lingError.message}`, "ERROR");
      
      log("⏳ Esperando 2 segundos antes del último intento...");
      await new Promise(resolve => setTimeout(resolve, 2000)); // Pausa 2 segundos
      
      // Intentar con Gemma como último recurso
      try {
        log("🔄 Intentando con OpenRouter (google/gemma-4-26b-a4b-it:free)...", "WARN");
        const respuesta = await llamarOpenRouter(chat._history || [], texto, "google/gemma-4-26b-a4b-it:free");
        log("✅ Fallback a OpenRouter Gemma exitoso");
        return respuesta;
      } catch (gemmaError) {
        log(`❌ OpenRouter Gemma también falló: ${gemmaError.message}`, "ERROR");
      }
    }
  }
  
  throw lastError;
}

// Inicializar modelo Gemini
function inicializarModelo() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT;
  
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  // Intentar usar gemini-2.5-flash, fallback a gemini-1.5-flash
  let model;
  try {
    model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });
    log("🤖 Usando modelo: gemini-2.5-flash");
  } catch (error) {
    log("⚠️ gemini-2.5-flash no disponible, usando gemini-1.5-flash", "WARN");
    model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
    });
  }
  
  return model;
}

module.exports = {
  llamarGeminiConReintentos,
  inicializarModelo
};