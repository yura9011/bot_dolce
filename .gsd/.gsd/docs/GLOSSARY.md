# GSD Glossary

Quick reference for GSD terminology. If you see a term you don't understand, look it up here.

---

## Core Concepts

### GSD (Get Shit Done)
The framework itself. A context engineering methodology that makes AI coding reliable and consistent through structured workflows, state management, and validation.

### Workflow
A markdown file in `.gsd/workflows/` that defines a specific process. Examples: `/new-project`, `/plan`, `/execute`, `/verify`. Think of workflows as recipes - step-by-step instructions for common tasks.

### Protocol
A universal pattern that works in any environment. Protocols define HOW to do something without depending on specific tools. Examples: validation protocol, parallel processing protocol, Ralph Loop protocol.

### Phase
A chunk of work with a clear deliverable. Projects are broken into 3-5 phases per milestone. Each phase has its own planning, execution, and verification cycle.

### Milestone
A major version or release. Contains multiple phases. Example: "v1.0" milestone might have phases for foundation, core features, integration, and polish.

---

## Files

### SPEC.md
Project specification. Defines vision, goals, non-goals, users, constraints, and success criteria. Status must be "FINALIZED" before coding starts (Planning Lock).

### ROADMAP.md
Phase structure and progress tracking. Lists all phases, their objectives, requirements, and status. Updated as work progresses.

### STATE.md
Project memory. Tracks current position (milestone, phase, status), last session summary, next steps, and context for resuming work.

### IMPLEMENTATION_PLAN.md
Task tracker. Lists current tasks with priority levels (High/Medium/Low) and status (checkboxes). Updated during execution.

### ARCHITECTURE.md
System design document. Describes components, data flow, technology choices, and architectural decisions. Created during `/map` or `/new-project`.

### DECISIONS.md
Architecture Decision Records (ADRs). Documents important decisions, their context, alternatives considered, and rationale. Append-only log.

### JOURNAL.md
Session log. Records what happened in each work session. Useful for tracking progress and debugging issues.

### AGENTS.md
Operational procedures. Validation commands, build/test commands, project conventions, and emergency procedures. Keep brief (under 60 lines).

---

## Workflows

### /new-project
Initialize a new project through questioning, research (optional), requirements, and roadmap creation. The most leveraged moment in any project.

### /map
Analyze existing codebase to understand architecture. Creates ARCHITECTURE.md and infers SPEC.md. Use for brownfield projects.

### /plan N
Create execution plans for phase N. Breaks phase into concrete tasks with acceptance criteria. Creates `.gsd/phases/N/PLAN.md`.

### /execute N
Implement phase N using the plan. Can be manual (task by task) or automated (Ralph Loop). Creates atomic commits.

### /verify N
Validate phase N work with empirical evidence. Requires proof (screenshots, command output, test results). Creates VERIFICATION.md.

### /progress
Show current position in project. Displays milestone, phase, completed work, and next steps.

### /pause
Save state for session handoff. Documents current position, context, and next steps. Enables clean session transitions.

### /resume
Restore from last session. Loads context from STATE.md and continues work.

---

## Ralph Loop

### Ralph Loop
Autonomous execution protocol that coordinates AI work through iterative cycles. Named after Ralph Wiggum's "I'm helping!" Each iteration: show prompt → user executes AI → validate → commit → repeat.

### Iteration
One cycle of Ralph Loop. Includes prompt display, AI execution, validation, and git operations. Fresh context per iteration prevents context pollution.

### Build Mode
Ralph mode for implementing functionality. Uses PROMPT_build.md. Implements tasks from IMPLEMENTATION_PLAN.md, runs tests, creates commits.

### Plan Mode
Ralph mode for updating plans. Uses PROMPT_plan.md. Analyzes requirements, updates IMPLEMENTATION_PLAN.md, prioritizes tasks. No implementation work.

### Manual Mode
Ralph mode with no automation. Just displays prompts. User handles everything manually. Maximum flexibility.

### Dry Run
Setup validation mode. Checks required files exist, git is available, scripts are executable. Run before starting Ralph: `./loop.sh --dry-run`

---

## Principles

### Planning Lock
No code until SPEC.md status is "FINALIZED". Prevents building the wrong thing. Forces clear thinking before implementation.

### State Persistence
Update STATE.md after every significant action. Ensures memory across sessions. Enables clean handoffs and resumption.

### Context Hygiene
3 failures leads to state dump and fresh session. Prevents circular debugging and context pollution. Maintains quality.

