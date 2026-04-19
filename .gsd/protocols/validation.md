# Universal Validation Protocol

## Overview

This protocol defines universal validation methods that work in any environment with any AI assistant, using only standard shell commands and widely-available language tools.

**Core Principles**: See `.gsd/protocols/README.md` for universal principles that apply to all protocols.

**Shell Patterns**: See `.gsd/examples/shell-patterns.md` for reusable code examples.

## Language-Specific Validation

### JavaScript/TypeScript
**Primary**: Use standard linters
```bash
# JavaScript
npx eslint . --ext .js,.jsx
node -c file.js  # Syntax check fallback

# TypeScript  
npx tsc --noEmit
npx eslint . --ext .ts,.tsx
```

**Fallback**: Manual syntax verification
- Check for balanced braces, brackets, parentheses
- Verify semicolons and commas
- Confirm import/export syntax

### Python
**Primary**: Use standard linters
```bash
python -m py_compile file.py  # Syntax check
pylint *.py                   # Style and errors
flake8 *.py                   # Style guide enforcement
```

**Fallback**: Manual syntax verification
- Check indentation consistency
- Verify colon placement after if/for/def/class
- Confirm parentheses matching

### Markdown
**Primary**: Use standard tools
```bash
markdownlint *.md
# Or basic validation
find . -name "*.md" -exec echo "Checking {}" \;
```

**Fallback**: Manual verification
- Check link syntax [text](url)
- Verify header hierarchy (# ## ###)
- Confirm code block formatting

### Shell Scripts
**Primary**: Use built-in validation
```bash
# Bash
bash -n script.sh

# PowerShell
powershell -NoProfile -Command "& { . ./script.ps1; exit 0 }"
```

**Fallback**: Manual verification
- Check shebang line (#!/bin/bash)
- Verify variable syntax ($VAR vs ${VAR})
- Confirm command substitution syntax

## Cross-Platform Implementation

**Complete implementation examples**: See `.gsd/examples/shell-patterns.md` for:
- Tool detection patterns (bash and PowerShell)
- JavaScript/TypeScript validation functions
- Python validation functions
- File operation patterns

**Quick reference**:
```bash
# Bash: Detect and validate
command -v eslint >/dev/null 2>&1 && npx eslint . || node -c file.js
```

```powershell
# PowerShell: Detect and validate
if (Get-Command eslint -EA SilentlyContinue) { npx eslint . } else { node -c file.js }
```

## Manual Verification Fallbacks

When no automated tools are available, use these manual verification steps:

### General File Validation
1. **Encoding**: Ensure files are UTF-8 with LF line endings
2. **Structure**: Check file organization matches expected patterns
3. **Naming**: Verify file names follow project conventions

### Code Quality Checks
1. **Syntax**: Read through code for obvious syntax errors
2. **Consistency**: Check indentation and formatting consistency
3. **Logic**: Verify basic logic flow and error handling

### Documentation Validation
1. **Links**: Test all links work and point to correct resources
2. **Format**: Check markdown syntax and structure
3. **Content**: Verify information is accurate and up-to-date

## Integration with GSD Workflows

**Execute workflow**: Run universal validation before marking tasks complete.

**Verify workflow**: Use validation for phase verification with evidence collection.

**Example**:
```markdown
## Validation Step
1. Run: `./scripts/validate-universal.sh`
2. If fails: Fix issues before proceeding
3. If tools unavailable: Use manual verification checklist
4. Document validation method in commit message
```

**See also**: `.gsd/workflows/execute.md` and `.gsd/workflows/verify.md` for complete integration.

## Error Handling

**Standard error messages**: See `.gsd/examples/shell-patterns.md` for graceful degradation patterns.

**Key scenarios**:
- Tools unavailable → Use manual verification checklist
- Validation fails → Show file list and error count
- Restricted environment → Provide clear fallback instructions

## Success Criteria

This protocol succeeds when:
- Works identically in any environment (terminal, IDE, web)
- Provides clear feedback with or without advanced tools
- Maintains cross-platform compatibility
- Requires zero IDE-specific features
- Enables confident code quality validation anywhere

**See also**: `.gsd/protocols/README.md` for common success criteria across all protocols.