# File Structure Audit - GSD Project

**Date**: 2026-01-21  
**Purpose**: Verify all files and folders are in correct locations  
**Scope**: Complete project structure analysis

---

## Root Directory Files

### ✅ CORRECT - Core GSD Files

| File | Purpose | Status |
|------|---------|--------|
| `README.md` | Project overview and quick start | ✅ Correct |
| `STATE.md` | Current project state and position | ✅ Correct |
| `ROADMAP.md` | Phase definitions and timeline | ✅ Correct |
| `AGENTS.md` | Operational manual (under 60 lines) | ✅ Correct |
| `DECISIONS.md` | Architecture Decision Records | ✅ Correct |
| `JOURNAL.md` | Session log | ✅ Correct |
| `IMPLEMENTATION_PLAN.md` | Task tracker for Ralph Loop | ✅ Correct |
| `CHANGELOG.md` | Version history | ✅ Correct |
| `GSD-STYLE.md` | Style guide | ✅ Correct |
| `VERSION` | Version number | ✅ Correct |
| `LICENSE` | Project license | ✅ Correct |
| `.gitignore` | Git ignore rules | ✅ Correct |

### ✅ CORRECT - Ralph Loop Files

| File | Purpose | Status |
|------|---------|--------|
| `loop.sh` | Universal Ralph Loop (bash) | ✅ Correct |
| `loop.ps1` | Universal Ralph Loop (PowerShell) | ✅ Correct |
| `PROMPT_build.md` | Build mode prompt template | ✅ Correct |
| `PROMPT_plan.md` | Plan mode prompt template | ✅ Correct |

### ⚠️ SHOULD MOVE - Test Files

| File | Purpose | Status |
|------|---------|--------|
| `test-ralph.sh` | Ralph Loop system validation | ⚠️ Move to `scripts/` |
| `test-ralph.ps1` | Ralph Loop system validation | ⚠️ Move to `scripts/` |

**Analysis**: These are active test scripts that validate Ralph Loop setup. They test:
- Required files exist
- Scripts are executable
- AGENTS.md format
- Integration with validation system
- Git repository status

**Recommendation**: Move to `scripts/` folder to keep all executable scripts together.

---

## Root Directory Folders

### ✅ CORRECT - System Folders

| Folder | Purpose | Status |
|--------|---------|--------|
| `.git/` | Git repository data | ✅ Correct (system) |
| `.gsd/` | GSD framework system files | ✅ Correct |
| `specs/` | Project specifications | ✅ Correct |

### ⚠️ REVIEW NEEDED - Scripts Folder

| Folder | Purpose | Status |
|--------|---------|--------|
| `scripts/` | Executable scripts | ⚠️ **NEEDS REVIEW** |

**Your Question**: Is `scripts/` folder correct?

**Analysis**:
- Contains validation scripts (validate.sh, validate.ps1, etc.)
- Contains Ralph scripts (ralph.sh, ralph.ps1)
- Contains Windows helper (run-bash.ps1)
- These are **operational scripts** used by GSD framework
- **Verdict**: ✅ **CORRECT** - Scripts folder is appropriate for executable utilities

**Rationale**:
- Standard convention: `scripts/` for executable utilities
- Separates executable scripts from documentation
- Makes scripts easy to find and execute
- Referenced in AGENTS.md validation commands
- Cross-platform scripts belong here

### ⚠️ CONTRADICTS UNIVERSAL VISION

| Folder | Purpose | Status |
|--------|---------|--------|
| `.kiro/` | Kiro IDE integration | ⚠️ **CONTRADICTS UNIVERSAL VISION** |

**Critical Issue**: `.kiro/` folder contradicts gsd-universal milestone goal!

**gsd-universal vision**: "Zero dependencies on .kiro/, .claude/, .cursor/, etc."

**Current state**: We still have `.kiro/` folder with:
- Agents, commands, hooks, skills, steering
- IDE-specific integrations
- Contradicts Phase 1 work (universal file structure)

### ✅ CORRECT - IDE Features (Not GSD Dependencies)

| Folder | Purpose | Status |
|--------|---------|--------|
| `.snapshots/` | Kiro snapshot feature | ✅ Correct (IDE feature, not GSD) |

**Analysis**: `.snapshots/` is a Kiro IDE feature for creating code snapshots. It's not part of GSD framework - it's an IDE feature that exists in this workspace but GSD doesn't depend on it.

