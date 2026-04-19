# Running Bash Scripts on Windows

## The Problem

When you execute bash scripts (`.sh` files) on Windows, the system may try to use WSL (Windows Subsystem for Linux) by default. If WSL is not properly configured, the script will hang indefinitely.

## The Solution

Use the `run-bash.ps1` wrapper script that forces the use of Git Bash instead of WSL.

## Usage

### Instead of this (hangs on Windows):
```powershell
./scripts/validate.sh --all
bash ./scripts/validate.sh --all
```

### Use this (works on Windows):
```powershell
./scripts/run-bash.ps1 ./scripts/validate.sh --all
```

## How It Works

The `run-bash.ps1` script:
1. Locates Git Bash on your system (common installation paths)
2. Executes the bash script using Git Bash directly
3. Bypasses WSL entirely

## Script Location

`scripts/run-bash.ps1`

## When to Use

Use `run-bash.ps1` whenever you need to run bash scripts on Windows:
- Validation scripts (`.sh` files)
- Any GSD workflow scripts
- Cross-platform testing

## Alternative: Use PowerShell Scripts

Most GSD scripts have PowerShell equivalents:
- `validate.sh` → `validate.ps1`
- `validate-universal.sh` → `validate-universal.ps1`
- `validate-all.sh` → `validate-all.ps1`

**Recommendation**: On Windows, prefer PowerShell scripts (`.ps1`) over bash scripts (`.sh`) for better native compatibility.

## Documentation

This solution is documented in:
- `.gsd/WINDOWS-SETUP.md` - Complete Windows setup guide
- `AGENTS.md` - Quick reference for validation commands
- This file - Detailed explanation of the bash wrapper

## For AI Assistants

**CRITICAL**: When working on Windows and needing to execute bash scripts:
1. **NEVER** execute `.sh` files directly (they will hang)
2. **ALWAYS** use `./scripts/run-bash.ps1 script.sh` wrapper
3. **PREFER** using `.ps1` PowerShell equivalents when available

This is not a bug to fix - it's a Windows limitation that requires this workaround.
