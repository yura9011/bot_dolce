# Phase 1: File Structure Reorganization

> **Goal**: Clean root directory and organize framework into logical `.gsd/` structure

---

## Objective

Transform cluttered root (23 files) into clean, organized structure with only essentials in root and everything else logically organized in `.gsd/`.

---

## Current State

```
/ (root - 23 files)
├── AGENTS.md
├── CHANGELOG.md
├── DECISIONS.md
├── GLOSSARY.md
├── GSD-STYLE.md
├── IMPLEMENTATION_PLAN.md
├── install.bat
├── install.sh
├── JOURNAL.md
├── LICENSE
├── loop.ps1
├── loop.sh
├── PROMPT_build.md
├── PROMPT_plan.md
├── QUICKSTART.md
├── README.md
├── ROADMAP.md
├── STATE.md
├── update.bat
├── update.sh
├── VERSION
├── .gsd/ (existing)
├── scripts/ (existing)
└── specs/ (existing)
```

---

## Target State

```
/ (root - 5 files only)
├── README.md
├── QUICKSTART.md
├── LICENSE
├── .gitignore
└── install.sh / .bat (symlinks)

.gsd/ (everything else)
├── config/
│   ├── AGENTS.md
│   ├── PROMPT_build.md
│   └── PROMPT_plan.md
├── docs/
│   ├── CHANGELOG.md
│   ├── DECISIONS.md
│   ├── GLOSSARY.md
│   ├── GSD-STYLE.md
│   └── ROADMAP.md
├── state/
│   ├── IMPLEMENTATION_PLAN.md
│   ├── JOURNAL.md
│   └── STATE.md
├── scripts/ (moved from /scripts)
│   ├── install.sh
│   ├── install.ps1
│   ├── update.sh
│   ├── update.ps1
│   ├── loop.sh
│   ├── loop.ps1
│   └── ... (all other scripts)
├── specs/ (moved from /specs)
├── templates/ (existing)
├── workflows/ (existing)
├── protocols/ (existing)
├── milestones/ (existing)
└── VERSION
```

---

## Tasks

### Task 1: Create New Directory Structure
**Estimated Time**: 15 minutes

```bash
# Create new directories
mkdir -p .gsd/config
mkdir -p .gsd/docs
mkdir -p .gsd/state
```

**Validation**:
- [ ] Directories exist
- [ ] Correct permissions

---

### Task 2: Create Migration Script (Bash)
**Estimated Time**: 45 minutes

**File**: `.gsd/scripts/migrate-to-v2.sh`

**Requirements**:
- Move files to new locations
- Create symlinks for backward compatibility
- Preserve git history
- Validate structure after migration
- Rollback capability

