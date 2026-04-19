@echo off
setlocal enabledelayedexpansion

echo ========================================
echo GSD Universal - Update Script
echo ========================================
echo.

REM Get target directory
set /p TARGET_DIR="Enter the path to your project directory: "

REM Remove quotes if present
set TARGET_DIR=%TARGET_DIR:"=%

REM Validate target directory exists
if not exist "%TARGET_DIR%" (
    echo.
    echo ERROR: Directory does not exist: %TARGET_DIR%
    echo Please check the path and try again.
    pause
    exit /b 1
)

REM Check if target has GSD files
if not exist "%TARGET_DIR%\.gsd" (
    echo.
    echo ERROR: Target directory does not have GSD installed.
    echo Please run install.bat first.
    pause
    exit /b 1
)

echo.
echo Target directory: %TARGET_DIR%
echo.
echo WARNING: This will update GSD framework files in your project.
echo.
echo Files that will be UPDATED (overwritten):
echo   - .gsd/ directory (workflows, protocols, templates, etc.)
echo   - scripts/ directory (validation, indexing, ralph scripts)
echo   - loop.ps1 and loop.sh
echo   - PROMPT_build.md and PROMPT_plan.md
echo.
echo Files that will be PRESERVED (not touched):
echo   - IMPLEMENTATION_PLAN.md (your tasks)
echo   - specs/ directory (your requirements)
echo   - .git/ directory (your git history)
echo   - Your source code
echo   - README.md, QUICKSTART.md, etc. (your docs)
echo.
set /p CONFIRM="Continue with update? (y/n): "

if /i not "%CONFIRM%"=="y" (
    echo.
    echo Update cancelled.
    pause
    exit /b 0
)

echo.
echo Updating GSD files...
echo.

REM Update .gsd directory
echo [1/2] Updating .gsd directory...
xcopy /E /I /Y /Q ".gsd" "%TARGET_DIR%\.gsd" >nul
if errorlevel 1 (
    echo ERROR: Failed to copy .gsd directory
    pause
    exit /b 1
)
echo   - .gsd directory updated (includes scripts, config, workflows, etc.)

REM Update .gitignore if exists
echo [2/2] Updating .gitignore...
if exist ".gitignore" (
    copy /Y ".gitignore" "%TARGET_DIR%\.gitignore" >nul
    echo   - .gitignore updated
) else (
    echo   - .gitignore not found (skipped)
)

REM Optional: Update AGENTS.md
echo.
set /p UPDATE_AGENTS="Update AGENTS.md? This may overwrite your custom commands (y/n): "
if /i "%UPDATE_AGENTS%"=="y" (
    copy /Y ".gsd\config\AGENTS.md" "%TARGET_DIR%\.gsd\config\AGENTS.md" >nul
    echo   - AGENTS.md updated
) else (
    echo   - AGENTS.md preserved (not updated)
)

REM Optional: Update documentation
echo.
set /p UPDATE_DOCS="Update documentation files (README.md, QUICKSTART.md, etc.)? (y/n): "
if /i "%UPDATE_DOCS%"=="y" (
    copy /Y "README.md" "%TARGET_DIR%\README.md" >nul
    copy /Y "QUICKSTART.md" "%TARGET_DIR%\QUICKSTART.md" >nul
    copy /Y "GLOSSARY.md" "%TARGET_DIR%\GLOSSARY.md" >nul 2>nul
    copy /Y "GSD-STYLE.md" "%TARGET_DIR%\GSD-STYLE.md" >nul 2>nul
    echo   - Documentation files updated
) else (
    echo   - Documentation files preserved (not updated)
)

echo.
echo ========================================
echo Update Complete!
echo ========================================
echo.
echo Updated files in: %TARGET_DIR%
echo.
echo What was updated:
echo   - GSD framework files (.gsd/ with scripts, config, workflows, memory system)
echo.
echo What was preserved:
echo   - Your tasks (.gsd/state/IMPLEMENTATION_PLAN.md)
echo   - Your specs (.gsd/specs/)
echo   - Your memory entries (.gsd/memory/)
echo   - Your source code
echo   - Your git history
echo.
echo Next steps:
echo   1. Review changes: cd "%TARGET_DIR%" ^&^& git status
echo   2. Test validation: .\.gsd\scripts\validate.ps1 -All
echo   3. Commit if satisfied: git add -A ^&^& git commit -m "chore: update GSD framework"
echo.
pause
