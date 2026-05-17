# .kiro/ Directory Content Analysis

**Date**: 2026-01-21  
**Purpose**: Analyze all content in `.kiro/` to determine what's GSD-related vs Kiro-specific  
**Goal**: Migrate GSD content to universal structure, identify Kiro-only features

---

## Executive Summary

The `.kiro/` directory contains **3 types of content**:

1. **🔴 Kiro-Specific Features** - IDE-only, cannot be universal (hooks, Python scripts)
2. **🟡 GSD Content in Wrong Location** - Should be in `.gsd/` (steering, some docs)
3. **🟢 Kiro Optimizations** - Optional enhancements for Kiro users (commands, agents, skills)

---

## Detailed Analysis by Subdirectory

### 1. `.kiro/steering/` - 🟡 MIGRATE TO .gsd/

**Current Content**:
- `gsd-system.md` - Complete GSD system instructions for Kiro

**Analysis**:
- This is **GSD documentation**, not Kiro-specific
- Currently marked `inclusion: always` (auto-loaded in Kiro)
- Contains universal GSD rules and workflows
- **Already duplicated** in `.gsd/SYSTEM.md` and `.gsd/COMMANDS.md`

**Verdict**: 🟡 **REDUNDANT - Can be deleted**

**Reason**:
- Content already exists in `.gsd/SYSTEM.md`
- Kiro can read `.gsd/` files directly
- No need for duplicate in `.kiro/steering/`
- If we want auto-loading in Kiro, we can configure it to read `.gsd/SYSTEM.md`

**Action**: Delete `.kiro/steering/gsd-system.md` (redundant)

---

### 2. `.kiro/hooks/` - 🔴 KIRO-SPECIFIC (Keep or Delete)

**Current Content**:
- Empty folder (no hooks defined)
- `settings/hooks.json` - Hook configuration

**Analysis**:
- Hooks are **Kiro IDE feature** (PreToolUse, PostToolUse)
- Requires Python scripts to execute
- Cannot be made universal (needs IDE integration)
- Currently configured but not actively used (empty folder)

**Verdict**: 🔴 **KIRO-SPECIFIC**

**Options**:
1. **Delete entirely** - Not using hooks, contradicts universal vision
2. **Keep as optional** - Document as Kiro-only optimization
3. **Disable but preserve** - Keep code for reference

**Recommendation**: **Delete** - We're not using hooks, and they contradict gsd-universal vision

**Files to delete**:
- `.kiro/hooks/` (empty)
- `.kiro/settings/hooks.json`
- `.kiro/scripts/` (Python hook scripts)

---

### 3. `.kiro/scripts/` - 🔴 KIRO-SPECIFIC (Delete)

**Current Content**:
- `check_planning_lock.py` - PreToolUse hook for Planning Lock
- `validate_syntax.py` - PostToolUse hook for syntax validation
- `utils/` - Hook utilities (hook_input.py, state_reader.py)
- `tests/` - Hook tests

**Analysis**:
- These are **Kiro hook implementations** (Python scripts)
- Require Kiro IDE to execute (PreToolUse/PostToolUse hooks)
- Cannot be made universal
- **Planning Lock** is enforced by GSD workflows, not hooks
- **Syntax validation** is handled by `scripts/validate.sh` and `.ps1`

**Verdict**: 🔴 **KIRO-SPECIFIC - Delete**

**Reason**:
- Hooks contradict universal vision
- Functionality already exists in universal form:
  - Planning Lock: GSD workflows check SPEC.md status
  - Syntax validation: `scripts/validate.sh` and `.ps1`
- Python dependency not needed for GSD

**Action**: Delete entire `.kiro/scripts/` directory

---

### 4. `.kiro/agents/` - 🔴 KIRO-SPECIFIC (Delete)

**Current Content**:
- `map-explorer.md` - Subagent for `/map` command
- `research-agent.md` - Subagent for `/research-phase` command
- `verify-agent.md` - Subagent for `/verify` command
- `AGENT_TEMPLATE.md` - Template for creating agents
- `CONTEXT_FORK.md` - Documentation on context fork pattern
- `README.md` - Agents overview

**Analysis**:
- These are **Kiro subagent definitions** (require `invokeSubAgent` feature)
- Provide **context savings** (99% reduction) by forking context
- **Kiro IDE feature** - Cannot work in terminal, ChatGPT, Claude web, etc.
- Workflows already have universal alternatives (task-based coordination)

**Verdict**: 🔴 **KIRO-SPECIFIC - Delete**

