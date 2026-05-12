# Universal File Structure Protocol

## Overview

This protocol defines a universal directory structure that works identically in any environment with any AI assistant, eliminating all IDE-specific dependencies while maintaining full GSD functionality.

**Core Principles**: See `.gsd/protocols/README.md` for universal principles that apply to all protocols.

**Shell Patterns**: See `.gsd/examples/shell-patterns.md` for reusable code examples.

## Universal Directory Structure

### Root Level (Project Files)
```
project-root/
├── README.md                 # Project documentation
├── CHANGELOG.md              # Version history
├── LICENSE                   # Project license
├── .gitignore               # Git ignore patterns
├── SPEC.md                  # Project specification (GSD)
├── ROADMAP.md               # Phase and milestone definitions (GSD)
├── STATE.md                 # Current project state (GSD)
├── ARCHITECTURE.md          # System design documentation (GSD)
├── DECISIONS.md             # Architecture Decision Records (GSD)
├── JOURNAL.md               # Session log (GSD)
└── TODO.md                  # Quick capture list (GSD)
```

### GSD System Directory (.gsd/)
```
.gsd/
├── SYSTEM.md                # GSD system documentation
├── COMMANDS.md              # Available GSD commands
├── UNIVERSAL-SETUP.md       # Universal setup guide
├── protocols/               # Universal protocols
│   ├── validation.md        # Universal validation protocol
│   ├── parallel.md          # Universal parallel processing
│   └── file-structure.md    # This file
├── lib/                     # Universal libraries and templates
│   ├── task-queue.md        # Task coordination templates
│   └── task-status.md       # Status tracking templates
├── workflows/               # GSD workflow definitions (25 files)
│   ├── new-project.md
│   ├── execute.md
│   ├── verify.md
│   └── ...
├── templates/               # Document templates
│   ├── SPEC.md
│   ├── ROADMAP.md
│   └── ...
├── milestones/              # Milestone-specific work
│   └── {milestone-name}/
│       ├── MILESTONE.md
│       └── phases/
│           └── {N}/
│               ├── {N}-PLAN.md
│               ├── {N}-SUMMARY.md
│               └── RESEARCH.md
└── examples/                # Usage examples and guides
    ├── quick-reference.md
    └── workflow-example.md
```

### Working Directories (Created as Needed)
```
.planning/                   # Phase planning work
├── phase-{N}-CONTEXT.md
├── phase-{N}-RESEARCH.md
└── phase-{N}-PLAN.md

.summaries/                  # Phase completion summaries
└── phase-{N}-SUMMARY.md

.todos/                      # Captured ideas and tasks
└── {topic}.md

.tasks/                      # Universal task coordination (when used)
├── queue.md
├── in-progress.md
├── completed.md
├── failed.md
└── status.md
```

## State Management Patterns

**Git-based state**: All GSD state is managed through git commits and standard files.

**Key commands**:
```bash
# View phase history
git log --oneline --grep="feat(phase-"

# Check current state
cat STATE.md

# View session history
cat JOURNAL.md
```

**Configuration storage**: All configuration in standard markdown files (SPEC.md, ROADMAP.md, STATE.md). No IDE-specific directories.

## Migration from IDE-Specific Structures

**General pattern**: Move IDE-specific directories to `.gsd/legacy/{ide-name}/` and extract universal patterns.

**Examples**:
```bash
# From Kiro
mkdir -p .gsd/legacy/kiro/
mv .kiro/ .gsd/legacy/kiro/ 2>/dev/null || true

# From Claude Code
mkdir -p .gsd/legacy/claude/
mv .claude/ .gsd/legacy/claude/ 2>/dev/null || true
```

After migration, review legacy files and adapt patterns to universal protocols.

## Environment-Specific Adaptations

### Terminal + AI Chat
- **File Operations**: Standard shell commands (ls, cat, mkdir, git)
- **State Management**: Manual file updates (STATE.md, JOURNAL.md)
- **Task Coordination**: Manual task tracking using .tasks/ directory

### IDE Environments (Any IDE)
- **File Operations**: IDE file explorer and editor
- **State Management**: IDE-assisted editing with git integration
- **Task Coordination**: IDE features + universal patterns

### Web-Based Environments
- **File Operations**: Limited file system, use web-based managers
- **State Management**: Git-centric approach, frequent commits
- **Task Coordination**: Simplified single-file tracking

**See also**: `.gsd/UNIVERSAL-SETUP.md` for detailed setup instructions per environment.

## Fallback Patterns

**When file system is limited**: Embed GSD structure in single files (e.g., README.md with embedded state/roadmap).

**When git unavailable**: Use timestamped files (STATE-20260121.md, ROADMAP-v1.md) for manual versioning.

**When shell unavailable**: Use manual operations with checklists and step-by-step instructions.

**See also**: `.gsd/UNIVERSAL-SETUP.md` for complete fallback strategies.

## Validation and Verification

**Structure validation**: See `.gsd/examples/shell-patterns.md` for file operation patterns.

**Quick checks**:
```bash
# Verify universal structure
test -d .gsd && test -f SPEC.md && test -f ROADMAP.md && echo "✓ GSD structure valid"

# Check for IDE dependencies (should not exist)
! test -d .kiro && ! test -d .claude && echo "✓ No IDE dependencies"
```

**Cross-platform compatibility**: Test file and git operations work on current platform.

## Integration with Universal Protocols

**Validation**: `.gsd/protocols/validation.md` validates files in standard project directories with no IDE dependencies.

**Parallel Processing**: `.gsd/protocols/parallel.md` uses .tasks/ directory for coordination with standard file operations.

**See also**: `.gsd/protocols/README.md` for how all protocols work together.

## Success Criteria

This file structure protocol succeeds when:
- Works identically in any environment (terminal, IDE, web)
- Eliminates all IDE-specific directory dependencies
- Provides clear migration paths from existing setups
- Supports both automated and manual file operations
- Maintains full GSD functionality without tool dependencies
- Enables confident project management anywhere

**See also**: `.gsd/protocols/README.md` for common success criteria across all protocols.