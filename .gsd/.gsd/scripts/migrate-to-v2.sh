#!/bin/bash
# migrate-to-v2.sh - Migrate GSD to v2 structure

set -e  # Exit on error

echo "=== GSD v2 Migration ==="
echo ""

# Backup check
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "ERROR: Uncommitted changes detected"
    echo "Please commit or stash changes before migration"
    exit 1
fi

# Create backup branch
git branch gsd-v1-backup 2>/dev/null || true
echo "✓ Backup branch created: gsd-v1-backup"

# Directories already exist from Task 1
echo "✓ Directories ready"

# Move config files
echo "Moving config files..."
git mv AGENTS.md .gsd/config/
git mv PROMPT_build.md .gsd/config/
git mv PROMPT_plan.md .gsd/config/
echo "✓ Config files moved"

# Move documentation
echo "Moving documentation..."
git mv CHANGELOG.md .gsd/docs/
git mv DECISIONS.md .gsd/docs/
git mv GLOSSARY.md .gsd/docs/
git mv GSD-STYLE.md .gsd/docs/
git mv ROADMAP.md .gsd/docs/
echo "✓ Documentation moved"

# Move state files
echo "Moving state files..."
git mv IMPLEMENTATION_PLAN.md .gsd/state/
git mv JOURNAL.md .gsd/state/
git mv STATE.md .gsd/state/
echo "✓ State files moved"

# Move scripts directory
if [ -d "scripts" ]; then
    echo "Moving scripts..."
    for file in scripts/*; do
        if [ -f "$file" ]; then
            git mv "$file" .gsd/scripts/
        fi
    done
    rmdir scripts
    echo "✓ Scripts moved"
fi

# Move specs directory
if [ -d "specs" ]; then
    echo "Moving specs..."
    for file in specs/*; do
        if [ -f "$file" ]; then
            git mv "$file" .gsd/specs/
        fi
    done
    rmdir specs
    echo "✓ Specs moved"
fi

# Move VERSION
git mv VERSION .gsd/VERSION
echo "✓ VERSION moved"

# Move install/update/loop scripts
echo "Moving root scripts..."
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
ROOT_COUNT=$(ls -1 | wc -l)
echo "Root directory now has $ROOT_COUNT files (target: 5)"
echo ""
echo "Next steps:"
echo "1. Review changes: git status"
echo "2. Update script paths (Task 4)"
echo "3. Test scripts: ./.gsd/scripts/validate.sh --all"
echo "4. Commit: git commit -m 'feat(phase-1): migrate to GSD v2 structure'"
echo ""
echo "To rollback: git reset --hard gsd-v1-backup"
