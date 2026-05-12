# GSD v2 Migration Guide

> **Migrating from v1 (cluttered root) to v2 (clean structure)**

---

## Overview

GSD v2 introduces a cleaner file structure with only 5 files in the root directory. All framework files are organized in `.gsd/` with logical subdirectories.

**Benefits:**
- Clean root directory (5 files vs 23)
- Logical organization (config/, docs/, state/)
- Easier to navigate
- Professional appearance
- Backward compatible scripts

---

## Before You Start

### Prerequisites

1. **Commit all changes**
   ```bash
   git add .
   git commit -m "Save work before GSD v2 migration"
   ```

2. **Verify clean working directory**
   ```bash
   git status
   # Should show: "nothing to commit, working tree clean"
   ```

3. **Backup (optional but recommended)**
   ```bash
   git branch gsd-v1-backup
   # Migration script creates this automatically, but manual backup doesn't hurt
   ```

---

## Migration Process

### Windows

```powershell
# Run migration script
.\.gsd\scripts\migrate-to-v2.ps1

# Follow prompts
# Script will:
# 1. Create backup branch
# 2. Move files to new locations
# 3. Create symlinks (or copies if no admin rights)
# 4. Validate structure
# 5. Show next steps
```

### Linux/Mac

```bash
# Make script executable (if needed)
chmod +x .gsd/scripts/migrate-to-v2.sh

# Run migration script
./.gsd/scripts/migrate-to-v2.sh

# Follow prompts
# Script will:
# 1. Create backup branch
# 2. Move files to new locations
# 3. Create symlinks
# 4. Validate structure
# 5. Show next steps
```

---

## What Gets Moved

### Configuration Files
```
AGENTS.md           → .gsd/config/AGENTS.md
PROMPT_build.md     → .gsd/config/PROMPT_build.md
PROMPT_plan.md      → .gsd/config/PROMPT_plan.md
```

### Documentation
```
CHANGELOG.md        → .gsd/docs/CHANGELOG.md
DECISIONS.md        → .gsd/docs/DECISIONS.md
GLOSSARY.md         → .gsd/docs/GLOSSARY.md
GSD-STYLE.md        → .gsd/docs/GSD-STYLE.md
ROADMAP.md          → .gsd/docs/ROADMAP.md
```

### State Files
```
IMPLEMENTATION_PLAN.md → .gsd/state/IMPLEMENTATION_PLAN.md
JOURNAL.md             → .gsd/state/JOURNAL.md
STATE.md               → .gsd/state/STATE.md
```

### Scripts
```
scripts/*           → .gsd/scripts/*
install.sh/bat      → .gsd/scripts/install.sh/ps1
update.sh/bat       → .gsd/scripts/update.sh/ps1
loop.sh/ps1         → .gsd/scripts/loop.sh/ps1
```

### Specs
```
specs/*             → .gsd/specs/*
```

### Other
```
VERSION             → .gsd/VERSION
```

### What Stays in Root
```
README.md           (stays)
QUICKSTART.md       (stays)
LICENSE             (stays)
.gitignore          (stays)
install.sh/bat      (symlinks to .gsd/scripts/)
```

---

## After Migration

### 1. Review Changes

```bash
git status
# Should show all moved files
```

### 2. Test Scripts

**Windows:**
```powershell
# Test validation
.\.gsd\scripts\validate.ps1 -All

# Test ralph
.\.gsd\scripts\ralph.ps1 -DryRun
```

**Linux/Mac:**
```bash
# Test validation
./.gsd/scripts/validate.sh --all

# Test ralph
./.gsd/scripts/ralph.sh --dry-run
```

### 3. Commit Migration

```bash
git add .
git commit -m "feat(structure): migrate to GSD v2 clean structure"
```

### 4. Push (optional)

```bash
git push
```

---

## Rollback

If something goes wrong, you can rollback:

### Option 1: Git Reset (Before Commit)

```bash
# Undo all changes
git reset --hard HEAD

# You're back to v1 structure
```

### Option 2: Restore from Backup Branch (After Commit)

```bash
# Reset to backup branch
git reset --hard gsd-v1-backup

# Force push if you already pushed v2
git push --force
```

### Option 3: Manual Rollback