### Empirical Validation
Every verification needs proof. Screenshots, command output, test results. No "it works on my machine" - show evidence.

### Atomic Commits
One commit per task. Clear commit messages. Format: `feat(phase-N): description`. Enables easy rollback and clear history.

### Fresh Context
Each Ralph iteration = new AI session. Prevents context pollution. Maintains consistent quality. Avoids degradation over time.

### Validation Backpressure
Validation runs after each iteration. Prevents bad code from accumulating. If validation fails, iteration is NOT complete.

---

## Technical Terms

### Brownfield
Existing project with code already written. Opposite of greenfield (new project). Most real-world projects are brownfield.

### Greenfield
New project starting from scratch. Clean slate. No existing code or constraints.

### Context Pollution
When AI conversation gets too long and AI starts making mistakes or forgetting earlier context. Solved by fresh context per iteration.

### Cross-Platform
Works on multiple operating systems (Windows, Mac, Linux). GSD scripts are cross-platform (bash + PowerShell).

### Universal
Works in any environment with any AI assistant. No IDE dependencies. No CLI dependencies. Pure protocol.

### Validation
Checking code quality through linters, tests, and compilation. Runs automatically in Ralph Loop. Provides backpressure.

### Backpressure
Validation that prevents moving forward until issues are fixed. If validation fails, iteration is not complete.

### ADR (Architecture Decision Record)
Document that records an important decision, its context, alternatives considered, and rationale. Stored in DECISIONS.md.

### Token
Unit of text for AI models. Roughly 4 characters = 1 token. Context windows are measured in tokens (e.g., 8K, 200K).

### Context Window
Maximum amount of text an AI can process at once. Different AIs have different limits (ChatGPT: ~8K, Claude: ~200K).

---

## Status Values

### Phase Status
- [NOT-STARTED] - Phase not begun
- [IN-PROGRESS] - Currently working on phase
- [COMPLETE] - Phase finished and verified
- [PAUSED] - Phase started but temporarily stopped
- [BLOCKED] - Phase cannot proceed (dependency issue)

### Task Status
- [ ] - Not started (unchecked checkbox)
- [x] - Complete (checked checkbox)
- [BLOCKED] - Cannot proceed
- [SKIP] - Intentionally skipped

### SPEC Status
- DRAFT - Still being refined
- FINALIZED - Ready for implementation (Planning Lock released)
- ARCHIVED - Old version, no longer active

---

## Conventions

### Workflow Naming
Workflows use slash notation: `/new-project`, `/plan`, `/execute`. This is just convention - workflows are markdown files in `.gsd/workflows/`.

### File Naming
- ALL_CAPS.md - Project-level files (SPEC.md, ROADMAP.md, STATE.md)
- lowercase.md - System files (.gsd/workflows/plan.md)
- phase-N-PLAN.md - Phase-specific files

### Commit Format
```
<type>(phase-N): <description>

<optional body>
```

Types: feat, fix, docs, chore, test, refactor

Examples:
- `feat(phase-1): add user authentication`
- `fix(phase-2): resolve database connection issue`
- `docs: update README with new workflows`

---

## Common Abbreviations

- **GSD** - Get Shit Done
- **ADR** - Architecture Decision Record
- **UAT** - User Acceptance Testing
- **MVP** - Minimum Viable Product
- **POC** - Proof of Concept
- **WIP** - Work In Progress
- **TBD** - To Be Determined
- **TBD** - To Be Done (context-dependent)

---

## Quick Reference

**Starting a project:**
1. Copy GSD files to your project
2. Run `./loop.sh --dry-run` to verify setup
3. Execute `/new-project` workflow
4. Run `/plan 1` to start first phase

**During development:**
1. `/plan N` - Create phase plan
2. `/execute N` - Implement phase
3. `/verify N` - Validate work
4. `/progress` - Check status

**Session management:**
1. `/pause` - Save state before stopping
2. `/resume` - Restore state when continuing

**Getting help:**
1. `/help` - List all workflows
2. Read workflow file: `cat .gsd/workflows/<name>.md`
3. Check this glossary for terms
4. Read TROUBLESHOOTING.md for issues

---

## Still Confused?

If a term isn't here or you need more explanation:
1. Check the workflow files in `.gsd/workflows/`
2. Read the protocol files in `.gsd/protocols/`
3. Look at examples in `.gsd/examples/`
4. Open an issue on GitHub

**Remember**: GSD is just structured markdown files + git + shell scripts. Nothing magical. If you can read markdown and run commands, you can use GSD.