**Reason**:
1. **Requires Kiro IDE** - `invokeSubAgent` is Kiro-specific feature
2. **Contradicts Phase 1 work** - We created universal parallel processing in `.gsd/protocols/parallel.md`
3. **Workflows have fallbacks** - `.gsd/workflows/map.md` uses task-based coordination (universal)
4. **Cannot be made universal** - Subagents are IDE feature

**What we lose**: Context savings optimization in Kiro
**What we keep**: Universal task coordination (`.gsd/protocols/parallel.md`, `.gsd/lib/task-queue.md`)
**Impact**: Medium - Kiro users lose context optimization, but workflows still work

**Action**: Delete entire `.kiro/agents/` directory

---

### 5. `.kiro/commands/` - 🔴 KIRO-SPECIFIC (Delete)

**Current Content**:
- 25 slash command definitions (`.md` files)
- Each file is a **minimal wrapper** that says "read `.gsd/workflows/{command}.md`"
- Kiro-specific features:
  - Slash command syntax (`/map`, `/plan`, etc.)
  - Argument hints for autocomplete
  - Bash pre-execution for context (`!git branch`, `!ls -la`)
  - File references with @ syntax (`@.gsd/workflows/map.md`)
  - Tool restrictions (`allowed-tools: Read, Write, Bash`)

**Example** (`.kiro/commands/map.md`):
```markdown
---
allowed-tools: Read, Write, Bash(git add:*), Bash(git commit:*)
description: Analyze codebase and create ARCHITECTURE.md
---

# /map

Read and follow the workflow at `.gsd/workflows/map.md`.

**Context**:
- @.gsd/workflows/map.md
- @.gsd/templates/ARCHITECTURE.md

**Current Project**:
!`git branch --show-current`
!`ls -la`
```

**Analysis**:
- These are **Kiro IDE slash commands** (require Kiro to work)
- They are **NOT duplicates** - they're thin wrappers that reference `.gsd/workflows/`
- The actual workflow logic is in `.gsd/workflows/` (universal)
- **Kiro-specific syntax**: `@` for file refs, `!` for bash execution, `allowed-tools`
- Cannot be made universal (slash commands are Kiro IDE feature)

**Verdict**: 🔴 **KIRO-SPECIFIC - Delete**

**Reason**:
1. **Slash commands require Kiro IDE** - Cannot work in terminal, ChatGPT, Claude web, etc.
2. **Workflows already exist** - All logic is in `.gsd/workflows/` (universal)
3. **Contradicts universal vision** - Depends on Kiro IDE features
4. **Users can read workflows directly** - No need for IDE-specific wrappers
5. **Kiro can read `.gsd/workflows/`** - No need for separate command files

**What we lose**: Slash command convenience in Kiro IDE
**What we keep**: All workflow logic (in `.gsd/workflows/`)
**Impact**: Low - Kiro users can still read workflows, just not via slash commands

**Action**: Delete entire `.kiro/commands/` directory

---

### 6. `.kiro/skills/` - 🔴 KIRO-SPECIFIC (Delete)

**Current Content**:
- `spec-writer/` - Skill for creating SPEC.md
- `roadmap-builder/` - Skill for creating ROADMAP.md
- `commit-helper/` - Skill for generating commit messages
- `SKILL_TEMPLATE.md` - Template for creating skills
- `utils/` - Skill utilities
- `README.md` - Skills overview

**Analysis**:
- These are **Kiro skill definitions** (executable documentation)
- Provide **active guidance** and **validation**
- **Kiro IDE feature** - Auto-invoke based on keywords
- Include validation scripts (Python)
- Templates already exist in `.gsd/templates/`

**Verdict**: 🔴 **KIRO-SPECIFIC - Delete**

**Reason**:
1. **Requires Kiro IDE** - Skills are Kiro-specific feature
2. **Templates already exist** - `.gsd/templates/SPEC.md`, `ROADMAP.md`, etc.
3. **Python validation scripts** - Adds dependency, contradicts universal
4. **Auto-invoke is IDE feature** - Cannot work in terminal/web
5. **Workflows provide guidance** - `.gsd/workflows/new-project.md` guides SPEC creation

**What we lose**: Auto-invocation and Python validation in Kiro
**What we keep**: All templates (`.gsd/templates/`), workflow guidance
**Impact**: Low - Templates and workflows provide same guidance

**Action**: Delete entire `.kiro/skills/` directory

---

### 7. `.kiro/settings/` - 🔴 KIRO-SPECIFIC (Delete)

**Current Content**:
- `hooks.json` - Hook configuration

