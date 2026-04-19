# Universal Ralph Loop Protocol

## Overview

The Universal Ralph Loop is a pure protocol for autonomous execution of GSD tasks that works in any environment with any AI assistant. Unlike traditional automation that requires specific CLIs, Ralph is a coordination protocol using only markdown files, git, and standard shell commands.

**Core Principles**: See `.gsd/protocols/README.md` for universal principles that apply to all protocols.

**Shell Patterns**: See `.gsd/examples/shell-patterns.md` for reusable code examples.

## What is Ralph Loop?

Ralph Loop is named after Ralph Wiggum's famous quote "I'm helping!" - it enables AI assistants to work autonomously through iterative execution cycles. Each iteration starts with fresh context, preventing context pollution and maintaining consistent quality.

**Key Insight**: Ralph is a PROTOCOL, not a tool. It defines HOW to coordinate AI work, not WHAT tool to use.

## Core Principles

### 1. No CLI Dependencies
- Works without kiro, claude, openai, or any AI CLI
- User executes AI manually (web chat, IDE, terminal)
- Scripts coordinate the process, don't execute AI

### 2. Universal Compatibility
- ChatGPT web interface
- Claude web interface
- Kiro IDE
- VS Code + Copilot
- Terminal + copy-paste to any AI
- Any future AI assistant

### 3. File-Based State
- IMPLEMENTATION_PLAN.md tracks tasks
- AGENTS.md tracks operational procedures
- Git commits track progress
- No external databases or services

### 4. Fresh Context Per Iteration
- Each iteration = new AI session
- Prevents context pollution
- Maintains consistent quality
- Avoids degradation over time

### 5. Validation Backpressure
- Validation runs after each iteration
- Prevents bad code from accumulating
- Cross-platform compatibility verified
- Tests must pass before continuing

## Initialization

### Prerequisites

**Required files:**
- `PROMPT_build.md` or `PROMPT_plan.md` - Iteration prompts
- `IMPLEMENTATION_PLAN.md` - Task tracker
- `AGENTS.md` - Operational procedures
- `specs/` - Project specifications
- `.gsd/` - GSD system directory

**Required tools:**
- Git (for version control)
- Bash or PowerShell (for scripts)
- Validation tools (language-specific linters)

**Optional tools:**
- AI CLI (kiro, claude, etc.) - for automated mode
- IDE integration - for enhanced experience

### Setup Validation

Run dry-run to validate setup:

```bash
# Bash
./loop.sh --dry-run

# PowerShell
./loop.ps1 -DryRun
```

This checks:
- Required files exist
- Git is available
- Validation scripts are executable
- Directory structure is correct

## Iteration Protocol

### Standard Iteration Cycle

Each Ralph iteration follows this protocol:

```
1. DISPLAY PROMPT
   ├─ Show iteration number (X/MAX)
   ├─ Show prompt file name
   └─ Display full prompt content

2. USER EXECUTES AI
   ├─ Copy prompt to AI assistant
   ├─ AI reads context files
   ├─ AI implements changes
   └─ AI updates state files

3. VALIDATION (Backpressure)
   ├─ Run ./scripts/validate.sh --all
   ├─ Check syntax errors
   ├─ Run tests
   └─ Verify cross-platform compatibility

4. GIT INTEGRATION
   ├─ Check for changes (git status)
   ├─ Prompt user to commit
   ├─ Create atomic commit
   └─ Push to remote (optional)

5. CONTINUE OR STOP
   ├─ Ask user to continue
   ├─ Check iteration limit
   └─ Loop or exit
```

### Execution Modes

**Build Mode** (`PROMPT_build.md`):
- Implement functionality from IMPLEMENTATION_PLAN.md
- Fix bugs and issues
- Run tests and validation
- Update task status
- Create atomic commits

**Plan Mode** (`PROMPT_plan.md`):
- Analyze project requirements
- Update IMPLEMENTATION_PLAN.md
- Prioritize tasks
- Identify dependencies
- No implementation work

**Manual Mode** (`--manual` flag):
- Just display prompts
- No automation at all
- User handles everything
- Maximum flexibility

## State Management

### State Files

**IMPLEMENTATION_PLAN.md**:
- Tracks current tasks
- Priority levels (High/Medium/Low)
- Task status (checkbox format)
- Discovered issues
- Completed tasks archive

**AGENTS.md**:
- Operational procedures
- Validation commands
- Build/test commands
- Emergency procedures
- Keep brief (under 60 lines)

**Git History**:
- Each iteration creates commits
- Atomic commits per task
- Format: `feat(phase-N): description`
- Provides rollback capability

### Session Logging

Ralph creates session logs:
```
.ralph/
└── session-{timestamp}.log
```

Logs include:
- Iteration numbers
- Validation results
- Git operations
- User decisions
- Errors and warnings

## Validation (Backpressure)

### Validation Protocol

After each iteration, run validation:

