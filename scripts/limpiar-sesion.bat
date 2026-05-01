@echo off
echo ====================================
echo    LIMPIEZA DE SESION WHATSAPP
echo ====================================
echo.

echo Eliminando carpetas de sesion corrupta...

if exist ".wwebjs_auth" (
    echo Eliminando .wwebjs_auth...
    rmdir /s /q ".wwebjs_auth"
    echo ✅ .wwebjs_auth eliminada
) else (
    echo ⚠️ .wwebjs_auth no existe
)

if exist ".wwebjs_cache" (
    echo Eliminando .wwebjs_cache...
    rmdir /s /q ".wwebjs_cache"
    echo ✅ .wwebjs_cache eliminada
) else (
    echo ⚠️ .wwebjs_cache no existe
)

echo.
echo ✅ Limpieza completada!
echo 💡 Ahora podés ejecutar: npm start
echo.
pause