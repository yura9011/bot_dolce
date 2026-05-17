# Procedimiento: Cambio de Número de WhatsApp

**Cliente**: Dolce Party - Santa Ana  
**Fecha**: 2026-05-11 (Mañana)  
**Duración estimada**: 15-20 minutos  
**Downtime**: 5-10 minutos

---

## 📋 Pre-requisitos

- [ ] Acceso SSH al servidor
- [ ] Nuevo número de WhatsApp listo para escanear QR
- [ ] Backup del sistema actual

---

## 🔄 Procedimiento

### Opción 1: Cambio Rápido (Recomendado)

**Tiempo total**: 15 minutos  
**Downtime**: 5 minutos

```bash
# 1. Conectarse al servidor
ssh forma@srv1658334.hstgr.cloud

# 2. Ir al directorio del bot
cd /home/forma/bot_dolce

# 3. Crear backup de seguridad
cp -r .wwebjs_auth .wwebjs_auth.backup-$(date +%Y%m%d)

# 4. Detener el bot
pm2 stop bot-dolce-prd

# 5. Eliminar la sesión vieja
rm -rf .wwebjs_auth/santa-ana-session

# 6. Reiniciar el bot
pm2 start bot-dolce-prd

# 7. Ver el QR code en los logs
pm2 logs bot-dolce-prd --lines 50

# 8. Escanear el QR con el NUEVO número

# 9. Esperar mensaje de confirmación en logs:
# "[INFO] [santa-ana] Autenticación exitosa"
# "[INFO] [santa-ana] Bot conectado y listo"

# 10. Verificar que funciona
# Enviar mensaje de prueba al nuevo número

# 11. Si todo OK, guardar configuración PM2
pm2 save
```

---

### Opción 2: Sin Downtime (Más Complejo)

**Tiempo total**: 20 minutos  
**Downtime**: 0 minutos (usa testing)

```bash
# 1. Conectarse al servidor
ssh forma@srv1658334.hstgr.cloud

# 2. Ir al entorno de testing
cd /home/forma/bot_testing

# 3. Eliminar sesión de testing
rm -rf .wwebjs_auth_testing/santa-ana-session-testing

# 4. Reiniciar bot de testing
pm2 restart bot-dolce-dev

# 5. Ver QR en logs de testing
pm2 logs bot-dolce-dev --lines 50

# 6. Escanear QR con el NUEVO número

# 7. Verificar que funciona en testing
# Enviar mensajes de prueba

# 8. Si funciona, copiar sesión a producción
pm2 stop bot-dolce-prd

cp -r /home/forma/bot_testing/.wwebjs_auth_testing/santa-ana-session-testing \
     /home/forma/bot_dolce/.wwebjs_auth/santa-ana-session

pm2 start bot-dolce-prd

# 9. Verificar producción
pm2 logs bot-dolce-prd --lines 20

# 10. Guardar
pm2 save
```

---

## ✅ Verificación Post-Cambio

### 1. Verificar Conexión
```bash
# Ver logs
pm2 logs bot-dolce-prd --lines 20

# Buscar estos mensajes:
# ✅ "[INFO] [santa-ana] Autenticación exitosa"
# ✅ "[INFO] [santa-ana] Bot conectado y listo"
# ✅ "[INFO] [santa-ana] 📦 Catálogo: 3882 productos"
```

### 2. Prueba Funcional
```
1. Enviar mensaje al nuevo número: "Hola"
2. Bot debe responder con saludo de Coti
3. Preguntar por un producto: "globos rojos"
4. Bot debe buscar en catálogo y responder
```

### 3. Verificar Dashboard
```
1. Abrir: http://2.24.89.243:3000
2. Verificar que muestra "Online"
3. Verificar que muestra mensajes nuevos
```

---

## 🚨 Troubleshooting

### Problema: QR no aparece en logs
```bash
# Solución:
pm2 restart bot-dolce-prd
pm2 logs bot-dolce-prd --lines 100
# Esperar 30 segundos, el QR debería aparecer
```

### Problema: QR escaneado pero no conecta
```bash
# Solución:
# 1. Verificar que el número es correcto
# 2. Verificar que WhatsApp está actualizado
# 3. Reintentar:
pm2 stop bot-dolce-prd
rm -rf .wwebjs_auth/santa-ana-session
pm2 start bot-dolce-prd
# Escanear QR nuevamente
```

### Problema: Bot conecta pero no responde
```bash
# Verificar logs de errores
pm2 logs bot-dolce-prd --err --lines 50

# Verificar que el catálogo cargó
# Buscar en logs: "Catálogo cargado"

# Si no cargó, reiniciar:
pm2 restart bot-dolce-prd
```

### Problema: Necesito volver al número viejo
```bash
# Rollback:
pm2 stop bot-dolce-prd
rm -rf .wwebjs_auth/santa-ana-session
cp -r .wwebjs_auth.backup-YYYYMMDD/santa-ana-session \
     .wwebjs_auth/
pm2 start bot-dolce-prd
```

---

## 📝 Checklist de Ejecución

### Antes del Cambio
- [ ] Backup creado
- [ ] Nuevo número listo
- [ ] Cliente notificado del downtime
- [ ] Acceso SSH verificado

### Durante el Cambio
- [ ] Bot detenido
- [ ] Sesión vieja eliminada
- [ ] Bot reiniciado
- [ ] QR escaneado
- [ ] Conexión verificada

### Después del Cambio
- [ ] Prueba funcional OK
- [ ] Dashboard muestra online
- [ ] Cliente notificado del cambio
- [ ] Backup viejo guardado por 7 días

---

## 📞 Contactos de Emergencia

Si algo sale mal:
- **Soporte técnico**: [Tu contacto]
- **Cliente**: Dolce Party
- **Backup disponible**: Sí (7 días)

---

## 📊 Tiempo Estimado por Paso

| Paso | Tiempo |
|------|--------|
| Backup | 1 min |
| Detener bot | 10 seg |
| Eliminar sesión | 5 seg |
| Reiniciar bot | 10 seg |
| Esperar QR | 30 seg |
| Escanear QR | 1 min |
| Verificar conexión | 2 min |
| Pruebas | 5 min |
| **Total** | **~10 min** |

---

## ✅ Éxito

El cambio es exitoso cuando:
- ✅ Bot conectado con nuevo número
- ✅ Responde a mensajes
- ✅ Busca en catálogo correctamente
- ✅ Dashboard muestra online
- ✅ Cliente satisfecho

---

**Preparado por**: Kiro AI  
**Fecha**: 2026-05-10  
**Versión**: 1.0
