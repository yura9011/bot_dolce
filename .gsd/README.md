# Get Shit Done (GSD)

A portable, spec-driven development methodology for AI coding assistants.

## What is GSD?

GSD is a context engineering framework that makes AI coding reliable and consistent. It works with any AI coding assistant (Kiro, Claude Code, Antigravity, etc.) by providing structured workflows and state management.

## Why GSD?

**The Problem**: "Vibecoding" produces inconsistent results. You describe what you want, AI generates code, and you get garbage that falls apart.

**The Solution**: GSD forces planning before coding, maintains context across sessions, and verifies work empirically.

## Quick Start

### 1. Initialize a Project

```
/new-project
```

The AI will ask questions until it understands your vision, then create:
- `SPEC.md` - Your project specification
- `ROADMAP.md` - Phases to build
- `STATE.md` - Current position and decisions

### 2. Work Through Phases

For each phase in your roadmap:

```
/discuss-phase 1    # Capture implementation preferences (optional)
/plan 1             # Research and create execution plans
/execute 1          # Build it
/verify 1           # Test it
```

### 3. Repeat Until Done

```
/progress           # See where you are
/complete-milestone # Archive and tag release
/new-milestone      # Start next version
```

## Core Principles

1. **Planning Lock**: No code until SPEC.md is FINALIZED
2. **State Persistence**: Update STATE.md after every significant task
3. **Context Hygiene**: Keep context fresh, use sub-agents when available
4. **Empirical Validation**: Verify with evidence, not assumptions

## File Structure

```
.gsd/
├── SYSTEM.md          # System instructions (read this first)
├── COMMANDS.md        # All available commands
├── README.md          # This file
└── templates/         # File templates

SPEC.md                # Project specification
ARCHITECTURE.md        # Codebase understanding (from /map)
ROADMAP.md            # Phases and milestones
STATE.md              # Current decisions and position

.planning/
├── phase-N-CONTEXT.md   # Implementation decisions
├── phase-N-RESEARCH.md  # Technical research
└── phase-N-PLAN.md      # Execution plans

.summaries/
└── phase-N-SUMMARY.md   # Execution results

.todos/
└── *.md                 # Captured ideas
```

## Key Commands

| Command | Purpose |
|---------|---------|
| `/new-project` | Initialize with deep questioning |
| `/map` | Analyze existing codebase |
| `/plan [N]` | Create execution plans for phase |
| `/execute [N]` | Build the phase |
| `/verify [N]` | Test deliverables |
| `/progress` | Show current position |

See `.gsd/COMMANDS.md` for all 25 commands.

## Workflow Example

### Starting Fresh

```
You: /new-project

AI: Let me understand what you're building...
    [Deep questioning session]
    
    Created:
    - SPEC.md (FINALIZED)
    - ROADMAP.md (5 phases)
    - STATE.md

You: /plan 1

AI: Researching authentication approaches...
    Created:
    - .planning/phase-1-RESEARCH.md
    - .planning/phase-1-PLAN.md (2 tasks)

You: /execute 1

AI: Executing phase 1...
    ✓ Task 1 complete (commit: abc123)
    ✓ Task 2 complete (commit: def456)
    Created:
    - .summaries/phase-1-SUMMARY.md

You: /verify 1

AI: Let's verify the deliverables...
    ✓ Users can register
    ✓ Users can login
    ✓ Sessions persist
    
    Phase 1 verified!
```

### Working on Existing Code

```
You: /map

AI: Analyzing codebase...
    Created:
    - ARCHITECTURE.md

You: /new-project

AI: I see you have a React app with Express backend...
    [Questions focus on what you're adding]
```

## Agent-Specific Features

### Kiro
- Uses `getDiagnostics` for verification
- Leverages `context-gatherer` sub-agent for `/map`
- Can create hooks for automation

### Claude Code
- Uses sub-agent orchestration for parallel work
- Leverages 200k context windows
- Bash tools for file operations

### Antigravity
- Adapts to platform capabilities
- Uses available tools for operations

## Cross-Platform

All commands and files work identically across:
- Windows (PowerShell/CMD)
- macOS (Bash)
- Linux (Bash)

Git commands are platform-agnostic.

## Philosophy

**Complexity in the system, not in your workflow.**

Behind the scenes: context engineering, XML formatting, state management, verification protocols.

What you see: Simple commands that just work.

## Rules

1. **No code before SPEC.md is FINALIZED**
2. **Atomic commits per task**: `git commit -m "feat(phase-N): description"`
3. **Update STATE.md after significant decisions**
4. **3 failures = dump state and fresh session**
5. **All verifications require evidence**

## Getting Help

- Read `.gsd/SYSTEM.md` for detailed system instructions
- Read `.gsd/COMMANDS.md` for all available commands
- Use `/progress` to see where you are
- Use `/pause` and `/resume` for session handoffs

## Portability

GSD is designed to be portable:

1. **Share projects**: The entire `.gsd/` folder and root files (SPEC.md, ROADMAP.md, etc.) can be shared
2. **Switch agents**: Works with any AI coding assistant
3. **Version control**: All files are markdown, git-friendly
4. **No lock-in**: Plain text files, no proprietary formats

## License

MIT - Adapted from [glittercowboy/get-shit-done](https://github.com/glittercowboy/get-shit-done) and [toonight/get-shit-done-for-antigravity](https://github.com/toonight/get-shit-done-for-antigravity)

---

**Ready to get shit done?**

Start with: `/new-project`
