# Sistema de Diseño: Dolce Party Dashboard (v1.0)

Este documento define la base visual para el rediseño del Dashboard Humano. Utiliza una paleta **Cálido Moderno** basada en Violeta y Ámbar, enfocada en la legibilidad, accesibilidad y una estética profesional pero acogedora.

## 1. Paleta de Colores

### Primario (Violeta)
Utilizado para elementos estructurales, branding, acciones principales y estados activos.
- `primary-100`: #ede9fe (Fondos suaves, hover)
- `primary-300`: #c4b5fd (Bordes suaves)
- `primary-500`: **#7c3aed** (Acciones principales, color base)
- `primary-700`: #6d28d9 (Hover en botones oscuros)
- `primary-900`: #4c1d95 (Texto en fondos claros, estados de énfasis)

### Acento (Ámbar)
Utilizado para destacar elementos específicos, notificaciones, y llamadas a la acción secundarias.
- `accent-100`: #fef3c7
- `accent-300`: #fcd34d
- `accent-500`: **#f59e0b** (Botones de acción secundaria, alertas)
- `accent-700`: #b45309
- `accent-900`: #78350f

### Escala de Grises (Slate)
Utilizado para tipografía, fondos generales y divisiones.
- `gray-50`:  #f8fafc (Fondo principal de aplicación)
- `gray-100`: #f1f5f9 (Fondo de secciones)
- `gray-200`: #e2e8f0 (Bordes decorativos)
- `gray-400`: #94a3b8 (Texto secundario / placeholders)
- `gray-700`: #334155 (Texto base)
- `gray-900`: #0f172a (Encabezados y texto de alto contraste)

### Semánticos
- **Éxito**: #10b981 (Confirmaciones, checks)
- **Error**: #ef4444 (Alertas críticas, borrado)
- **Info**: #3b82f6 (Información técnica)
- **Warning**: #f59e0b (Advertencias, esperas)

---

## 2. Tipografía

- **Fuente**: System Stack (`Inter`, `SF Pro`, `Segoe UI`, `Roboto`)
- **Escala**:
  - `text-xs`: 12px (Metadatos, timestamps)
  - `text-sm`: 14px (Texto de chat, etiquetas)
  - `text-base`: 16px (Cuerpo de texto general)
  - `text-lg`: 18px (Subtítulos)
  - `text-xl`: 20px (Títulos de sección)
  - `text-2xl`: 24px (Títulos principales)

---

## 3. Espaciado e Layout

Sistema basado en múltiplos de **4px**.
- `spacing-1`: 4px
- `spacing-2`: 8px
- `spacing-4`: 16px (Padding estándar de contenedores)
- `spacing-8`: 32px (Margen entre secciones grandes)

---

## 4. Componentes Visuales

### Bordes y Radio
- `radius-md`: 8px (Tarjetas, botones, inputs)
- `radius-lg`: 12px (Contenedores principales)
- `radius-full`: Círculos (Avatares)

### Sombras (Elevación)
- `shadow-sm`: Para botones y elementos interactivos pequeños.
- `shadow-md`: Para tarjetas y paneles laterales.
- `shadow-lg`: Para modales y dropdowns.

---

## 5. Uso de Variables CSS

Para implementar este sistema, utiliza siempre las variables definidas en `design-tokens.css`:

```css
.card {
    background-color: var(--gray-50);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-md);
    padding: var(--spacing-4);
    box-shadow: var(--shadow-sm);
}

.btn-primary {
    background-color: var(--primary-500);
    color: white;
    padding: var(--spacing-2) var(--spacing-4);
    transition: var(--transition-fast);
}

.btn-primary:hover {
    background-color: var(--primary-700);
}
```
