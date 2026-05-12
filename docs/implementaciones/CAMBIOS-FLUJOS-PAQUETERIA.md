# Cambios en Flujos de Paquetería

## Cambios Implementados (según feedback del cliente)

### 1. Menú Principal - Textos más claros
**Antes:**
- "Realizar pedido"
- "Envíos y paquetería"

**Después:**
- "Realizar pedido cotillón"
- "Entrega y recepción de envíos"

### 2. Correo Argentino - Nuevo submenú
**Antes:** Mostraba info directamente

**Después:** Submenú con opciones:
1. Retirar un envío
2. Hacer un envío

#### Opción 1: Retirar envío
- Link de seguimiento
- Requisitos para retirar (titular + DNI o autorización)

#### Opción 2: Hacer envío
- Requisitos del paquete
- Horario de atención
- Dirección

### 3. Andreani - Información actualizada
**Agregado:**
- Para retirar se necesita: **QR + DNI del titular**

### 4. Mercado Libre - Información actualizada
**Agregado:**
- Aviso importante: **"Momentáneamente NO estamos habilitados para recibir devoluciones"**

## Nuevos Estados del Flujo

```javascript
MENU_CORREO_ARGENTINO: "menu_correo_argentino"
INFO_CORREO_RETIRAR: "info_correo_retirar"
INFO_CORREO_ENVIAR: "info_correo_enviar"
```

## Flujo Completo Actualizado

```
Usuario escribe → Bienvenida → Pide nombre
                                    ↓
                            Menú Principal
                    /                      \
    1. Realizar pedido cotillón    2. Entrega y recepción
                                              ↓
                                    Menú Paquetería
                            /         |          \
                    Correo Arg.   Andreani   Mercado Libre
                        ↓
                Submenú Correo Arg.
                    /         \
            1. Retirar    2. Enviar
                ↓              ↓
            Info Retirar   Info Enviar
```

## Archivos Modificados

1. **flujos.js**
   - Actualizado `getMenuPrincipal()`
   - Agregado `getMenuCorreoArgentino()`
   - Agregado `getInfoCorreoArgentinoRetirar()`
   - Agregado `getInfoCorreoArgentinoEnviar()`
   - Actualizado `getInfoAndreani()` (QR + DNI)
   - Actualizado `getInfoMercadoLibre()` (sin devoluciones)
   - Nuevos estados agregados

2. **bot.js**
   - Actualizado imports de flujos
   - Agregada lógica para `MENU_CORREO_ARGENTINO`
   - Actualizada lógica de estados de info de paquetería

## Testing Requerido

- [ ] Probar flujo completo de Correo Argentino (retirar)
- [ ] Probar flujo completo de Correo Argentino (enviar)
- [ ] Verificar que Andreani muestre QR + DNI
- [ ] Verificar que Mercado Libre muestre aviso de devoluciones
- [ ] Probar navegación con opción "0" (volver)
- [ ] Verificar que los textos del menú principal sean claros

---

**Cambios implementados el 28/04/2026**  
*Basado en feedback directo del cliente*