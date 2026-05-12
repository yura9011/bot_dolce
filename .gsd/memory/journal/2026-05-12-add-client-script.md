# Sesión: Script interactivo add-client.js

**Fecha**: 2026-05-12  
**Duración**: ~10 min  
**Agente**: opencode  
**Usuario**: forma

---

## 🎯 Objetivos

Crear un script interactivo que permita agregar un nuevo cliente al sistema multi-agente en < 5 minutos.

---

## ✅ Tareas Completadas

### 1. scripts/add-client.js
Script Node.js interactivo que:
- Lee `agents.json` y detecta puertos usados
- Calcula próximo puerto API y dashboard (sin conflictos)
- Pide nombre, dirección, teléfono, horario, usuario y contraseña
- Genera hash bcrypt de la contraseña
- Crea `data/{id}/` y `logs/{id}/` con `historial.json`, `pausas.json`, `.gitkeep`
- Agrega el agente a `agents.json` (disabled por defecto, con usuario "forma")
- Muestra resumen y pasos de activación

### 2. package.json
- Agregado script `"add-client": "node scripts/add-client.js"`
- Agregada dependencia `bcrypt ^5.1.0`

### 3. README.md
- Reemplazada sección manual "Agregar Nuevo Local" por `npm run add-client`

---

## 📂 Archivos Modificados/Creados

| Archivo | Acción |
|---|---|
| `scripts/add-client.js` | Creado (169 líneas) |
| `package.json` | Script + bcrypt dependency |
| `package-lock.json` | Actualizado |
| `README.md` | Sección simplificada |

---

## 🚀 Commit

```bash
git add scripts/add-client.js package.json package-lock.json README.md
git commit -m "feat(onboarding): Add interactive add-client script for new client onboarding"
git push origin main
```

⚠️ Sin deploy a VPS.

---

**Última actualización**: 2026-05-12