**Analysis**:
- This is **Kiro IDE configuration** for hooks
- Hooks are not being used (`.kiro/hooks/` is empty)
- Contradicts universal vision

**Verdict**: 🔴 **DELETE**

**Action**: Delete `.kiro/settings/hooks.json`

---

### 8. `.kiro/README.md` - 🔴 KIRO-SPECIFIC (Delete or Move)

**Current Content**:
- Overview of Kiro hooks implementation
- Architecture diagram
- Hook descriptions (Planning Lock, Syntax Validation)
- Configuration examples

**Analysis**:
- This is **Kiro hooks documentation**
- Describes features we're deleting (hooks, Python scripts)
- Not relevant if we delete hooks

**Verdict**: 🔴 **DELETE** (if deleting hooks) or **MOVE** (if keeping as optional)

**Action**: 
- If deleting hooks: Delete this file
- If moving to optional: Move to `.gsd/optional/kiro/README.md`

---

## Summary of Actions

### 🔴 DELETE ENTIRE `.kiro/` DIRECTORY

**Reason**: All content is either Kiro-specific (requires IDE) or redundant (duplicates `.gsd/`)

| Path | Reason |
|------|--------|
| `.kiro/steering/gsd-system.md` | Redundant (duplicates `.gsd/SYSTEM.md`) |
| `.kiro/hooks/` | Empty, not using hooks |
| `.kiro/scripts/` | Hook implementations (Python), contradicts universal |
| `.kiro/settings/hooks.json` | Hook configuration, not using |
| `.kiro/README.md` | Hooks documentation |
| `.kiro/agents/` | Kiro subagents (invokeSubAgent), contradicts Phase 1 universal parallel |
| `.kiro/commands/` | Kiro slash commands, requires IDE |
| `.kiro/skills/` | Kiro skills (auto-invoke), requires IDE |

**What we lose**:
- Slash command convenience (`/map`, `/plan`, etc.)
- Subagent context savings (99% reduction)
- Auto-invoking skills
- Python validation scripts

**What we keep** (already exists in `.gsd/`):
- ✅ All workflows (`.gsd/workflows/`)
- ✅ All templates (`.gsd/templates/`)
- ✅ Universal parallel processing (`.gsd/protocols/parallel.md`)
- ✅ Task coordination (`.gsd/lib/task-queue.md`)
- ✅ Validation scripts (`.scripts/validate.sh` and `.ps1`)

**Impact**: Low - All functionality exists in universal form

---

## Rationale for Decisions

### Why Delete Everything in `.kiro/`?

**User's Key Insight**: "No puede haber nada en una carpeta Kiro"

You're absolutely right. The `.kiro/` folder contradicts the gsd-universal vision:

1. **Slash commands** (`.kiro/commands/`) - Require Kiro IDE, cannot work universally
2. **Subagents** (`.kiro/agents/`) - Require Kiro's `invokeSubAgent`, contradicts Phase 1 universal parallel
3. **Skills** (`.kiro/skills/`) - Require Kiro's auto-invoke feature, cannot work universally
4. **Hooks** (`.kiro/hooks/`, `.kiro/scripts/`) - Require Kiro IDE, not using them anyway
5. **Steering** (`.kiro/steering/`) - Redundant, duplicates `.gsd/SYSTEM.md`

### All Functionality Already Exists Universally

| Kiro Feature | Universal Equivalent | Location |
|--------------|---------------------|----------|
| Slash commands (`/map`) | Workflows | `.gsd/workflows/map.md` |
| Subagents (context fork) | Task coordination | `.gsd/protocols/parallel.md` |
| Skills (templates) | Templates | `.gsd/templates/` |
| Hooks (validation) | Validation scripts | `scripts/validate.sh` and `.ps1` |
| Steering (system docs) | System docs | `.gsd/SYSTEM.md` |

### Why Not Keep as "Optional"?

**Original idea**: Move to `.gsd/optional/kiro/`

**Problem**: These aren't "optional optimizations" - they're **IDE dependencies**:
- They **require** Kiro IDE to work
- They **cannot** be made universal
- They **contradict** the gsd-universal vision

**Phase 5 "Optional Optimizations"** should be:
- Performance improvements
- Enhanced features that work universally
- NOT IDE-specific dependencies

### What About Kiro Users?

**They can still use GSD!** Just read workflows directly:
- Instead of `/map` → Read `.gsd/workflows/map.md`
- Instead of subagents → Use task coordination patterns
- Instead of skills → Use templates from `.gsd/templates/`

**Kiro IDE can still read `.gsd/` files** - No special `.kiro/` folder needed.

---

## Proposed New Structure