```bash
# Bash
./scripts/validate.sh --all

# PowerShell
./scripts/validate.ps1 -All
```

**Validation checks:**
- Code syntax (language-specific linters)
- GSD workflows (markdown structure)
- Cross-platform compatibility
- Test execution
- Git status

**Backpressure principle:**
If validation fails, iteration is NOT complete. Fix issues before continuing.

### Validation Fallbacks

**When tools unavailable:**
- Use manual verification checklists
- Basic syntax checks (compile attempts)
- Visual code review
- Test execution where possible

**See**: `.gsd/protocols/validation.md` for complete validation patterns.

## Completion Criteria

### When to Stop

Ralph iteration stops when:
1. **All tasks complete**: IMPLEMENTATION_PLAN.md has no pending tasks
2. **User decision**: User chooses to stop
3. **Iteration limit**: Reached MAX_ITERATIONS
4. **Validation failure**: Repeated failures indicate need for fresh approach

### Success Indicators

- [ ] All must-have tasks completed
- [ ] Validation passes
- [ ] Tests pass
- [ ] Git history clean
- [ ] Documentation updated
- [ ] Cross-platform compatibility verified

## Execution Patterns

### Pattern 1: Automated (With AI CLI)

**When available**: AI CLI installed (kiro, claude, etc.)

```bash
# Traditional automated Ralph
./loop.sh build

# Script executes AI CLI automatically
# User monitors progress
# Validation runs after each iteration
```

**Pros**: Fully autonomous, fast
**Cons**: Requires specific CLI, tool lock-in

### Pattern 2: Interactive (Universal)

**Works anywhere**: Any AI assistant

```bash
# Universal Ralph
./loop.sh build

# Script shows prompt
# User copies to AI (web, IDE, terminal)
# User confirms when done
# Script runs validation
```

**Pros**: Works with any AI, no tool dependencies
**Cons**: Requires user interaction

### Pattern 3: Manual (Maximum Flexibility)

**When needed**: Restricted environments

```bash
# Manual mode
./loop.sh --manual

# Script just displays prompts
# User handles everything manually
# No automation at all
```

**Pros**: Works in any environment
**Cons**: Most manual effort

## Integration with GSD Workflows

### Execute Workflow Integration

Ralph Loop can be used during `/execute` phase:

```markdown
## Option A: Manual Execution
Follow PLAN.md files manually, task by task.

## Option B: Ralph Loop (Automated)
Use Ralph to coordinate execution:
./loop.sh build
```

**See**: `.gsd/workflows/execute.md` for complete integration.

### Verify Workflow Integration

Ralph includes validation in each iteration:
- Runs after every change
- Prevents bad code accumulation
- Provides immediate feedback
- Maintains quality throughout

## Environment-Specific Adaptations

### Terminal + Web Chat
- Copy prompts from terminal
- Paste into ChatGPT/Claude web
- Copy AI responses back
- Run validation manually
- Commit changes manually

### IDE (Kiro, VS Code, etc.)
- Use IDE's integrated terminal
- Leverage IDE's AI features
- Use IDE's git integration
- Run validation in IDE terminal

### Automated (With CLI)
- Use AI CLI if available
- Fully autonomous execution
- Validation runs automatically
- Git operations automated

**See**: `.gsd/UNIVERSAL-SETUP.md` for detailed setup per environment.

## Troubleshooting

### Common Issues

**Issue**: Validation fails repeatedly
**Solution**: Stop Ralph, analyze failures, fix root cause, restart

**Issue**: Context pollution (AI making mistakes)
**Solution**: Fresh context per iteration prevents this

**Issue**: Git conflicts
**Solution**: Resolve manually, then continue Ralph

**Issue**: Missing dependencies
**Solution**: Run `--dry-run` to identify missing tools

### Emergency Procedures

**If Ralph fails repeatedly:**
1. Stop current session
2. Document issues in IMPLEMENTATION_PLAN.md
3. Review AGENTS.md for operational changes
4. Start fresh session with updated context

**If validation always fails:**
1. Check validation scripts are correct
2. Verify cross-platform compatibility
3. Review AGENTS.md for correct commands
4. Fix validation issues before continuing

## Success Criteria

This protocol succeeds when:
- Works with any AI assistant (web, IDE, terminal)
- No CLI dependencies required
- File-based state management
- Fresh context per iteration
- Validation backpressure working
- Cross-platform compatibility maintained
- Manual fallback available

**See also**: `.gsd/protocols/README.md` for common success criteria across all protocols.

## Further Reading

- `.gsd/templates/PROMPT_build.md` - Build mode prompt template
- `.gsd/templates/PROMPT_plan.md` - Plan mode prompt template
- `.gsd/protocols/validation.md` - Validation patterns
- `.gsd/examples/shell-patterns.md` - Shell script patterns
- `AGENTS.md` - Operational procedures
- `IMPLEMENTATION_PLAN.md` - Task tracking format
