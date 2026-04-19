# migrate-to-v2.ps1 - Migrate GSD to v2 structure

$ErrorActionPreference = "Stop"

Write-Host "=== GSD v2 Migration ===" -ForegroundColor Cyan
Write-Host ""

# Backup check
$status = git status --porcelain 2>$null
if ($status) {
    Write-Host "ERROR: Uncommitted changes detected" -ForegroundColor Red
    Write-Host "Please commit or stash changes before migration"
    exit 1
}

# Create backup branch
git branch gsd-v1-backup 2>$null | Out-Null
Write-Host "✓ Backup branch created: gsd-v1-backup" -ForegroundColor Green

# Directories already exist from Task 1
Write-Host "✓ Directories ready" -ForegroundColor Green

# Move config files
Write-Host "Moving config files..." -ForegroundColor Yellow
git mv AGENTS.md .gsd/config/
git mv PROMPT_build.md .gsd/config/
git mv PROMPT_plan.md .gsd/config/
Write-Host "✓ Config files moved" -ForegroundColor Green

# Move documentation
Write-Host "Moving documentation..." -ForegroundColor Yellow
git mv CHANGELOG.md .gsd/docs/
git mv DECISIONS.md .gsd/docs/
git mv GLOSSARY.md .gsd/docs/
git mv GSD-STYLE.md .gsd/docs/
git mv ROADMAP.md .gsd/docs/
Write-Host "✓ Documentation moved" -ForegroundColor Green

# Move state files
Write-Host "Moving state files..." -ForegroundColor Yellow
git mv IMPLEMENTATION_PLAN.md .gsd/state/
git mv JOURNAL.md .gsd/state/
git mv STATE.md .gsd/state/
Write-Host "✓ State files moved" -ForegroundColor Green

# Move scripts directory
if (Test-Path "scripts") {
    Write-Host "Moving scripts..." -ForegroundColor Yellow
    Get-ChildItem scripts/* -File | ForEach-Object {
        git mv $_.FullName .gsd/scripts/
    }
    Remove-Item scripts
    Write-Host "✓ Scripts moved" -ForegroundColor Green
}

# Move specs directory
if (Test-Path "specs") {
    Write-Host "Moving specs..." -ForegroundColor Yellow
    Get-ChildItem specs/* -File | ForEach-Object {
        git mv $_.FullName .gsd/specs/
    }
    Remove-Item specs
    Write-Host "✓ Specs moved" -ForegroundColor Green
}

# Move VERSION
git mv VERSION .gsd/VERSION
Write-Host "✓ VERSION moved" -ForegroundColor Green

# Move install/update/loop scripts
Write-Host "Moving root scripts..." -ForegroundColor Yellow
git mv install.sh .gsd/scripts/
git mv install.bat .gsd/scripts/
git mv update.sh .gsd/scripts/
git mv update.bat .gsd/scripts/
git mv loop.sh .gsd/scripts/
git mv loop.ps1 .gsd/scripts/

# Create symlinks (Windows requires admin or developer mode)
try {
    New-Item -ItemType SymbolicLink -Path install.sh -Target .gsd/scripts/install.sh -Force | Out-Null
    New-Item -ItemType SymbolicLink -Path install.bat -Target .gsd/scripts/install.ps1 -Force | Out-Null
    Write-Host "✓ Symlinks created" -ForegroundColor Green
} catch {
    Write-Host "⚠ Symlinks failed (need admin/dev mode), creating copies instead" -ForegroundColor Yellow
    Copy-Item .gsd/scripts/install.sh install.sh
    Copy-Item .gsd/scripts/install.ps1 install.bat
}

# Validate structure
Write-Host ""
Write-Host "=== Validation ===" -ForegroundColor Cyan
if ((Test-Path ".gsd/config/AGENTS.md") -and `
    (Test-Path ".gsd/docs/CHANGELOG.md") -and `
    (Test-Path ".gsd/state/IMPLEMENTATION_PLAN.md") -and `
    (Test-Path ".gsd/scripts/validate.ps1")) {
    Write-Host "✓ Structure validated" -ForegroundColor Green
} else {
    Write-Host "✗ Validation failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Migration Complete ===" -ForegroundColor Cyan
Write-Host ""
$fileCount = (Get-ChildItem -File | Measure-Object).Count
Write-Host "Root directory now has $fileCount files (target: 5)"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Review changes: git status"
Write-Host "2. Update script paths (Task 4)"
Write-Host "3. Test scripts: .\.gsd\scripts\validate.ps1 -All"
Write-Host "4. Commit: git commit -m 'feat(phase-1): migrate to GSD v2 structure'"
Write-Host ""
Write-Host "To rollback: git reset --hard gsd-v1-backup"