**Script Structure**:
```bash
#!/bin/bash
# migrate-to-v2.sh - Migrate GSD to v2 structure

set -e  # Exit on error

echo "=== GSD v2 Migration ==="
echo ""

# Backup check
if ! git diff-index --quiet HEAD --; then
    echo "ERROR: Uncommitted changes detected"
    echo "Please commit or stash changes before migration"
    exit 1
fi

# Create backup branch
git branch gsd-v1-backup 2>/dev/null || true
echo "✓ Backup branch created: gsd-v1-backup"

# Create directories
mkdir -p .gsd/config
mkdir -p .gsd/docs
mkdir -p .gsd/state
echo "✓ Directories created"

# Move config files
git mv AGENTS.md .gsd/config/
git mv PROMPT_build.md .gsd/config/
git mv PROMPT_plan.md .gsd/config/
echo "✓ Config files moved"

# Move documentation
git mv CHANGELOG.md .gsd/docs/
git mv DECISIONS.md .gsd/docs/
git mv GLOSSARY.md .gsd/docs/
git mv GSD-STYLE.md .gsd/docs/
git mv ROADMAP.md .gsd/docs/
echo "✓ Documentation moved"

# Move state files
git mv IMPLEMENTATION_PLAN.md .gsd/state/
git mv JOURNAL.md .gsd/state/
git mv STATE.md .gsd/state/
echo "✓ State files moved"

# Move scripts directory
if [ -d "scripts" ]; then
    for file in scripts/*; do
        git mv "$file" .gsd/scripts/
    done
    rmdir scripts
    echo "✓ Scripts moved"
fi

# Move specs directory
if [ -d "specs" ]; then
    for file in specs/*; do
        git mv "$file" .gsd/specs/
    done
    rmdir specs
    echo "✓ Specs moved"
fi

# Move VERSION
git mv VERSION .gsd/VERSION
echo "✓ VERSION moved"

# Move install scripts to .gsd/scripts
git mv install.sh .gsd/scripts/
git mv install.bat .gsd/scripts/
git mv update.sh .gsd/scripts/
git mv update.bat .gsd/scripts/
git mv loop.sh .gsd/scripts/
git mv loop.ps1 .gsd/scripts/

# Create symlinks for convenience
ln -s .gsd/scripts/install.sh install.sh
ln -s .gsd/scripts/install.ps1 install.bat
echo "✓ Symlinks created"

# Validate structure
echo ""
echo "=== Validation ==="
if [ -f ".gsd/config/AGENTS.md" ] && \
   [ -f ".gsd/docs/CHANGELOG.md" ] && \
   [ -f ".gsd/state/IMPLEMENTATION_PLAN.md" ] && \
   [ -f ".gsd/scripts/validate.sh" ]; then
    echo "✓ Structure validated"
else
    echo "✗ Validation failed"
    exit 1
fi

echo ""
echo "=== Migration Complete ==="
echo ""
echo "Root directory now has $(ls -1 | wc -l) files (target: 5)"
echo ""
echo "Next steps:"
echo "1. Review changes: git status"
echo "2. Test scripts: ./.gsd/scripts/validate.sh --all"
echo "3. Commit: git commit -m 'feat: migrate to GSD v2 structure'"
echo ""
echo "To rollback: git reset --hard gsd-v1-backup"
```

**Validation**:
- [ ] Script runs without errors
- [ ] All files moved correctly
- [ ] Git history preserved
- [ ] Symlinks work
- [ ] Rollback works

---

### Task 3: Create Migration Script (PowerShell)
**Estimated Time**: 45 minutes

**File**: `.gsd/scripts/migrate-to-v2.ps1`

**Requirements**: Same as bash version

**Script Structure**:
```powershell
# migrate-to-v2.ps1 - Migrate GSD to v2 structure

$ErrorActionPreference = "Stop"

Write-Host "=== GSD v2 Migration ===" -ForegroundColor Cyan
Write-Host ""

# Backup check
$status = git status --porcelain
if ($status) {
    Write-Host "ERROR: Uncommitted changes detected" -ForegroundColor Red
    Write-Host "Please commit or stash changes before migration"
    exit 1
}

# Create backup branch
git branch gsd-v1-backup 2>$null
Write-Host "✓ Backup branch created: gsd-v1-backup" -ForegroundColor Green

# Create directories
New-Item -ItemType Directory -Force -Path .gsd/config | Out-Null
New-Item -ItemType Directory -Force -Path .gsd/docs | Out-Null
New-Item -ItemType Directory -Force -Path .gsd/state | Out-Null
Write-Host "✓ Directories created" -ForegroundColor Green

# Move config files
git mv AGENTS.md .gsd/config/
git mv PROMPT_build.md .gsd/config/
git mv PROMPT_plan.md .gsd/config/
Write-Host "✓ Config files moved" -ForegroundColor Green

# Move documentation
git mv CHANGELOG.md .gsd/docs/
git mv DECISIONS.md .gsd/docs/
git mv GLOSSARY.md .gsd/docs/
git mv GSD-STYLE.md .gsd/docs/
git mv ROADMAP.md .gsd/docs/
Write-Host "✓ Documentation moved" -ForegroundColor Green

# Move state files
git mv IMPLEMENTATION_PLAN.md .gsd/state/
git mv JOURNAL.md .gsd/state/
git mv STATE.md .gsd/state/
Write-Host "✓ State files moved" -ForegroundColor Green

# Move scripts directory
if (Test-Path "scripts") {
    Get-ChildItem scripts/* | ForEach-Object {
        git mv $_.FullName .gsd/scripts/
    }
    Remove-Item scripts
    Write-Host "✓ Scripts moved" -ForegroundColor Green
}

# Move specs directory
if (Test-Path "specs") {
    Get-ChildItem specs/* | ForEach-Object {
        git mv $_.FullName .gsd/specs/
    }
    Remove-Item specs
    Write-Host "✓ Specs moved" -ForegroundColor Green
}

# Move VERSION
git mv VERSION .gsd/VERSION
Write-Host "✓ VERSION moved" -ForegroundColor Green

# Move install scripts
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
Write-Host "2. Test scripts: .\.gsd\scripts\validate.ps1 -All"
Write-Host "3. Commit: git commit -m 'feat: migrate to GSD v2 structure'"
Write-Host ""
Write-Host "To rollback: git reset --hard gsd-v1-backup"
```