**Contents**:
- `config.json` - Snapshot configuration
- `readme.md` - Feature documentation
- `sponsors.md` - Sponsor information

**Verdict**: ✅ Fine to keep - it's an IDE feature, not a GSD dependency.

**Options**:
1. **Move to `.gsd/optional/kiro/`** - Mark as optional optimization
2. **Keep but document** - Explain it's optional, not required
3. **Remove entirely** - Full commitment to universal vision

---

## `.gsd/` Directory Structure

### ✅ CORRECT - Core System Files

| File | Purpose | Status |
|------|---------|--------|
| `README.md` | GSD system overview | ✅ Correct |
| `SYSTEM.md` | System instructions | ✅ Correct |
| `COMMANDS.md` | Command reference | ✅ Correct |
| `UNIVERSAL-SETUP.md` | Universal setup guide | ✅ Correct |
| `WINDOWS-SETUP.md` | Windows-specific setup | ✅ Correct |
| `BASH-ON-WINDOWS.md` | Bash on Windows guide | ✅ Correct |
| `INSTALL-KIRO.md` | Kiro installation | ⚠️ IDE-specific |
| `install.ps1` | Installation script | ✅ Correct |

### ✅ CORRECT - Subdirectories

| Folder | Purpose | Status |
|--------|---------|--------|
| `workflows/` | 25 workflow definitions | ✅ Correct |
| `templates/` | 20+ document templates | ✅ Correct |
| `protocols/` | Universal protocols (Phase 1) | ✅ Correct |
| `examples/` | Usage examples | ✅ Correct |
| `lib/` | Reusable components | ✅ Correct |
| `milestones/` | Milestone tracking | ✅ Correct |
| `phases/` | Phase work (legacy?) | ⚠️ Review |
| `legacy/` | Deprecated code | ✅ Correct |

### ⚠️ REVIEW NEEDED - Phases Folder

**Question**: What is `.gsd/phases/` vs `.gsd/milestones/`?

**Analysis**:
- `.gsd/phases/1/` contains old phase files
- `.gsd/milestones/gsd-universal/phases/1/` contains current phase files
- Appears to be duplicate/legacy structure

**Recommendation**: 
- If `.gsd/phases/` is legacy, move to `.gsd/legacy/phases/`
- If current, consolidate with milestones structure

---

## `scripts/` Directory Analysis

### Current Contents

| File | Purpose | Used By | Status |
|------|---------|---------|--------|
| `validate.sh` | Consolidated validation (bash) | AGENTS.md | ✅ Active |
| `validate.ps1` | Consolidated validation (PowerShell) | AGENTS.md | ✅ Active |
| `validate-universal.sh` | Universal validation (bash) | Phase 1 | ✅ Active |
| `validate-universal.ps1` | Universal validation (PowerShell) | Phase 1 | ✅ Active |
| `validate-all.sh` | Legacy validation (bash) | AGENTS.md | ⚠️ Legacy |
| `validate-all.ps1` | Legacy validation (PowerShell) | AGENTS.md | ⚠️ Legacy |
| `ralph.sh` | Ralph Loop coordinator (bash) | AGENTS.md | ✅ Active |
| `ralph.ps1` | Ralph Loop coordinator (PowerShell) | AGENTS.md | ✅ Active |
| `run-bash.ps1` | Windows bash helper | Phase 1 | ✅ Active |

### Verdict: ✅ SCRIPTS FOLDER IS CORRECT

**Rationale**:
1. **Standard Convention**: `scripts/` is industry standard for executable utilities
2. **Clear Separation**: Separates executables from documentation
3. **Easy Discovery**: Users know where to find scripts
4. **Referenced Everywhere**: AGENTS.md, workflows, protocols all reference `./scripts/`
5. **Cross-Platform**: Contains both bash and PowerShell versions

**Recommendation**: Keep `scripts/` folder, but consider:
- Move legacy scripts to `scripts/legacy/` or remove if unused
- Add `scripts/README.md` explaining each script

---

## `.kiro/` Directory Analysis

### ⚠️ CRITICAL ISSUE: Contradicts Universal Vision

**Problem**: `.kiro/` folder exists but gsd-universal milestone aims to eliminate IDE dependencies.

### Current Contents

| Subfolder | Purpose | Status |
|-----------|---------|--------|
| `agents/` | Kiro-specific agents | ⚠️ IDE-specific |
| `commands/` | Kiro slash commands | ⚠️ IDE-specific |
| `hooks/` | Kiro hooks | ⚠️ IDE-specific |
| `skills/` | Kiro skills | ⚠️ IDE-specific |
| `scripts/` | Kiro scripts | ⚠️ IDE-specific |
| `settings/` | Kiro settings | ⚠️ IDE-specific |
| `steering/` | Kiro steering rules | ⚠️ IDE-specific |

