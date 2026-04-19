---
description: Reference guide for all GSD workflow commands
---

# GSD Commands Reference

All commands work via natural language in Kiro chat.

## Core Workflow

### /gsd:new-project
Initialize new project with deep questioning
- Creates: PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md

### /gsd:map-codebase
Analyze existing codebase before starting
- Uses context-gatherer to understand architecture
- Creates: ARCHITECTURE.md

### /gsd:discuss-phase [N]
Capture implementation decisions before planning
- Creates: .gsd/planning/phase-{N}-CONTEXT.md

### /gsd:plan-phase [N]
Research and create atomic task plans
- Creates: .gsd/planning/phase-{N}-RESEARCH.md
- Creates: .gsd/planning/phase-{N}-{task}-PLAN.md

### /gsd:execute-phase [N]
Execute all plans for phase with verification
- Creates atomic git commits per task
- Creates: .gsd/summaries/phase-{N}-SUMMARY.md

### /gsd:verify-work [N]
Manual user acceptance testing
- Creates: .gsd/summaries/phase-{N}-UAT.md

### /gsd:complete-milestone
Archive milestone and tag release
- Creates git tag
- Updates ROADMAP.md

## Navigation

### /gsd:progress
Show current position and next steps

### /gsd:help
Show this command reference

## Phase Management

### /gsd:add-phase
Add new phase to end of roadmap

### /gsd:insert-phase [N]
Insert phase at position N

### /gsd:remove-phase [N]
Remove phase N from roadmap

## Session Management

### /gsd:pause-work
Save state for handoff

### /gsd:resume-work
Resume from last session

## Utilities

### /gsd:add-todo [description]
Capture idea for later

### /gsd:check-todos
List pending todos

### /gsd:debug [description]
Systematic debugging with state tracking
