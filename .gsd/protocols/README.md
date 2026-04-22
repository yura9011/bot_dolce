# GSD Universal Protocols

## Overview

These protocols define universal patterns that work in any environment with any AI assistant, using only standard tools and file-based coordination.

## Core Principles

These principles apply to ALL GSD protocols:

### 1. Universal Compatibility
Works in terminal + AI chat, any IDE, or web-based environments. No dependencies on specific tools or platforms.

### 2. Graceful Degradation
Clear fallbacks when advanced tools unavailable. Always provide manual alternatives.

### 3. Cross-Platform
Identical behavior on Windows, macOS, and Linux. Scripts provided in both bash and PowerShell.

### 4. No IDE Dependencies
Zero reliance on IDE-specific features like getDiagnostics, invokeSubAgent, .kiro/, .claude/, etc.

### 5. File-Based State
All state management through standard files and git. No external databases or services required.

### 6. AI Agnostic
Functions identically with any AI assistant (Kiro, Claude Code, Cursor, etc.) or human execution.

## Available Protocols

### validation.md
Universal validation methods for code quality using standard linters and shell commands.

**Use when**: Verifying code syntax, style, and quality before commits or phase completion.

**Key features**:
- Language-specific validation (JS/TS, Python, Markdown, Shell)
- Tool detection with fallbacks
- Manual verification checklists

### parallel.md
Universal patterns for coordinating multiple tasks using file-based coordination.

**Use when**: Executing multiple independent tasks, coordinating research, or managing complex workflows.

**Key features**:
- File-based task queue system
- Sequential and parallel execution patterns
- Manual coordination fallbacks

### file-structure.md
Universal directory structure that eliminates IDE-specific dependencies.

**Use when**: Setting up new projects, migrating from IDE-specific setups, or ensuring portability.

**Key features**:
- IDE-independent directory layout
- Migration guides from .kiro/, .claude/, etc.
- Fallback patterns for restricted environments

## Common Implementation Patterns

### Tool Detection Pattern
Used across all protocols to detect available tools and choose appropriate validation method:

```bash
# Bash
command -v tool_name >/dev/null 2>&1 && HAS_TOOL=1
```

```powershell
# PowerShell
$hasTool = Get-Command tool_name -ErrorAction SilentlyContinue
```

### Graceful Degradation Pattern
Used when advanced tools unavailable:

```
[WARN] Advanced tool not available
[NOTE] Using fallback method
[OK] Basic validation complete
[TIP] Install [tool] for enhanced functionality
```

### Cross-Platform File Operations
Standard patterns that work on all platforms:

```bash
# Bash
mkdir -p directory/
find . -name "*.ext"
test -f file && echo "exists"
```

```powershell
# PowerShell
New-Item -ItemType Directory -Path directory/ -Force
Get-ChildItem -Recurse -Include *.ext
Test-Path file
```

## Integration with GSD Workflows

All protocols integrate seamlessly with GSD workflows:

- **/execute**: Use validation.md before marking tasks complete
- **/verify**: Use validation.md for phase verification
- **/map**: Use parallel.md for coordinating analysis tasks
- **/research-phase**: Use parallel.md for research coordination
- **/new-project**: Use file-structure.md for project setup

## Success Criteria

These protocols succeed when:
- [OK] Work identically in any environment
- [OK] Provide clear feedback with or without advanced tools
- [OK] Maintain cross-platform compatibility
- [OK] Require zero IDE-specific features
- [OK] Enable confident execution anywhere

## Getting Started

1. Read this README for core principles
2. Choose the protocol relevant to your task
3. Follow the protocol's specific instructions
4. Refer to `.gsd/examples/shell-patterns.md` for code examples
5. Use manual fallbacks when tools unavailable

## Further Reading

- `.gsd/UNIVERSAL-SETUP.md` - Complete setup guide
- `.gsd/examples/` - Usage examples and patterns
- `.gsd/workflows/` - GSD workflow definitions
