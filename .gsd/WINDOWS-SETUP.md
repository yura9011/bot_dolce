# GSD Setup for Windows

## Quick Start

GSD works natively on Windows using PowerShell. No WSL required!

### Recommended: Use PowerShell Scripts

```powershell
# Validation
./scripts/validate.ps1 -All

# Ralph Loop
./loop.ps1 -Mode build

# All GSD operations work natively in PowerShell
```

## Running Bash Scripts on Windows

If you need to run bash scripts (`.sh` files), use the helper:

```powershell
# Run any bash script
./scripts/run-bash.ps1 ./scripts/validate.sh --all

# Run loop.sh
./scripts/run-bash.ps1 ./loop.sh --dry-run
```

### Why This Helper?

Windows has multiple "bash" commands:
- **WSL bash** (default, requires Linux distribution)
- **Git Bash** (comes with Git for Windows)

The helper automatically finds and uses Git Bash, which works without WSL.

## Common Issues

### "bash: command not found" or WSL errors

**Problem**: Windows tries to use WSL bash by default

**Solution**: Use PowerShell scripts (`.ps1`) or the bash helper:
```powershell
# Instead of:
./scripts/validate.sh --all

# Use:
./scripts/validate.ps1 -All
# or
./scripts/run-bash.ps1 ./scripts/validate.sh --all
```

### "Git Bash not found"

**Problem**: Git for Windows not installed

**Solution**: Install Git from https://git-scm.com/

## Best Practices for Windows

1. **Prefer PowerShell scripts** - They work natively without any setup
2. **Use the bash helper** - When you need to run `.sh` files
3. **Don't use WSL** - GSD doesn't require it
4. **Keep it simple** - PowerShell + Git is all you need

## Verification

Test your setup:

```powershell
# Test PowerShell validation
./scripts/validate.ps1 -DryRun -All

# Test bash helper
./scripts/run-bash.ps1 ./scripts/validate.sh --dry-run --all

# Both should work without errors
```

## Summary

✅ **GSD is fully Windows-compatible**
✅ **No WSL required**
✅ **PowerShell scripts work natively**
✅ **Bash scripts work via Git Bash helper**

You're ready to use GSD Universal on Windows!