```bash
# Move files back manually
git mv .gsd/config/AGENTS.md AGENTS.md
git mv .gsd/config/PROMPT_build.md PROMPT_build.md
# ... etc for all files

# Commit
git commit -m "Rollback to v1 structure"
```

---

## Troubleshooting

### Issue: "Uncommitted changes detected"

**Solution:**
```bash
# Commit or stash changes first
git add .
git commit -m "WIP: before migration"

# Or stash
git stash

# Then run migration
```

### Issue: "Symlinks failed (Windows)"

**Cause:** Windows requires admin rights or developer mode for symlinks

**Solution:** Migration script automatically creates copies instead. This is fine, scripts will work.

**To enable symlinks (optional):**
1. Enable Developer Mode in Windows Settings
2. Or run PowerShell as Administrator

### Issue: "Validation failed after migration"

**Solution:**
```bash
# Check what's wrong
./.gsd/scripts/validate.sh --all

# Common issues:
# - Missing files: Check git status
# - Wrong paths: Scripts should auto-detect, but verify
# - Permissions: chmod +x .gsd/scripts/*.sh
```

### Issue: "Scripts don't work after migration"

**Cause:** Scripts might be looking in wrong location

**Solution:**
```bash
# Scripts auto-detect structure, but verify:
# 1. Check structure detection
ls -la .gsd/config/AGENTS.md  # Should exist

# 2. Try explicit path
./.gsd/scripts/ralph.sh --dry-run

# 3. Check script has detection functions
grep "detect_structure" .gsd/scripts/ralph.sh
# Should show function definition
```

### Issue: "Git history lost"

**Cause:** Used `mv` instead of `git mv`

**Prevention:** Migration script uses `git mv` automatically

**Solution if happened:**
```bash
# Rollback and re-run migration script
git reset --hard gsd-v1-backup
./.gsd/scripts/migrate-to-v2.sh
```

---

## Verification Checklist

After migration, verify:

- [ ] Root directory has ≤5 files
- [ ] `.gsd/config/` contains AGENTS.md, PROMPT files
- [ ] `.gsd/docs/` contains documentation
- [ ] `.gsd/state/` contains state files
- [ ] `.gsd/scripts/` contains all scripts
- [ ] `.gsd/specs/` contains specs
- [ ] Validation passes: `./.gsd/scripts/validate.sh --all`
- [ ] Ralph works: `./.gsd/scripts/ralph.sh --dry-run`
- [ ] Git history preserved: `git log AGENTS.md` shows history
- [ ] Symlinks work (or copies exist): `ls -la install.sh`

---

## FAQ

### Q: Will this break my workflow?

**A:** No. Scripts auto-detect v1 or v2 structure. You can use old commands or new commands.

### Q: Do I have to migrate?

**A:** No. v1 structure is still supported. Migration is optional but recommended for cleaner organization.

### Q: Can I migrate back to v1?

**A:** Yes. Use rollback instructions above.

### Q: What if I'm in the middle of work?

**A:** Commit your work first, then migrate. Or wait until a good stopping point.

### Q: Will this affect my team?

**A:** Yes, they'll need to pull the changes. Coordinate migration timing with your team.

### Q: What about CI/CD?

**A:** Update CI/CD scripts to use new paths (`.gsd/scripts/validate.sh` instead of `./scripts/validate.sh`). Or use auto-detection.

### Q: Can I customize the structure?

**A:** Not recommended. Standard structure ensures compatibility with future GSD updates.

---

## Support

If you encounter issues:

1. Check this guide's Troubleshooting section
2. Check git status: `git status`
3. Check validation: `./.gsd/scripts/validate.sh --all`
4. Rollback if needed: `git reset --hard gsd-v1-backup`
5. Open GitHub issue with details

---

## Summary

**Migration is:**
- ✅ Safe (creates backup automatically)
- ✅ Reversible (rollback anytime)
- ✅ Non-breaking (scripts auto-detect structure)
- ✅ Quick (2-3 minutes)
- ✅ Recommended (cleaner organization)

**Steps:**
1. Commit changes
2. Run migration script
3. Test scripts
4. Commit migration
5. Done!

**Rollback:**
```bash
git reset --hard gsd-v1-backup
```

---

**Ready to migrate? Run the migration script!**

**Windows:** `.\.gsd\scripts\migrate-to-v2.ps1`  
**Linux/Mac:** `./.gsd/scripts/migrate-to-v2.sh`
