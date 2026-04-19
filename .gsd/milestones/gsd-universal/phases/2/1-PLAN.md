---
phase: 2
plan: 1
wave: 1
milestone: gsd-universal
---

# Plan 2.1: Universal Ralph Protocol Definition

## Objective

Create the protocol specification for Universal Ralph Loop that works in any environment without CLI dependencies. This defines HOW Ralph works as a pure protocol using only markdown files, prompts, and standard shell commands.

## Context

- `.gsd/milestones/gsd-universal/MILESTONE.md` - Vision for pure protocol
- `DECISIONS.md` - Phase 2 architectural decisions
- `loop.sh` and `loop.ps1` - Current Ralph implementation (CLI-dependent)
- `PROMPT_build.md` and `PROMPT_plan.md` - Current prompt templates
- `.gsd/protocols/` - Universal protocol patterns established in Phase 1

## Tasks

<task type="auto">
  <name>Create Universal Ralph Protocol Document</name>
  <files>.gsd/protocols/ralph-loop.md</files>
  <action>
Create `.gsd/protocols/ralph-loop.md` that defines Ralph as a pure protocol:

**Core Principles:**
- No CLI dependencies (no kiro, claude, openai commands)
- Works with ANY AI assistant (ChatGPT web, Claude web, Kiro, terminal + copy-paste)
- File-based state management
- Standard shell commands only
- Cross-platform (bash + PowerShell)

**Protocol Structure:**
1. **Initialization**: How to start a Ralph session
2. **Iteration Cycle**: What happens each iteration
3. **State Management**: How state is tracked (files + git)
4. **Validation**: How to verify work (backpressure)
5. **Completion**: How to know when done
6. **Fallback Modes**: Manual execution when automation unavailable

**Key Sections:**
- Overview (what is Universal Ralph)
- Core Principles (from README.md pattern)
- Iteration Protocol (step-by-step)
- State Files (IMPLEMENTATION_PLAN.md, AGENTS.md, etc.)
- Prompt Templates (how they work)
- Execution Patterns (automated, semi-automated, manual)
- Integration with GSD workflows
- Success criteria

**Reference existing protocols:**
- See `.gsd/protocols/README.md` for core principles format
- See `.gsd/protocols/validation.md` for protocol structure pattern
- See `.gsd/protocols/parallel.md` for execution patterns

**Avoid:**
- Don't specify specific AI CLIs (must work without them)
- Don't require IDE-specific features
- Don't assume automation is available
  </action>
  <verify>test -f .gsd/protocols/ralph-loop.md && grep -q "Universal Ralph Loop Protocol" .gsd/protocols/ralph-loop.md</verify>
  <done>
- [ ] Protocol document exists at `.gsd/protocols/ralph-loop.md`
- [ ] Defines Ralph as pure protocol (no CLI dependencies)
- [ ] Includes initialization, iteration, state, validation, completion sections
- [ ] Provides manual fallback instructions
- [ ] References universal protocol patterns from Phase 1
  </done>
</task>

<task type="auto">
  <name>Create Universal Prompt Templates</name>
  <files>.gsd/templates/PROMPT_build.md, .gsd/templates/PROMPT_plan.md</files>
  <action>
Create universal prompt templates in `.gsd/templates/`:

**PROMPT_build.md template:**
- Remove all subagent references (invokeSubAgent is IDE-specific)
- Remove CLI-specific commands
- Focus on: read specs → implement → validate → commit
- Use file-based task tracking (IMPLEMENTATION_PLAN.md)
- Include manual verification steps
- Cross-platform shell commands only

**PROMPT_plan.md template:**
- Remove subagent references
- Focus on: analyze specs → update tasks → prioritize → commit
- Pure task planning (no implementation)
- File-based state management

**Key changes from current prompts:**
- Replace "use 500 parallel subagents" with "analyze thoroughly"
- Replace "invokeSubAgent" with "review files and make decisions"
- Add clear manual steps for environments without automation
- Emphasize file-based coordination
- Include validation commands (./scripts/validate.sh or .ps1)

**Structure:**
```markdown
# Universal Ralph Loop - Build Mode

## Context
Read these files to understand the project:
- specs/* - Project requirements
- IMPLEMENTATION_PLAN.md - Current tasks
- AGENTS.md - Operational procedures

## Iteration Protocol
1. Choose most important task from IMPLEMENTATION_PLAN.md
2. Search codebase for existing implementation
3. Implement or fix the functionality
4. Run validation: ./scripts/validate.sh --all
5. Run tests for affected code
6. Update IMPLEMENTATION_PLAN.md with progress
7. Commit: git commit -m "feat(phase-N): description"
8. Push: git push

## Validation (Backpressure)
Before marking complete:
- Run ./scripts/validate.sh --all (or .ps1 on Windows)
- All tests must pass
- No syntax errors
- Cross-platform compatibility verified

## State Management
- IMPLEMENTATION_PLAN.md tracks tasks
- AGENTS.md tracks operational procedures (keep brief)
- Git commits track progress
- Each iteration = fresh context

## Manual Mode
If automation unavailable:
1. Read the files listed in Context
2. Follow Iteration Protocol manually
3. Update files by hand
4. Run commands in terminal
5. Verify work before continuing
```
  </action>
  <verify>test -f .gsd/templates/PROMPT_build.md && test -f .gsd/templates/PROMPT_plan.md && ! grep -q "subagent" .gsd/templates/PROMPT_build.md</verify>
  <done>
- [ ] Universal PROMPT_build.md template created
- [ ] Universal PROMPT_plan.md template created
- [ ] No CLI-specific or IDE-specific dependencies
- [ ] Includes manual execution instructions
- [ ] Uses file-based state management
- [ ] Cross-platform validation commands included
  </done>
</task>

## Success Criteria

- [ ] Ralph Loop protocol defined as pure protocol (no CLI dependencies)
- [ ] Protocol document follows Phase 1 universal patterns
- [ ] Universal prompt templates created without IDE-specific features
- [ ] Manual execution mode documented for any environment
- [ ] File-based state management clearly specified
- [ ] Cross-platform compatibility maintained (bash + PowerShell)
