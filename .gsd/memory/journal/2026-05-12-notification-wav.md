# Sesión: Fix notificaciones sonoras — Web Audio API → WAV real

**Fecha**: 2026-05-12  
**Duración**: ~5 min  
**Agente**: opencode  
**Usuario**: forma

---

## 🎯 Objetivos

Reemplazar Web Audio API (oscilador generado) por un archivo de audio real, ya que los browsers modernos bloquean AudioContext sin gesto de usuario.

---

## ✅ Tareas Completadas

### 1. Script generador de sonido
`scripts/generate-notification-sound.js` — genera un WAV con sine wave (800Hz, 0.25s, fade out).

### 2. Archivo de audio
`public/assets/sounds/notification.wav` — 21.5KB, creado ejecutando el script.

### 3. index.html
Referencia cambiada de `notification.mp3` a `notification.wav`.

### 4. notifications.js
Reescrito: usa `<audio>` element con `play()` + `pause()` para unlock en primer click, y `play()` en cada notificación. Eliminado todo el código de Web Audio API.

---

## 📂 Archivos Modificados/Creados

| Archivo | Acción |
|---|---|
| `scripts/generate-notification-sound.js` | Creado |
| `public/assets/sounds/notification.wav` | Creado |
| `public/index.html` | Modificado (mp3 → wav) |
| `public/js/notifications.js` | Reescrito |

---

## 🚀 Commit

```bash
git add scripts/generate-notification-sound.js dashboard-humano-v2/public/assets/sounds/notification.wav dashboard-humano-v2/public/index.html dashboard-humano-v2/public/js/notifications.js
git commit -m "fix(dashboard): Replace Web Audio API with real WAV file for reliable notification sound"
git push origin main
```

⚠️ Sin deploy a VPS.

---

**Última actualización**: 2026-05-12
