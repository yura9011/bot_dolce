@echo off
REM GSD Universal Installer for Windows
REM Copies GSD framework files to your project directory

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   GSD Universal Installer (Windows)
echo ========================================
echo.
echo This installer will copy GSD framework files to your project.
echo.

REM Get current directory (where GSD is)
set "GSD_SOURCE=%~dp0"
set "GSD_SOURCE=%GSD_SOURCE:~0,-1%"

echo GSD Source: %GSD_SOURCE%
echo.

REM Ask for target directory
:ask_target
set "TARGET_DIR="
set /p "TARGET_DIR=Enter target project directory (full path): "

REM Validate input
if "%TARGET_DIR%"=="" (
    echo [ERROR] Target directory cannot be empty.
    echo.
    goto ask_target
)

REM Remove quotes if present
set "TARGET_DIR=%TARGET_DIR:"=%"

REM Check if target exists
if not exist "%TARGET_DIR%" (
    echo.
    echo [WARN] Directory does not exist: %TARGET_DIR%
    set /p "CREATE=Create it? (y/n): "
    if /i "!CREATE!"=="y" (
        mkdir "%TARGET_DIR%" 2>nul
        if errorlevel 1 (
            echo [ERROR] Failed to create directory.
            goto ask_target
        )
        echo [OK] Directory created.
    ) else (
        goto ask_target
    )
)

echo.
echo Target: %TARGET_DIR%
echo.

REM Confirm installation
set /p "CONFIRM=Install GSD to this directory? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo Installation cancelled.
    goto end
)

echo.
echo ========================================
echo   Installing GSD Universal...
echo ========================================
echo.

REM Copy .gsd directory
echo [1/6] Copying .gsd directory...
if exist "%TARGET_DIR%\.gsd" (
    echo [WARN] .gsd directory already exists in target.
    set /p "OVERWRITE=Overwrite? (y/n): "
    if /i not "!OVERWRITE!"=="y" (
        echo [SKIP] Skipping .gsd directory.
        goto copy_scripts
    )
)
xcopy "%GSD_SOURCE%\.gsd" "%TARGET_DIR%\.gsd\" /E /I /Y /Q >nul
if errorlevel 1 (
    echo [ERROR] Failed to copy .gsd directory.
    goto error
)
echo [OK] .gsd directory copied.

:copy_scripts
REM Copy scripts directory
echo [2/6] Copying scripts directory...
if exist "%TARGET_DIR%\scripts" (
    echo [WARN] scripts directory already exists in target.
    set /p "OVERWRITE=Overwrite? (y/n): "
    if /i not "!OVERWRITE!"=="y" (
        echo [SKIP] Skipping scripts directory.
        goto copy_loop
    )
)
xcopy "%GSD_SOURCE%\scripts" "%TARGET_DIR%\scripts\" /E /I /Y /Q >nul
if errorlevel 1 (
    echo [ERROR] Failed to copy scripts directory.
    goto error
)
echo [OK] scripts directory copied.

:copy_loop
REM Copy loop scripts
echo [3/6] Copying loop scripts...
copy "%GSD_SOURCE%\loop.sh" "%TARGET_DIR%\loop.sh" /Y >nul
copy "%GSD_SOURCE%\loop.ps1" "%TARGET_DIR%\loop.ps1" /Y >nul
if errorlevel 1 (
    echo [ERROR] Failed to copy loop scripts.
    goto error
)
echo [OK] loop.sh and loop.ps1 copied.

REM Copy prompt templates
echo [4/6] Copying prompt templates...
copy "%GSD_SOURCE%\PROMPT_build.md" "%TARGET_DIR%\PROMPT_build.md" /Y >nul
copy "%GSD_SOURCE%\PROMPT_plan.md" "%TARGET_DIR%\PROMPT_plan.md" /Y >nul
if errorlevel 1 (
    echo [ERROR] Failed to copy prompt templates.
    goto error
)
echo [OK] PROMPT_build.md and PROMPT_plan.md copied.

REM Copy AGENTS.md
echo [5/6] Copying AGENTS.md...
copy "%GSD_SOURCE%\AGENTS.md" "%TARGET_DIR%\AGENTS.md" /Y >nul
if errorlevel 1 (
    echo [ERROR] Failed to copy AGENTS.md.
    goto error
)
echo [OK] AGENTS.md copied.

REM Copy documentation (optional)
echo [6/6] Copying documentation...
set /p "COPY_DOCS=Copy documentation files (QUICKSTART.md, etc.)? (y/n): "
if /i "%COPY_DOCS%"=="y" (
    copy "%GSD_SOURCE%\QUICKSTART.md" "%TARGET_DIR%\QUICKSTART.md" /Y >nul 2>&1
    copy "%GSD_SOURCE%\README.md" "%TARGET_DIR%\GSD-README.md" /Y >nul 2>&1
    echo [OK] Documentation copied.
) else (
    echo [SKIP] Documentation not copied.
)

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo GSD Universal has been installed to:
echo %TARGET_DIR%
echo.
echo Next steps:
echo   1. cd "%TARGET_DIR%"
echo   2. Read QUICKSTART.md for getting started
echo   3. Run: .\scripts\validate.ps1 -All
echo   4. Start using GSD!
echo.
echo For existing projects:
echo   - Run: .\scripts\index-codebase.ps1
echo   - Read: .gsd\guides\brownfield.md
echo.
goto end

:error
echo.
echo [ERROR] Installation failed.
echo Please check the error messages above.
echo.
goto end

:end
echo Press any key to exit...
pause >nul
