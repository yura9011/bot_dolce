# Logging y Moderación - Bot de WhatsApp

## Qué hace el sistema

### 1. Logging a archivo
- Todos los logs van a `logs/bot.log`
- Formato: `[DD/MM/YYYY HH:mm:ss] [NIVEL] mensaje`
- Se guarda en consola Y en archivo

### 2. Moderación de contenido

**Tópicos prohibidos (BLOQUEA el mensaje):**
- Política, religión, deportes, celebridades, etc.
- Lista de ~40 palabras clave
- Respuesta automática: "Disculpá, solo puedo ayudarte con temas de la tienda..."

**Lenguaje ofensivo (REGISTRA pero NO bloquea):**
- Insultos y groserías argentinas
- Lista de ~20 palabras comunes
- Bot responde profesionalmente
- Queda registrado en log con nivel WARN

## Cómo usar

### Ver logs en tiempo real
```bash
tail -f logs/bot.log
```

### Buscar insultos detectados
```bash
grep "Lenguaje ofensivo" logs/bot.log
```

### Buscar temas prohibidos bloqueados
```bash
grep "Tema prohibido" logs/bot.log
```

### Ver solo errores
```bash
grep ERROR logs/bot.log
```

## Agregar palabras a las listas

Editá `bot.js` y modificá los arrays:

```javascript
// Para bloquear nuevos tópicos
const TOPICOS_PROHIBIDOS = [
  'palabra1', 'palabra2', // etc.
];

// Para detectar nuevos insultos
const LENGUAJE_OFENSIVO = [
  'insulto1', 'insulto2', // etc.
];
```

## Ejemplo de logs

```
[27/02/2026 09:42:15] [INFO] 📩 [5491112345678@c.us]: Tienen globos?
[27/02/2026 09:42:15] [INFO] 🔍 Buscando productos: "Tienen globos?"
[27/02/2026 09:42:15] [INFO] 📦 Productos encontrados: 3
[27/02/2026 09:42:16] [INFO] 🤖 Bot: Sí, tenemos varios tipos de globos...

[27/02/2026 09:45:20] [INFO] 📩 [5491112345678@c.us]: Qué opinas de Milei?
[27/02/2026 09:45:20] [WARN] 🚫 Tema prohibido bloqueado: "milei" de 5491112345678@c.us

[27/02/2026 09:50:30] [INFO] 📩 [5491112345678@c.us]: No tenés nada boludo
[27/02/2026 09:50:30] [WARN] ⚠️ Lenguaje ofensivo detectado: "boludo" de 5491112345678@c.us
[27/02/2026 09:50:31] [INFO] 🤖 Bot: Lamento no tener lo que buscás...
```

## Mantenimiento

### Limpiar logs antiguos
```bash
# Eliminar logs de más de 30 días
find logs/ -name "*.log" -mtime +30 -delete
```

### Rotar log actual
```bash
# Renombrar log actual con fecha
mv logs/bot.log logs/bot-$(date +%Y-%m-%d).log
# El bot creará uno nuevo automáticamente
```

## Qué NO hace (intencionalmente)

- ❌ No guarda métricas complejas
- ❌ No anonimiza userIds
- ❌ No separa logs por tipo
- ❌ No genera reportes automáticos

**Razón:** Simplicidad. Si necesitás eso después, se agrega.

## Próximos pasos (si los necesitás)

1. Agregar contador simple de mensajes
2. Rotar logs automáticamente
3. Alertas por email/Slack cuando hay muchos errores