**Validation**:
- [ ] Script runs without errors
- [ ] All files moved correctly
- [ ] Git history preserved
- [ ] Symlinks or copies work
- [ ] Rollback works

---

### Task 4: Update All Script Paths
**Estimated Time**: 2 hours

**Files to Update**:
- `.gsd/scripts/validate.sh` and `.gsd/scripts/validate.ps1`
- `.gsd/scripts/ralph.sh` and `.gsd/scripts/ralph.ps1`
- `.gsd/scripts/loop.sh` and `.gsd/scripts/loop.ps1`
- All other scripts in `.gsd/scripts/`

**Changes Needed**:
```bash
# Before
source AGENTS.md
cat PROMPT_build.md
cat IMPLEMENTATION_PLAN.md

# After
source .gsd/config/AGENTS.md
cat .gsd/config/PROMPT_build.md
cat .gsd/state/IMPLEMENTATION_PLAN.md
```

**Validation**:
- [ ] All scripts run without path errors
- [ ] Scripts work from root directory
- [ ] Scripts work from subdirectories

---

### Task 5: Update Documentation References
**Estimated Time**: 1 hour

**Files to Update**:
- `README.md`
- `QUICKSTART.md`
- `.gsd/docs/ROADMAP.md`
- `.gsd/workflows/*.md`

**Changes Needed**:
- Update all file path references
- Update installation instructions
- Update workflow commands
- Update directory structure diagrams

**Validation**:
- [ ] All links work
- [ ] All paths correct
- [ ] Documentation accurate

---

### Task 6: Test on All Platforms
**Estimated Time**: 1 hour

**Test Matrix**:
- [ ] Windows (PowerShell)
- [ ] Linux (bash)
- [ ] Mac (bash)

**Test Cases**:
1. Fresh clone and migration
2. Existing project migration
3. All scripts execute
4. Validation passes
5. Ralph loop works
6. Symlinks work (or copies on Windows)

**Validation**:
- [ ] All tests pass on all platforms
- [ ] No broken paths
- [ ] No missing files

---

### Task 7: Create Rollback Documentation
**Estimated Time**: 30 minutes

**File**: `.gsd/docs/MIGRATION-V2.md`

**Content**:
- Migration instructions
- Rollback instructions
- Troubleshooting
- FAQ

**Validation**:
- [ ] Documentation complete
- [ ] Rollback tested
- [ ] Clear instructions

---

## Success Criteria

- [ ] Root directory has ≤5 files
- [ ] All framework files in `.gsd/`
- [ ] All scripts work with new structure
- [ ] Git history preserved
- [ ] Backward compatibility via symlinks
- [ ] Works on Windows, Linux, Mac
- [ ] Documentation updated
- [ ] Rollback capability tested

---

## Estimated Time

**Total**: 6-7 hours

- Task 1: 15 minutes
- Task 2: 45 minutes
- Task 3: 45 minutes
- Task 4: 2 hours
- Task 5: 1 hour
- Task 6: 1 hour
- Task 7: 30 minutes
- Buffer: 1 hour

---

## Dependencies

- Git (for preserving history)
- Bash or PowerShell
- Write access to repository

---

## Risks

1. **Breaking existing workflows**: Mitigated by symlinks and path detection
2. **Git history loss**: Mitigated by using `git mv`
3. **Platform differences**: Mitigated by testing on all platforms
4. **User confusion**: Mitigated by clear documentation and migration guide

---

## Next Phase

After Phase 1 completion, proceed to Phase 2: Memory System Foundation
