# 📚 Documentación del Sistema

Esta carpeta contiene toda la documentación técnica del bot de WhatsApp de Dolce Party, organizada por categorías.

## 📁 Estructura de Documentación

### 📊 `analisis/` - Análisis Técnicos
Análisis detallados del sistema, problemas identificados y soluciones implementadas.

- **ANALISIS-BOT-JS.md** - Análisis del archivo principal del bot
- **ANALISIS-DETECCION-MANUAL.md** - Análisis del sistema de detección manual
- **ANALISIS-FEATURES-REPOSITORIOS.md** - Análisis de características de repositorios de referencia
- **ANALISIS-REPOSITORIOS-REFERENCIA.md** - Análisis de repositorios similares
- **ANALISIS-SISTEMA-ESTADISTICAS.md** - Análisis completo del sistema de estadísticas

### ✅ `implementaciones/` - Features Implementadas
Documentación de funcionalidades completadas y operativas.

- **CONTROL-DUAL-IMPLEMENTADO.md** - Sistema de control dual (WhatsApp + Dashboard)
- **SISTEMA-ANTI-HIJACKING-IMPLEMENTADO.md** - Sistema de protección contra ataques
- **SISTEMA-ESTADISTICAS-IMPLEMENTADO.md** - Sistema completo de métricas y estadísticas

### 🎯 `milestones/` - Hitos del Desarrollo
Documentación de los principales hitos y fases del desarrollo.

- **MILESTONE-CONTROL-MANUAL.md** - Hito: Sistema de control manual
- **MILESTONE-CORRECCIONES-POST-ANALISIS.md** - Hito: Correcciones después del análisis
- **MILESTONE-CORRECCIONES-PRE-TESTING.md** - Hito: Correcciones antes del testing
- **MILESTONE-DASHBOARD-WEB.md** - Hito: Dashboard web
- **MILESTONE-MENU-SIMPLIFICADO-Y-ESTADOS.md** - Hito: Simplificación de menús

### 🧪 `testing/` - Pruebas y Verificaciones
Documentación de pruebas realizadas y verificaciones del sistema.

- **TESTING-CORRECCIONES.md** - Pruebas de las correcciones aplicadas
- **TESTING-MENU-SIMPLIFICADO.md** - Pruebas del menú simplificado
- **VERIFICACION-FLUJOS.md** - Verificación de flujos de conversación

### 📋 `specs/` - Especificaciones y Planes
Especificaciones técnicas y planes de desarrollo.

- **SPEC-dashboard-control.md** - Especificación del control del dashboard
- **PLAN-DASHBOARD-DETALLADO.md** - Plan detallado del dashboard
- **PLAN-TESTING-CORE.md** - Plan de testing del core del sistema

### 📦 `archive/` - Documentación Histórica
Documentación histórica, borradores y archivos de trabajo que ya no son relevantes para el desarrollo actual pero se mantienen por referencia.

Subcarpetas recientes:

- `root-notes-2026-05-17/` - notas antiguas que estaban en la raíz del repo.
- `temp-2026-05-17/` - contenido movido desde `docs/temp/`.
- `artifacts-2026-05-17/` - artefactos no activos, como backups corruptos.

## 🔍 Cómo Navegar la Documentación

### **Para Desarrolladores Nuevos:**
1. Empezar con el `README.md` principal del proyecto
2. Leer `HANDOFF.md` y `AGENTS.md`
3. Revisar `.gsd/state/IMPLEMENTATION_PLAN.md` para el plan activo
4. Revisar `implementaciones/` para entender qué está funcionando

### **Para Debugging:**
1. Revisar `analisis/ANALISIS-SISTEMA-ESTADISTICAS.md` para problemas de estadísticas
2. Consultar `testing/` para casos de prueba conocidos
3. Revisar `archive/` para contexto histórico de problemas

### **Para Nuevas Features:**
1. Revisar `.gsd/milestones/` para milestones activos
2. Revisar `specs/` para especificaciones históricas o complementarias
3. Crear nueva documentación en la carpeta apropiada

## 📈 Estado Actual del Sistema

### **✅ Completado y Documentado:**
- Sistema de estadísticas robusto
- Control dual (WhatsApp + Dashboard)
- Anti-hijacking y seguridad
- Dashboard web funcional
- Sistema de pausas y handoffs

### **📝 Bien Documentado:**
- Análisis completo de problemas y soluciones
- Especificaciones técnicas detalladas
- Pruebas y verificaciones realizadas
- Hitos del desarrollo

### **🎯 Próximos Pasos:**
- Mantener documentación actualizada con nuevos cambios
- Documentar nuevas features en carpetas apropiadas
- Archivar documentación obsoleta

## 🔧 Mantenimiento de la Documentación

### **Reglas para Nuevos Documentos:**
1. **Análisis técnicos** → `analisis/`
2. **Features completadas** → `implementaciones/`
3. **Hitos importantes** → `milestones/`
4. **Pruebas y tests** → `testing/`
5. **Especificaciones** → `specs/`
6. **Documentos obsoletos** → `archive/`

### **Formato Recomendado:**
- Usar títulos descriptivos con emojis
- Incluir fecha de creación/actualización
- Estructurar con secciones claras
- Incluir ejemplos de código cuando sea relevante
- Mantener enlaces actualizados

---

**Documentación organizada el 28/04/2026**  
*Sistema de documentación estructurada para mejor mantenimiento*
