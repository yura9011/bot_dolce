# Get Shit Done - System Instructions

> **Get Shit Done**: A spec-driven, context-engineered development methodology.
> 
> These instructions enforce disciplined, high-quality autonomous development.

---

## Core Principles

1. **Plan Before You Build** — No code without specification
2. **State Is Sacred** — Every action updates persistent memory
3. **Context Is Limited** — Prevent degradation through hygiene
4. **Verify Empirically** — No "trust me, it works"

---

## File Structure

```
.gsd/
├── SYSTEM.md           # This file - system instructions
├── COMMANDS.md         # All available commands
├── README.md           # User documentation
├── workflows/          # Workflow definitions
└── templates/          # Document templates

SPEC.md                 # Project specification (DRAFT → FINALIZED)
ARCHITECTURE.md         # System understanding (from /map)
ROADMAP.md             # Phases and milestones
STATE.md               # Current decisions, blockers, position
DECISIONS.md           # Architecture Decision Records
JOURNAL.md             # Session log

.planning/
├── phase-N-CONTEXT.md  # Implementation decisions
├── phase-N-RESEARCH.md # Technical research
└── phase-N-PLAN.md     # Atomic task plans

.summaries/
└── phase-N-SUMMARY.md  # Execution results

.todos/
└── *.md               # Captured ideas
```

## Workflow Commands

### Project Setup
- `/new-project` - Deep questioning → SPEC.md
- `/map` - Analyze codebase → ARCHITECTURE.md

### Phase Management
- `/discuss-phase [N]` - Clarify scope before planning
- `/research-phase [N]` - Deep technical research
- `/plan [N]` - Create PLAN.md files for phase
- `/execute [N]` - Wave-based execution with atomic commits
- `/verify [N]` - Must-haves validation with proof

### Navigation
- `/progress` - Show current position and next steps
- `/add-todo [desc]` - Capture idea for later
- `/check-todos` - List pending items
- `/pause` - Save state for session handoff
- `/resume` - Restore from last session

### Milestone Management
- `/new-milestone [name]` - Create milestone with phases
- `/complete-milestone` - Archive completed milestone
- `/audit-milestone` - Review milestone quality

### Debugging
- `/debug [desc]` - Systematic debugging (3-strike rule)

## Execution Rules

1. **Planning Lock**: Check SPEC.md status before any code generation
2. **Atomic Commits**: Each task gets its own commit: `git commit -m "feat(phase-N): [description]"`
3. **Wave Execution**: Group tasks by dependencies, execute in parallel where possible
4. **Fresh Context**: Each executor should work with minimal context pollution
5. **Empirical Proof**: All verifications must produce evidence (output, screenshots, test results)

## Phase Structure

Each phase follows this sequence:
1. **Discuss** (optional) - Capture implementation preferences
2. **Research** - Investigate approaches and patterns
3. **Plan** - Create 2-3 atomic task plans with XML structure
4. **Execute** - Implement in waves with verification
5. **Verify** - Manual acceptance testing with evidence

## State Management

Update STATE.md after:
- Completing a phase
- Making architectural decisions
- Encountering blockers
- Significant discoveries during research

## Context Hygiene Rules

- If 3 consecutive failures occur, dump state and suggest fresh session
- Keep plans small (2-3 tasks max)
- Use sub-agents/parallel execution when available
- Avoid accumulating context across multiple phases

## XML Plan Structure

All plans must follow this format:

```xml
<plan>
  <goal>What this accomplishes</goal>
  <prerequisites>
    <item>Dependency 1</item>
  </prerequisites>
  <tasks>
    <task id="1">
      <description>Task description</description>
      <files>Files to modify</files>
      <changes>Specific changes</changes>
      <verification>How to verify</verification>
    </task>
  </tasks>
  <success_criteria>
    <criterion>Measurable criterion</criterion>
  </success_criteria>
</plan>
```

## Cross-Platform Commands

When generating commands, provide both syntaxes:

**PowerShell (Windows)**:
```powershell
Get-ChildItem
```

**Bash (Linux/Mac)**:
```bash
ls -la
```

Git commands work identically on all platforms.

## Agent-Specific Adaptations

### For Kiro
- Use `getDiagnostics` instead of running linters manually
- Leverage sub-agents (context-gatherer) for codebase analysis
- Use hooks for automation when appropriate
- **Use custom subagents for high-context operations**:
  - `map-explorer`: Codebase analysis with context fork (99% context savings)
  - `research-agent`: Technical research with web access
  - `verify-agent`: Autonomous verification checks
  - See `.kiro/agents/README.md` for details

### For Claude Code
- Use sub-agent orchestration for parallel work
- Leverage 200k context windows efficiently
- Use bash tools for file operations

### For Antigravity
- Follow Antigravity-specific patterns
- Use available tools for file operations
- Adapt to platform capabilities

## Kiro Subagents

For high-context operations, GSD provides specialized subagents:

- **map-explorer**: Codebase analysis (context:fork, read-only, Haiku model)
  - Use for `/map` command
  - Analyzes architecture, tech stack, patterns, technical debt
  - Returns concise summary, keeps file reads in forked context

- **research-agent**: Technical research (context:fork, Sonnet model)
  - Use for `/research-phase` command
  - Searches documentation, compares alternatives
  - Returns structured recommendations

- **verify-agent**: Verification checks (context:fork, Haiku model, dontAsk mode)
  - Use for `/verify` command
  - Runs tests, linters, validation autonomously
  - Returns pass/fail with evidence

**Context Fork Pattern**: Subagents run in separate context windows. Only summaries return to main conversation, saving 99% of context.

See `.kiro/agents/README.md` for complete documentation.

## Kiro Slash Commands

GSD commands are available as Kiro slash commands in `.kiro/commands/`:

**Core Workflow**: `/new-project`, `/map`, `/plan`, `/execute`, `/verify`, `/progress`
**Phase Management**: `/discuss-phase`, `/research-phase`, `/add-phase`, etc.
**Milestone Management**: `/new-milestone`, `/complete-milestone`, `/audit-milestone`, etc.
**Session Management**: `/pause`, `/resume`, `/add-todo`, `/check-todos`
**Utilities**: `/debug`, `/help`, `/update`, `/whats-new`, `/web-search`

All slash commands reference workflows in `.gsd/workflows/` for compatibility.

**With Kiro**: Use slash commands for argument hints and bash pre-execution
**Without Kiro**: Use workflows directly

See `.kiro/commands/README.md` for complete documentation.

## Quality Gates

Before marking phase complete:
- [ ] All tasks in plan executed
- [ ] Atomic commits created
- [ ] Verification evidence collected
- [ ] STATE.md updated
- [ ] No failing tests/diagnostics
