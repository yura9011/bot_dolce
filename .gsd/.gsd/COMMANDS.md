# GSD Commands Reference

## Core Workflow (6 commands)

### `/new-project`
**Purpose**: Initialize new project with deep questioning
**Flow**:
1. Ask clarifying questions until vision is clear
2. Extract requirements (v1, v2, out of scope)
3. Create SPEC.md with status: DRAFT
4. Create initial ROADMAP.md with phases
5. Create STATE.md
6. Set SPEC.md status to FINALIZED

**Creates**: `SPEC.md`, `ROADMAP.md`, `STATE.md`

---

### `/map`
**Purpose**: Analyze existing codebase
**Flow**:
1. Scan project structure
2. Identify tech stack and patterns
3. Document architecture and conventions
4. Note concerns and technical debt

**Creates**: `ARCHITECTURE.md`
**Use before**: `/new-project` on existing codebases

---

### `/plan [N]`
**Purpose**: Create execution plans for phase N
**Flow**:
1. Read phase description from ROADMAP.md
2. Read CONTEXT.md if exists (from /discuss-phase)
3. Research implementation approaches
4. Create 2-3 atomic task plans
5. Verify plans against requirements

**Creates**: 
- `.planning/phase-N-RESEARCH.md`
- `.planning/phase-N-PLAN.md`

**Prerequisites**: SPEC.md must be FINALIZED

---

### `/execute [N]`
**Purpose**: Execute all plans for phase N
**Flow**:
1. Load all phase-N-PLAN.md files
2. Group tasks into waves by dependencies
3. Execute each wave (parallel where possible)
4. Create atomic commit per task
5. Verify against success criteria
6. Create summary

**Creates**: 
- `.summaries/phase-N-SUMMARY.md`
- Git commits

**Prerequisites**: Plans must exist for phase N

---

### `/verify [N]`
**Purpose**: Manual user acceptance testing
**Flow**:
1. Extract testable deliverables from phase
2. Present each deliverable for user testing
3. Collect pass/fail/issue feedback
4. For failures: diagnose and create fix plans
5. Document results

**Creates**: `.planning/phase-N-UAT.md`
**Note**: User-driven, requires interaction

---

### `/progress`
**Purpose**: Show current position
**Output**:
- Current milestone and phase
- Completed phases
- Next phase
- Active blockers
- Recent decisions

**Reads**: `ROADMAP.md`, `STATE.md`

---

## Phase Management (5 commands)

### `/discuss-phase [N]`
**Purpose**: Capture implementation decisions before planning
**Flow**:
1. Analyze phase requirements
2. Identify gray areas (UI, API, architecture)
3. Ask targeted questions per area
4. Document decisions and rationale

**Creates**: `.planning/phase-N-CONTEXT.md`
**Use before**: `/plan [N]`

---

### `/research-phase [N]`
**Purpose**: Deep technical research
**Flow**:
1. Identify research areas from phase
2. Investigate patterns, libraries, approaches
3. Document findings with examples
4. Recommend approach

**Creates**: `.planning/phase-N-RESEARCH.md`

---

### `/add-phase`
**Purpose**: Append phase to end of roadmap
**Flow**:
1. Ask for phase description
2. Add to ROADMAP.md
3. Update STATE.md

---

### `/insert-phase [N]`
**Purpose**: Insert urgent phase between existing phases
**Flow**:
1. Ask for phase description
2. Insert at position N
3. Renumber subsequent phases
4. Update all references

---

### `/remove-phase [N]`
**Purpose**: Remove future phase
**Flow**:
1. Verify phase is not started
2. Remove from ROADMAP.md
3. Renumber subsequent phases
4. Update STATE.md

---

## Milestone Management (3 commands)

### `/new-milestone [name]`
**Purpose**: Start next version
**Flow**:
1. Archive current milestone
2. Run /new-project flow for next milestone
3. Create fresh ROADMAP.md
4. Tag release

**Use after**: `/complete-milestone`

---

### `/complete-milestone`
**Purpose**: Archive completed milestone
**Flow**:
1. Verify all phases complete
2. Move files to `.archive/milestone-N/`
3. Create git tag
4. Update STATE.md

---

### `/audit-milestone`
**Purpose**: Review milestone quality
**Flow**:
1. Check all phases have summaries
2. Verify commits exist
3. Check for incomplete verifications
4. Report quality metrics

---

## Session Management (2 commands)

### `/pause`
**Purpose**: Save state for handoff
**Flow**:
1. Dump current context
2. Update STATE.md with position
3. List next steps
4. Create handoff document

**Creates**: `.handoff/YYYY-MM-DD-HH-MM.md`

---

### `/resume`
**Purpose**: Restore from last session
**Flow**:
1. Read latest handoff or STATE.md
2. Summarize position
3. Confirm next action with user

---

## Utilities (4 commands)

### `/add-todo [description]`
**Purpose**: Quick capture idea
**Flow**:
1. Create timestamped file
2. Add description
3. Confirm captured

**Creates**: `.todos/YYYY-MM-DD-HH-MM.md`

---

### `/check-todos`
**Purpose**: List pending todos
**Output**: All files in `.todos/` with summaries

---

### `/debug [description]`
**Purpose**: Systematic debugging
**Flow**:
1. Document issue
2. Gather evidence
3. Form hypothesis
4. Test hypothesis
5. If 3 failures: dump state, suggest fresh session

**Creates**: `.debug/issue-N.md`

---

### `/list-phase-assumptions`
**Purpose**: Surface planning assumptions
**Flow**:
1. Read phase plans
2. Extract implicit assumptions
3. Present for validation

---

## Command Usage Patterns

### Starting Fresh Project
```
/new-project
/discuss-phase 1
/plan 1
/execute 1
/verify 1
```

### Working on Existing Codebase
```
/map
/new-project
/discuss-phase 1
/plan 1
/execute 1
```

### Mid-Session Handoff
```
/pause
[Later...]
/resume
```

### Debugging Issues
```
/debug "Login fails with 401"
[If stuck after 3 attempts]
/pause
[Fresh session]
/resume
```

---

## Cross-Platform Notes

All commands work identically across:
- Kiro (Windows/Mac/Linux)
- Claude Code (Mac/Linux)
- Antigravity (All platforms)

File operations and git commands are platform-agnostic.
