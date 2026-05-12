# Sesión: Agregar agente "asturias" al sistema multi-tenant

**Fecha**: 2026-05-12  
**Duración**: ~5 min  
**Agente**: opencode  
**Usuario**: forma

---

## 🎯 Objetivos

1. Agregar agente "asturias" a agents.json
2. Crear directorios de datos y logs
3. Crear scripts de inicio para VPS
4. Parametrizar CONFIG_AGENT_ID en server.js

---

## ✅ Tareas Completadas

### 1. config/agents.json
Reemplazado `local-2` (disabled) por `asturias` (enabled):
- API port: 3012
- Dashboard port: 3002
- Sesión WhatsApp: `asturias-session`
- Catálogo: reusa `catalogo-santa-ana.js`
- Dashboard users: admin y forma (mismos hashes)

### 2. Directorios de datos
- `data/asturias/historial.json` — `{}`
- `data/asturias/pausas.json` — `{}`
- `data/asturias/.gitkeep`
- `logs/asturias/.gitkeep`

### 3. Scripts de inicio
- `scripts/start-dashboard-asturias.sh` — Producción (puerto 3002)
- `scripts/start-dashboard-asturias-testing.sh` — Testing (puerto 4003)

### 4. server.js
`CONFIG_AGENT_ID` cambiado de hardcoded `'santa-ana'` a `process.env.CONFIG_AGENT_ID || AGENT_ID`

---

## 📂 Archivos Modificados/Creados

| Archivo | Acción |
|---|---|
| `config/agents.json` | Modificado (local-2 → asturias) |
| `dashboard-humano-v2/server.js` | Modificado (CONFIG_AGENT_ID dinámico) |
| `data/asturias/historial.json` | Creado |
| `data/asturias/pausas.json` | Creado |
| `data/asturias/.gitkeep` | Creado |
| `logs/asturias/.gitkeep` | Creado |
| `scripts/start-dashboard-asturias.sh` | Creado |
| `scripts/start-dashboard-asturias-testing.sh` | Creado |

---

## 🚀 Commit

```bash
git add -f data/asturias/ logs/asturias/ config/agents.json scripts/start-dashboard-asturias.sh scripts/start-dashboard-asturias-testing.sh dashboard-humano-v2/server.js
git commit -m "feat(multi-tenant): Add asturias agent config and dashboard startup scripts"
git push origin main
```

---

**Última actualización**: 2026-05-12
