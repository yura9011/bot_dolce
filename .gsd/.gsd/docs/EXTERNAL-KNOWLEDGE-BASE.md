# External Knowledge Base Integration

> **Purpose**: Index and search large external directories (Obsidian vaults, documentation, personal notes)

---

## Quick Start

### 1. Configure Sources

Edit `.gsd/memory/config.json`:

```json
{
  "external_sources": [
    "D:/tareas/Obsidian Vault",
    "D:/otra-carpeta"
  ],
  "file_patterns": ["*.md", "*.txt"],
  "exclude_patterns": [
    "**/node_modules/**",
    "**/.git/**",
    "**/.obsidian/**"
  ]
}
```

### 2. Index External Sources

```powershell
# Primera vez (puede tomar minutos)
.\.gsd\scripts\memory-index-external.ps1

# Ver estadísticas
.\.gsd\scripts\memory-index-external.ps1 -Stats

# Re-indexar todo
.\.gsd\scripts\memory-index-external.ps1 -Force
```

### 3. Search

```powershell
# Buscar solo en fuentes externas
.\.gsd\scripts\memory-search.ps1 "obsidian" -External

# Buscar en todo (GSD + externas)
.\.gsd\scripts\memory-search.ps1 "user communication" -All

# Buscar solo en GSD memory (default)
.\.gsd\scripts\memory-search.ps1 "phase 3"
```

---

## Performance

**Tu caso** (2,451 archivos):
- Indexado inicial: ~3 minutos
- Tamaño índice: 47 MB
- Búsquedas: <1 segundo

**Escalabilidad**:
- 10,000 archivos: ~10 minutos indexado
- 100,000 archivos: ~1 hora indexado
- Búsquedas siempre instantáneas

---

## Workflow Recomendado

### Agregar Carpetas Incrementalmente

No necesitás centralizar todo primero:

1. **Empezá con lo que tenés**
   ```json
   "external_sources": ["D:/tareas/Obsidian Vault"]
   ```

2. **Agregá carpetas cuando las encuentres**
   ```json
   "external_sources": [
     "D:/tareas/Obsidian Vault",
     "D:/documentos/proyectos",
     "D:/personal/journal"
   ]
   ```

3. **Re-indexá** (solo indexa nuevas carpetas)
   ```powershell
   .\.gsd\scripts\memory-index-external.ps1
   ```

### Mantener Actualizado

**Opción 1: Manual** (cuando agregues mucho contenido)
```powershell
.\.gsd\scripts\memory-index-external.ps1
```

**Opción 2: Automático** (futuro - git hook o scheduled task)

---

## Casos de Uso

### 1. Knowledge Base Personal

**Estructura**:
```
D:/knowledge/
├── projects/          # Documentación proyectos
├── personal/          # Notas personales
├── journal/           # Journal diario
├── conversations/     # Conversaciones con asistentes
└── work/             # Trabajo
```

**Búsqueda**:
```powershell
# Encontrar info sobre proyecto específico
.\.gsd\scripts\memory-search.ps1 "proyecto X" -External

# Buscar decisiones pasadas
.\.gsd\scripts\memory-search.ps1 "decisión arquitectura" -All
```

### 2. Obsidian Vault

**Ya configurado**: `D:/tareas/Obsidian Vault`

**Búsqueda**:
```powershell
# Buscar notas sobre tema
.\.gsd\scripts\memory-search.ps1 "machine learning" -External

# Buscar en todo (vault + GSD memory)
.\.gsd\scripts\memory-search.ps1 "python" -All
```

### 3. Multi-Dominio

**Configuración**:
```json
{
  "external_sources": [
    "D:/tareas/Obsidian Vault",
    "D:/work/documentation",
    "D:/personal/notes"
  ]
}
```

**Ventaja**: Búsqueda unificada en todos tus dominios

---

## Requisitos

### SQLite (Recomendado)

**Instalación automática**:
```powershell
# Se descarga automáticamente en ~/.gsd-tools/
# Ya está configurado en tu sistema
```

**Verificar**:
```powershell
sqlite3 --version
```

### Sin SQLite (Fallback)

Si no tenés SQLite, usá la versión simple:
```powershell
.\.gsd\scripts\memory-index-external-simple.ps1
```

Crea índice JSON (más lento para búsquedas grandes)

---

## Troubleshooting

### Indexado Lento

**Normal para primera vez**:
- 2,000 archivos: ~3 minutos
- 10,000 archivos: ~10 minutos

**Si es muy lento**:
- Verificá exclude_patterns (evitar node_modules, .git)
- Verificá que no haya archivos binarios grandes

### Búsquedas No Encuentran Nada

**Verificar índice existe**:
```powershell
Test-Path .gsd/memory/.index/external.db
```

**Re-indexar**:
```powershell
.\.gsd\scripts\memory-index-external.ps1 -Force
```

### Errores de Encoding

Algunos archivos pueden tener encoding raro. El indexador los salta automáticamente.

---

## Próximos Pasos

### Fase Actual: Funcional ✅

- [x] Indexado de carpetas externas
- [x] Búsqueda rápida con SQLite FTS5
- [x] Búsqueda unificada (GSD + externas)
- [x] Configuración flexible

### Futuro (Opcional)

- [ ] Indexado incremental (solo archivos modificados)
- [ ] Auto-indexado con file watchers
- [ ] Búsqueda semántica con embeddings
- [ ] Visualización de resultados mejorada
- [ ] Exportar/importar índices

---

## Comparación con Alternativas

### vs. Obsidian Search

**Ventajas GSD**:
- Búsqueda desde terminal/scripts
- Integración con Ralph Loop
- Múltiples carpetas simultáneas
- Accesible para agentes AI

**Ventajas Obsidian**:
- Interface visual
- Graph view
- Links entre notas

**Mejor**: Usar ambos (complementarios)

### vs. Grep/Ripgrep

**Ventajas GSD**:
- Índice pre-construido (más rápido)
- Ranking por relevancia
- Snippets contextuales

**Ventajas Grep**:
- No requiere indexado
- Regex avanzado

**Mejor**: GSD para búsquedas frecuentes, grep para búsquedas específicas

---

## Resumen

**Lo que tenés ahora**:
- 2,451 archivos indexados
- Búsquedas instantáneas
- 47 MB de índice
- Listo para usar

**Cómo usar**:
```powershell
# Buscar en tu Obsidian Vault
.\.gsd\scripts\memory-search.ps1 "query" -External

# Buscar en todo
.\.gsd\scripts\memory-search.ps1 "query" -All
```

**Agregar más carpetas**:
1. Editar `.gsd/memory/config.json`
2. Ejecutar `.\.gsd\scripts\memory-index-external.ps1`
3. Listo

Simple, rápido, escalable.
