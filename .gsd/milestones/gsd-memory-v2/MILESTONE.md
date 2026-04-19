# Milestone: gsd-memory-v2

> **Automatic Memory System + Clean File Structure**
> 
> Transform GSD into a self-documenting, context-aware framework with automatic memory and clean organization.

---

## Overview

**Goal**: Add automatic memory system for agent continuity and reorganize file structure for clarity.

**Status**: Planning  
**Start Date**: 2026-02-24  
**Target Date**: 2026-03-10  
**Priority**: High

---

## Problem Statement

### Current Issues

1. **Context Loss Between Sessions**
   - Agents don't remember previous decisions
   - Users must re-explain context every session
   - Inconsistent decisions across sessions
   - Lost knowledge when switching agents

2. **Cluttered Root Directory**
   - 23 files in root directory
   - Hard to find what you need
   - No clear organization
   - Confusing for new users

### Impact

- Wasted time re-explaining context
- Inconsistent architectural decisions
- Poor onboarding experience
- Framework feels disorganized

---

## Solution

### Part 1: Automatic Memory System

**Fully automatic, zero-friction memory for agents:**

- Auto-document decisions (no user approval needed)
- Auto-document problems and solutions
- Auto-load context at session start
- Auto-search before important decisions
- SQLite FTS5 for fast text search (no GPU needed)

### Part 2: Clean File Structure

**Reorganize into logical hierarchy:**

- Root: Only essentials (README, QUICKSTART, LICENSE)
- `.gsd/config/`: Agent configuration
- `.gsd/docs/`: Documentation
- `.gsd/state/`: Project state
- `.gsd/memory/`: Memory system (NEW)
- `.gsd/scripts/`: All executable scripts

---

## Phases

### Phase 1: File Structure Reorganization
**Goal**: Clean root directory, organize into `.gsd/`

**Tasks**:
- [ ] Create new directory structure
- [ ] Create migration script (migrate-structure.sh/ps1)
- [ ] Move files to new locations
- [ ] Update all script paths
- [ ] Update documentation references
- [ ] Create backward compatibility symlinks
- [ ] Test on all platforms (Windows/Linux/Mac)
- [ ] Update QUICKSTART.md with new structure

**Deliverables**:
- Clean root (5 files only)
- Organized `.gsd/` structure
- Migration scripts
- Updated documentation

### Phase 2: Memory System Foundation
**Goal**: Implement basic memory storage and indexing

**Tasks**:
- [ ] Create `.gsd/memory/` structure
- [ ] Implement memory-add.sh/ps1 (store entries)
- [ ] Implement memory-index.sh/ps1 (SQLite FTS5)
- [ ] Implement memory-search.sh/ps1 (query)
- [ ] Implement memory-recent.sh/ps1 (latest entries)
- [ ] Create memory entry templates
- [ ] Test indexing performance
- [ ] Document memory file formats

**Deliverables**:
- Memory storage system
- Search functionality
- Cross-platform scripts
- Documentation

### Phase 3: Agent Integration
**Goal**: Integrate memory into agent workflows

**Tasks**:
- [ ] Update PROMPT_build.md (auto-documentation protocol)
- [ ] Update PROMPT_plan.md (memory search protocol)
- [ ] Update loop.sh/ps1 (auto-load context)
- [ ] Update ralph.sh/ps1 (memory integration)
- [ ] Create memory workflow (.gsd/workflows/memory-*.md)
- [ ] Add memory commands to COMMANDS.md
- [ ] Test with real agent sessions
- [ ] Document agent memory usage

**Deliverables**:
- Agent auto-documentation
- Automatic context loading
- Memory workflows
- Usage documentation

### Phase 4: Testing & Documentation
**Goal**: Validate system and create comprehensive docs

**Tasks**:
- [ ] Test memory system across platforms
- [ ] Test with multiple agent types (Kiro, Claude, ChatGPT)
- [ ] Benchmark search performance
- [ ] Create memory system guide
- [ ] Create migration guide (v1 → v2)
- [ ] Update README.md
- [ ] Update QUICKSTART.md
- [ ] Create video tutorial (optional)

**Deliverables**:
- Tested system
- Complete documentation
- Migration guide
- Performance benchmarks

---

## Technical Design

### Memory Architecture

