# Using GSD in Obsidian Vault

> **Purpose**: Guide for using GSD memory system within your Obsidian Vault

---

## Overview

Tu Obsidian Vault ahora tiene GSD instalado. Esto te permite:

1. **Buscar en todo el Vault** desde terminal o agentes
2. **Memoria de agentes** para conversaciones generales
3. **Journal personal** separado de notas del Vault
4. **Acceso para agentes AI** a todo tu conocimiento

---

## Setup Inicial

### 1. Indexar el Vault

```powershell
cd "D:\tareas\Obsidian Vault"
.\.gsd\scripts\memory-index-external.ps1
```

Esto crea un índice de búsqueda de todos tus archivos .md y .txt

**Tiempo**: ~3 minutos para 2,451 archivos

### 2. Verificar

```powershell
# Ver estadísticas
.\.gsd\scripts\memory-index-external.ps1 -Stats

# Probar búsqueda
.\.gsd\scripts\memory-search.ps1 "obsidian" -External
```

---

## Uso Diario

### Abrir Kiro en el Vault

```powershell
cd "D:\tareas\Obsidian Vault"
# Abrir Kiro aquí
```

**El agente ahora tiene acceso a**:
- Todo el contenido del Vault (vía búsqueda)
- Memoria de conversaciones previas
- Capacidad de crear journal entries

### Buscar Información

**Desde terminal**:
```powershell
# Buscar en Vault
.\.gsd\scripts\memory-search.ps1 "tema" -External

# Buscar en memoria de agentes
.\.gsd\scripts\memory-search.ps1 "tema"

# Buscar en todo
.\.gsd\scripts\memory-search.ps1 "tema" -All
```

**Desde Kiro** (el agente puede ejecutar estos comandos):
- Agente busca automáticamente cuando necesita info
- Puede leer archivos específicos del Vault
- Puede crear nuevas notas

### Journal de Agentes

**Ubicación**: `.gsd/memory/journal/`

**Diferencia con notas del Vault**:
- Notas del Vault: Tu contenido personal
- Journal de agentes: Reflexiones de agentes sobre conversaciones

**Crear entrada**:
```powershell
.\.gsd\scripts\memory-add.ps1 journal -Template
```

---

## Workflows

### Workflow 1: Conversación General

1. Abrís Kiro en el Vault
2. Conversás sobre cualquier tema
3. Agente busca info relevante en Vault automáticamente
4. Al final, agente puede documentar insights

### Workflow 2: Organizar Vault

1. Abrís Kiro en el Vault
2. Pedís al agente revisar estructura
3. Agente busca archivos duplicados/mal ubicados
4. Sugiere reorganización

### Workflow 3: Búsqueda Avanzada

1. Necesitás encontrar info sobre tema X
2. Agente busca en todo el Vault
3. Agente resume hallazgos
4. Opcionalmente crea nota resumen

---

## Estructura de Archivos

```
Obsidian Vault/
├── .gsd/                      # GSD framework
│   ├── memory/
│   │   ├── journal/           # Reflexiones de agentes
│   │   ├── decisions/         # Decisiones documentadas
│   │   ├── patterns/          # Patrones observados
│   │   └── .index/
│   │       └── vault.db       # Índice de búsqueda
│   ├── scripts/               # Scripts de memoria
│   ├── state/
│   │   └── IMPLEMENTATION_PLAN.md
│   └── config/
│       └── AGENTS.md
├── Projects/                  # Tus proyectos (sin cambios)
├── Areas/                     # Tus áreas (sin cambios)
├── Resources/                 # Tus recursos (sin cambios)
└── Assets/                    # Tus assets (sin cambios)
```

**Importante**: GSD vive en `.gsd/` y no interfiere con tu estructura existente

---

## Comandos Útiles

### Memoria

```powershell
# Ver entradas recientes
.\.gsd\scripts\memory-recent.ps1 -Limit 5

# Buscar en memoria
.\.gsd\scripts\memory-search.ps1 "query"

# Agregar entrada
.\.gsd\scripts\memory-add.ps1 TYPE -Template
# Types: journal, decision, pattern, learning
```

### Indexado

```powershell
# Re-indexar Vault (después de agregar muchas notas)
.\.gsd\scripts\memory-index-external.ps1

# Ver estadísticas
.\.gsd\scripts\memory-index-external.ps1 -Stats

# Forzar re-indexado completo
.\.gsd\scripts\memory-index-external.ps1 -Force
```

### Búsqueda

```powershell
# Buscar en Vault
.\.gsd\scripts\memory-search.ps1 "query" -External

# Buscar en memoria de agentes
.\.gsd\scripts\memory-search.ps1 "query"

# Buscar en todo
.\.gsd\scripts\memory-search.ps1 "query" -All

# Limitar resultados
.\.gsd\scripts\memory-search.ps1 "query" -Limit 5
```

---

## Mantenimiento

### Cuándo Re-indexar

**Automático** (futuro): Cuando guardás archivos

**Manual** (ahora): Cuando:
- Agregaste muchas notas nuevas
- Modificaste contenido importante
- Búsquedas no encuentran info reciente

```powershell
.\.gsd\scripts\memory-index-external.ps1
```

### Limpiar Índice

Si el índice crece mucho o tiene problemas:

```powershell
# Borrar y recrear
Remove-Item .gsd\memory\.index\vault.db
.\.gsd\scripts\memory-index-external.ps1
```

---

## Diferencias con Proyectos de Código

### Vault (este)

**Propósito**: Knowledge base personal, conversaciones generales

**Contenido**:
- Notas personales
- Documentación
- Journal personal
- Conversaciones con agentes

**IMPLEMENTATION_PLAN.md**: Tareas personales, no código

### Proyectos (exp005, etc)

**Propósito**: Desarrollo de software

**Contenido**:
- Código fuente
- Tests
- Documentación técnica

**IMPLEMENTATION_PLAN.md**: Tareas de desarrollo

**Ambos pueden**:
- Indexar el Vault para búsquedas
- Usar memoria de agentes
- Ejecutar Ralph Loop

---

## Tips

### Para Agentes

Cuando trabajes con agentes en el Vault:

1. **Sé específico**: "Busca en el Vault información sobre X"
2. **Usa búsqueda**: Agente puede buscar antes de responder
3. **Documenta**: Pide al agente documentar insights importantes
4. **Organiza**: Agente puede ayudar a organizar/limpiar Vault

### Para Ti

1. **Indexa regularmente**: Después de agregar muchas notas
2. **Usa búsqueda**: Más rápido que buscar manualmente
3. **Revisa memoria**: Ver qué han observado los agentes
4. **Mantén separado**: Notas del Vault vs memoria de agentes

---

## Troubleshooting

### "Index not found"

```powershell
.\.gsd\scripts\memory-index-external.ps1
```

### "SQLite not found"

SQLite ya está instalado en `~/.gsd-tools/`. Verificar PATH:

```powershell
$env:PATH = "$env:USERPROFILE\.gsd-tools;$env:PATH"
sqlite3 --version
```

### Búsquedas lentas

Normal en primera búsqueda. Después son instantáneas.

Si persiste, re-indexar:

```powershell
.\.gsd\scripts\memory-index-external.ps1 -Force
```

---

## Próximos Pasos

1. **Indexar el Vault** (si no lo hiciste)
2. **Abrir Kiro** en el Vault
3. **Probar búsquedas** desde Kiro
4. **Conversar** sobre cualquier tema
5. **Documentar** insights importantes

El agente ahora tiene acceso a todo tu conocimiento. Úsalo.
