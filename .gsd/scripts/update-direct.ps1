param(
    [Parameter(Mandatory=$true)]
    [string]$TargetDir
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GSD Universal - Update Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Validate target directory exists
if (-not (Test-Path $TargetDir)) {
    Write-Host "ERROR: Directory does not exist: $TargetDir" -ForegroundColor Red
    exit 1
}

# Check if target has GSD files
if (-not (Test-Path "$TargetDir\.gsd")) {
    Write-Host "ERROR: Target directory does not have GSD installed." -ForegroundColor Red
    Write-Host "Please run install script first." -ForegroundColor Red
    exit 1
}

Write-Host "Target directory: $TargetDir" -ForegroundColor Green
Write-Host ""
Write-Host "Updating GSD files..." -ForegroundColor Yellow
Write-Host ""

# Update .gsd directory
Write-Host "[1/2] Updating .gsd directory..." -ForegroundColor Blue
Copy-Item -Path ".gsd\*" -Destination "$TargetDir\.gsd\" -Recurse -Force
Write-Host "  - .gsd directory updated (includes scripts, config, workflows, memory system)" -ForegroundColor Green

# Update .gitignore if exists
Write-Host "[2/2] Updating .gitignore..." -ForegroundColor Blue
if (Test-Path ".gitignore") {
    Copy-Item -Path ".gitignore" -Destination "$TargetDir\.gitignore" -Force
    Write-Host "  - .gitignore updated" -ForegroundColor Green
} else {
    Write-Host "  - .gitignore not found (skipped)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Update Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Updated files in: $TargetDir" -ForegroundColor Green
Write-Host ""
Write-Host "What was updated:"
Write-Host "  - GSD framework files (.gsd/ with scripts, config, workflows, memory system)"
Write-Host ""
Write-Host "What was preserved:"
Write-Host "  - Your tasks (.gsd/state/IMPLEMENTATION_PLAN.md)"
Write-Host "  - Your specs (.gsd/specs/)"
Write-Host "  - Your memory entries (.gsd/memory/)"
Write-Host "  - Your source code"
Write-Host "  - Your git history"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review changes: cd '$TargetDir'; git status"
Write-Host "  2. Test validation: .\.gsd\scripts\validate.ps1 -All"
Write-Host "  3. Commit if satisfied: git add -A; git commit -m 'chore: update GSD framework'"
Write-Host ""