```
.gsd/memory/
├── auto/                          # Auto-generated entries
│   ├── 2026-02-24-14-30-decision-bash.md
│   ├── 2026-02-24-15-00-problem-pylint.md
│   └── 2026-02-24-16-00-phase-3-complete.md
├── index.db                       # SQLite FTS5 index
└── config.json                    # Memory configuration
```

### Memory Entry Types

1. **Decision** - Architectural decisions
2. **Problem** - Issues encountered
3. **Solution** - How problems were solved
4. **Context** - Phase/milestone context
5. **Phase-Complete** - Phase summaries

### Auto-Documentation Protocol

**Agent automatically documents:**
- Every significant decision
- Every problem encountered
- Every solution applied
- Every phase completion

**Agent automatically searches:**
- At session start (recent context)
- Before decisions (check consistency)
- When user asks questions (retrieve context)

### File Structure

```
/ (root - clean)
├── README.md
├── QUICKSTART.md
├── LICENSE
├── .gitignore
└── install.sh / .bat (symlinks)

.gsd/ (framework core)
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
├── memory/
│   ├── auto/
│   ├── index.db
│   └── config.json
├── scripts/
│   ├── install.sh/ps1
│   ├── update.sh/ps1
│   ├── loop.sh/ps1
│   ├── ralph.sh/ps1
│   ├── validate.sh/ps1
│   ├── memory-add.sh/ps1
│   ├── memory-search.sh/ps1
│   ├── memory-index.sh/ps1
│   └── memory-recent.sh/ps1
├── specs/
├── templates/
├── workflows/
├── protocols/
├── milestones/
└── VERSION
```

---

## Success Criteria

### Memory System
- [ ] Agent auto-documents decisions without prompting
- [ ] Agent auto-loads context at session start
- [ ] Agent searches memory before decisions
- [ ] Search returns results in <100ms
- [ ] Works on Windows, Linux, Mac
- [ ] No GPU or external APIs required

### File Structure
- [ ] Root has ≤5 files
- [ ] All framework files in `.gsd/`
- [ ] Backward compatibility maintained
- [ ] All scripts work with new structure
- [ ] Documentation updated
- [ ] Migration script works flawlessly

### User Experience
- [ ] Zero friction (fully automatic)
- [ ] Agents remember context across sessions
- [ ] Consistent decisions over time
- [ ] Easy to find files
- [ ] Clear organization

---

## Dependencies

### External
- SQLite (already installed on all platforms)
- Bash or PowerShell
- Git

### Internal
- gsd-universal milestone (complete)
- All existing scripts and workflows

---

## Risks & Mitigations

### Risk 1: Breaking Changes
**Impact**: High  
**Mitigation**: 
- Create migration script
- Maintain backward compatibility via symlinks
- Version bump to 2.0.0
- Clear migration guide

### Risk 2: Memory Overhead
**Impact**: Medium  
**Mitigation**:
- Use lightweight SQLite FTS5
- Benchmark on large projects
- Add cleanup/archival tools if needed

### Risk 3: Agent Adoption
**Impact**: Medium  
**Mitigation**:
- Make it fully automatic (no user action)
- Clear documentation in PROMPT files
- Test with multiple agent types

---

## Migration Path

### For Existing Projects

```bash
# 1. Backup current project
git commit -am "Backup before GSD v2 migration"

# 2. Run migration script
./.gsd/scripts/migrate-to-v2.sh

# 3. Verify structure
ls -la
ls -la .gsd/

# 4. Test scripts
./.gsd/scripts/validate.sh --all

# 5. Commit new structure
git add .
git commit -m "feat: migrate to GSD v2 (memory + clean structure)"
```

### Backward Compatibility

- Symlinks in root for common files
- Scripts auto-detect old vs new structure
- Gradual deprecation warnings
- Support both structures for 2-3 versions

---

## Timeline

**Week 1** (2026-02-24 to 2026-03-02):
- Phase 1: File structure reorganization
- Phase 2: Memory system foundation

**Week 2** (2026-03-03 to 2026-03-10):
- Phase 3: Agent integration
- Phase 4: Testing & documentation

**Total**: 2 weeks

---

## Next Steps

1. Review and approve this milestone
2. Create Phase 1 detailed plan
3. Begin implementation
4. Test incrementally
5. Document as we go

---

## Notes

- This is a major version bump (2.0.0)
- Breaking changes are acceptable with migration path
- Focus on automation (zero user friction)
- Maintain GSD universal principles (works everywhere)
