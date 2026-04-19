# Plan de Consolidación de Protocolos

## Objetivo
Reducir ~800 líneas de duplicación en protocolos manteniendo toda la funcionalidad.

## Estado Actual
- `.gsd/protocols/validation.md` - 250 líneas
- `.gsd/protocols/parallel.md` - 348 líneas  
- `.gsd/protocols/file-structure.md` - 345 líneas
- **Total**: 943 líneas

## Duplicaciones Identificadas

### 1. Secciones Repetidas (Eliminar ~200 líneas)
- "Core Principles" aparece 3 veces con contenido similar
- "Cross-Platform Implementation" aparece 3 veces
- "Success Criteria" aparece 3 veces con frases idénticas

### 2. Ejemplos de Código Duplicados (Eliminar ~300 líneas)
- Ejemplos bash repetidos 15 veces
- Ejemplos PowerShell repetidos 12 veces
- Patrones de detección de herramientas duplicados

### 3. Explicaciones Conceptuales (Reducir ~300 líneas)
- Concepto "universal" explicado 3 veces
- Concepto "graceful degradation" explicado 3 veces
- Concepto "cross-platform" explicado 3 veces

## Plan de Consolidación

### Fase A: Crear Archivo Común (30 min)

**Crear**: `.gsd/protocols/README.md`

**Contenido**:
```markdown
# GSD Universal Protocols

## Core Principles (Una sola vez)
1. Universal Compatibility
2. Graceful Degradation  
3. Cross-Platform
4. No IDE Dependencies

## How to Use These Protocols
- validation.md - For code quality
- parallel.md - For task coordination
- file-structure.md - For project organization

## Common Patterns
[Ejemplos bash y PowerShell comunes aquí]
```

### Fase B: Reducir Protocolos Específicos (45 min)

**validation.md**: De 250 → 120 líneas
- Eliminar "Core Principles" (referencia a README)
- Eliminar ejemplos bash/PowerShell genéricos
- Mantener solo ejemplos específicos de validación
- Eliminar explicaciones de "universal" y "cross-platform"

**parallel.md**: De 348 → 150 líneas
- Eliminar "Core Principles" (referencia a README)
- Eliminar ejemplos bash/PowerShell genéricos
- Mantener solo ejemplos de coordinación de tareas
- Reducir explicaciones conceptuales

**file-structure.md**: De 345 → 150 líneas
- Eliminar "Core Principles" (referencia a README)
- Eliminar ejemplos de migración duplicados
- Mantener solo estructura de directorios
- Reducir explicaciones de fallbacks

### Fase C: Crear Biblioteca de Ejemplos (30 min)

**Crear**: `.gsd/examples/shell-patterns.md`

**Contenido**:
```markdown
# Common Shell Patterns

## Bash Examples
[Todos los ejemplos bash aquí]

## PowerShell Examples  
[Todos los ejemplos PowerShell aquí]

## Cross-Platform Patterns
[Patrones que funcionan en ambos]
```

## Resultado Esperado

**Antes**:
- 3 protocolos: 943 líneas
- Mucha duplicación
- Difícil de mantener

**Después**:
- 1 README: ~100 líneas
- 3 protocolos reducidos: ~420 líneas
- 1 biblioteca ejemplos: ~150 líneas
- **Total**: ~670 líneas (reducción del 29%)

## Orden de Ejecución

1. ✅ Crear `.gsd/protocols/README.md` con principios comunes
2. ✅ Crear `.gsd/examples/shell-patterns.md` con ejemplos
3. ✅ Reducir `validation.md` eliminando duplicaciones
4. ✅ Reducir `parallel.md` eliminando duplicaciones
5. ✅ Reducir `file-structure.md` eliminando duplicaciones
6. ✅ Actualizar referencias entre archivos
7. ✅ Verificar que nada se perdió
8. ✅ Commit consolidación

## Tiempo Estimado
- **Total**: ~2 horas
- **Impacto**: Alto (29% reducción, mucho más mantenible)

## Riesgos
- **Bajo**: Solo estamos reorganizando, no eliminando funcionalidad
- **Mitigación**: Revisar cada archivo antes de eliminar contenido