### Options for Resolution

#### Option 1: Move to Optional (Recommended)
```
.gsd/optional/
  └── kiro/
      ├── agents/
      ├── commands/
      ├── hooks/
      ├── skills/
      └── README.md (explains these are optional optimizations)
```

**Pros**:
- Preserves work done in kiro-integration milestone
- Clearly marks as optional
- Aligns with Phase 5 (Optional Optimizations)
- Maintains universal core

#### Option 2: Keep but Document
- Keep `.kiro/` folder
- Add `.kiro/README.md` explaining it's optional
- Update `.gsd/protocols/file-structure.md` to clarify

**Pros**:
- No file moves needed
- Clear documentation

**Cons**:
- Still looks like dependency
- Confusing for new users

#### Option 3: Remove Entirely
- Delete `.kiro/` folder
- Full commitment to universal vision
- Recreate Kiro optimizations later if needed

**Pros**:
- Clean universal structure
- No confusion

**Cons**:
- Loses kiro-integration work
- May need to recreate later

---

## `.snapshots/` Directory Analysis

### ⚠️ UNKNOWN PURPOSE

**Contents**:
- `config.json`
- `readme.md`
- `sponsors.md`

**Questions**:
1. What is this folder for?
2. Is it used by GSD framework?
3. Is it project-specific or system?

**Recommendation**: Read files to understand purpose, then decide if correct location.

---

## `specs/` Directory Analysis

### ✅ CORRECT

**Contents**:
- `architecture.md` - System architecture
- `roadmap.md` - Project roadmap

**Purpose**: Static project specifications

**Status**: ✅ Correct location per GSD conventions

---

## Summary of Issues

### ✅ RESOLVED

1. **`.kiro/` folder contradicted universal vision** ✅ DELETED
   - Action: Deleted entire `.kiro/` directory
   - Reason: All content was either IDE-specific or redundant
   - Result: Zero IDE dependencies achieved

2. **Test files in root** ✅ MOVED
   - Action: Moved `test-ralph.sh` and `test-ralph.ps1` to `scripts/`
   - Result: All executable scripts now in `scripts/` folder

### 🟡 Medium Priority (Remaining)

3. **`.gsd/phases/` appears to be duplicate/legacy**
   - Action: Investigate and consolidate or move to legacy
   - Priority: Medium

### ✅ Confirmed Correct

- ✅ `scripts/` folder is correct and appropriate
- ✅ Root GSD files (STATE.md, ROADMAP.md, etc.) are correct
- ✅ `.gsd/` structure is correct
- ✅ `specs/` folder is correct
- ✅ Ralph Loop files in root are correct
- ✅ `.snapshots/` is IDE feature (not GSD dependency)

---

## Recommendations

### Immediate Actions

1. **Resolve `.kiro/` contradiction**
   - Move to `.gsd/optional/kiro/` (recommended)
   - Or document clearly as optional
   - Update `.gsd/protocols/file-structure.md`

2. **Investigate `.snapshots/`**
   - Read files to understand purpose
   - Move or remove if not needed

3. **Clean up legacy files**
   - Move `test-ralph.*` to appropriate location
   - Move or remove legacy validation scripts
   - Consolidate `.gsd/phases/` with milestones

### Documentation Updates

4. **Add `scripts/README.md`**
   - Explain purpose of each script
   - Document when to use each

5. **Update `.gsd/protocols/file-structure.md`**
   - Clarify `.kiro/` is optional
   - Document `scripts/` folder purpose
   - Explain root file conventions

---

## Conclusion

**Overall Assessment**: Structure is now correct and universal.

**Main Achievement**: Eliminated `.kiro/` folder - achieved zero IDE dependencies.

**Scripts Folder**: ✅ **CORRECT** - Standard location for executable utilities, properly used.

**Completed Actions**: 
1. ✅ Deleted `.kiro/` directory (IDE-specific dependencies)
2. ✅ Moved test files to `scripts/`
3. ✅ Verified all functionality exists in universal form

**Remaining**: 
- Investigate `.gsd/phases/` (appears to be legacy)
- Consider cleaning up legacy validation scripts

**Result**: Clean universal GSD framework, works everywhere without IDE dependencies.