**Delete entire `.kiro/` directory**

No replacement needed - all functionality exists in `.gsd/`:

```
.gsd/
├── workflows/          # ✅ All 25 workflows (universal)
├── templates/          # ✅ All templates (universal)
├── protocols/          # ✅ Universal protocols (Phase 1)
│   ├── validation.md   # ✅ Replaces hooks validation
│   ├── parallel.md     # ✅ Replaces subagents
│   └── ...
├── lib/
│   ├── task-queue.md   # ✅ Universal task coordination
│   └── task-status.md  # ✅ Universal status tracking
└── ...

scripts/
├── validate.sh         # ✅ Universal validation (bash)
├── validate.ps1        # ✅ Universal validation (PowerShell)
└── ...
```

**Result**: Clean universal structure, zero IDE dependencies

---

## Migration Plan

### Simple: Delete `.kiro/` Directory

**Phase 1: Verify Universal Equivalents Exist**
- ✅ Workflows exist in `.gsd/workflows/` (25 files)
- ✅ Templates exist in `.gsd/templates/` (20+ files)
- ✅ Universal protocols exist (Phase 1 work)
- ✅ Validation scripts exist in `scripts/`

**Phase 2: Delete `.kiro/` Directory**
```bash
# Backup first (optional)
mv .kiro .kiro.backup

# Or delete directly
rm -rf .kiro
```

**Phase 3: Update Documentation**
- Update `.gsd/protocols/file-structure.md` (remove `.kiro/` references)
- Update `FILE-STRUCTURE-AUDIT.md` (mark as resolved)
- Update `KIRO-CONTENT-ANALYSIS.md` (mark as complete)

**Phase 4: Commit**
```bash
git add -A
git commit -m "refactor: remove .kiro/ directory - complete universal migration

- Deleted .kiro/ directory (IDE-specific dependencies)
- All functionality exists in universal form:
  - Workflows: .gsd/workflows/
  - Templates: .gsd/templates/
  - Protocols: .gsd/protocols/
  - Validation: scripts/validate.sh and .ps1
- Completes gsd-universal Phase 1 goal: zero IDE dependencies"
```

---

## Impact Assessment

### What We Lose

1. **Kiro IDE conveniences** (but not functionality):
   - Slash commands (`/map` → must read `.gsd/workflows/map.md`)
   - Subagent context savings (must use task coordination)
   - Auto-invoking skills (must use templates manually)
   - Python validation scripts (use shell validation instead)

### What We Keep (Already Universal)

1. **All workflows** - `.gsd/workflows/` (25 files)
2. **All templates** - `.gsd/templates/` (20+ files)
3. **Universal protocols** - `.gsd/protocols/` (Phase 1)
4. **Task coordination** - `.gsd/lib/task-queue.md`
5. **Validation** - `scripts/validate.sh` and `.ps1`
6. **Ralph Loop** - `loop.sh` and `loop.ps1` (Phase 2)

### What We Gain

1. **True universality** - Zero IDE dependencies
2. **Alignment with vision** - gsd-universal Phase 1 goal achieved
3. **Simplicity** - One source of truth (`.gsd/`)
4. **Portability** - Works identically everywhere
5. **No confusion** - Clear what's required vs optional

---

## Recommendation

**Delete entire `.kiro/` directory**

**Rationale**:
1. User is correct: "No puede haber nada en una carpeta Kiro"
2. All content is either IDE-specific or redundant
3. All functionality exists in universal form
4. Completes gsd-universal Phase 1 goal
5. True portability achieved

**Action Plan**:
1. Verify universal equivalents exist (✅ already done in Phase 1-2)
2. Delete `.kiro/` directory
3. Update documentation
4. Commit with clear message

**Result**: Clean universal GSD framework, zero IDE dependencies, works everywhere.

---

## User Decision

**Question**: Should we delete entire `.kiro/` directory?

**Your analysis was correct**: The content needs to be analyzed, and if it's GSD functionality, it should be integrated into universal structure. After analysis:

- ✅ **Workflows**: Already in `.gsd/workflows/` (universal)
- ✅ **Templates**: Already in `.gsd/templates/` (universal)
- ✅ **Protocols**: Already in `.gsd/protocols/` (Phase 1)
- ✅ **Validation**: Already in `scripts/` (universal)
- ❌ **Kiro-specific features**: Cannot be made universal (slash commands, subagents, skills, hooks)

**Conclusion**: Nothing in `.kiro/` needs to be migrated - it's all either redundant or IDE-specific.

**Recommendation**: Delete `.kiro/` directory entirely.

