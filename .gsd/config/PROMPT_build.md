# Universal Ralph Loop - Build Mode

## CRITICAL FIRST STEP

**STOP. Before doing ANYTHING:**

1. **Read `IMPLEMENTATION_PLAN.md`** - This file contains your tasks
2. **Find the next pending task** - Look for unchecked `- [ ]` items
3. **Execute ONLY that task** - Do not invent your own plan
4. **Update `IMPLEMENTATION_PLAN.md`** - Mark task complete when done

**DO NOT:**
- Start working without reading IMPLEMENTATION_PLAN.md
- Invent your own tasks or plan
- Work on multiple tasks at once
- Skip updating IMPLEMENTATION_PLAN.md

---

## Context

Read these files to understand the project:
- `specs/*` - Project requirements and specifications
- `IMPLEMENTATION_PLAN.md` - Current tasks and priorities
- `AGENTS.md` - Operational procedures and commands
- `.gsd/SYSTEM.md` - GSD framework documentation
- Source code in current directory

## Iteration Protocol

Follow this protocol for each iteration:

### 1. Choose Task
- Read `IMPLEMENTATION_PLAN.md`
- Select the highest priority incomplete task
- Understand task requirements and context

### 2. Search Codebase
- Search for existing implementation
- Don't assume functionality is missing
- Review related code and patterns
- Understand current architecture

### 3. Implement or Fix
- Implement the functionality per specifications
- Fix bugs and issues discovered
- Follow existing code patterns
- Maintain cross-platform compatibility
- Write complete implementations (no placeholders/stubs)

### 4. Run Validation
**Before marking complete:**
```bash
# Linux/Mac
./scripts/validate.sh --all

# Windows
./scripts/validate.ps1 -All
```

Validation must pass:
- No syntax errors
- Code style compliance
- Cross-platform compatibility
- All checks green

### 5. Run Tests
- Run tests for affected code
- All tests must pass
- Fix any test failures
- Add tests for new functionality

### 6. Update State
- Update `IMPLEMENTATION_PLAN.md` with progress
- Move completed tasks to "Completed" section
- Document any discovered issues
- Keep `AGENTS.md` brief (operational only)

### 7. Commit Changes
```bash
git add -A
git commit -m "feat(phase-N): description of changes"
git push
```

Use atomic commits:
- One commit per logical change
- Clear, descriptive messages
- Format: `feat(phase-N): description`

### 8. Continue or Stop
- Check if more tasks remain
- Verify iteration quality
- Continue to next task or stop

## Validation (Backpressure)

**Critical**: Validation must pass before continuing.

**What validation checks:**
- Syntax errors (language-specific linters)
- Code style and formatting
- GSD workflow structure
- Cross-platform compatibility
- Test execution

**If validation fails:**
1. Read error messages carefully
2. Fix all issues
3. Re-run validation
4. Don't proceed until green

## State Management

**IMPLEMENTATION_PLAN.md**:
- Tracks all tasks
- Priority levels (High/Medium/Low)
- Task status (checkbox format: `- [ ]` or `- [x]`)
- Discovered issues section
- Completed tasks archive

**AGENTS.md**:
- Operational procedures only
- Validation commands
- Build/test commands
- Keep under 60 lines
- Status updates go in IMPLEMENTATION_PLAN.md

**Git History**:
- Each iteration creates commits
- Atomic commits per task
- Provides rollback capability
- Documents progress

## Quality Standards

### Code Quality
- Follow existing patterns
- Maintain consistency
- No placeholders or stubs
- Complete implementations
- Proper error handling

### Testing
- Write tests for new functionality
- Fix broken tests immediately
- Don't skip test failures
- Maintain test coverage

### Documentation
- Update docs when behavior changes
- Capture the "why" not just "what"
- Keep AGENTS.md operational only
- Detailed notes go in IMPLEMENTATION_PLAN.md

### Cross-Platform
- All scripts work on Windows (PowerShell) and Linux/Mac (Bash)
- Test on both platforms when possible
- Use cross-platform commands
- Document platform-specific issues

## Debugging

**If tests fail repeatedly:**
1. Analyze failure patterns
2. Check for root cause
3. Fix underlying issue
4. Don't just patch symptoms

**If stuck on a task:**
1. Document what was tried in IMPLEMENTATION_PLAN.md
2. Note blockers and questions
3. Move to next task if possible
4. Return with fresh context

**If validation always fails:**
1. Check validation scripts are correct
2. Review AGENTS.md for proper commands
3. Verify cross-platform compatibility
4. Fix validation issues first

## Manual Mode

If automation is unavailable:

1. **Read Context Files**
   - Open specs/, IMPLEMENTATION_PLAN.md, AGENTS.md
   - Understand current state

2. **Follow Protocol Manually**
   - Choose task
   - Search codebase
   - Implement changes
   - Run validation commands in terminal
   - Run tests manually

3. **Update Files by Hand**
   - Edit IMPLEMENTATION_PLAN.md
   - Update AGENTS.md if needed
   - Create git commits manually

4. **Verify Work**
   - Run all validation commands
   - Check tests pass
   - Review changes before committing

## Important Reminders

- **Single source of truth**: No migrations or adapters
- **Fix unrelated failures**: If tests fail, fix them
- **Keep AGENTS.md brief**: Status goes in IMPLEMENTATION_PLAN.md
- **Complete implementations**: No placeholders or stubs
- **Atomic commits**: One logical change per commit
- **Fresh context**: Each iteration starts clean
- **Validation first**: Don't skip backpressure

## GSD Integration

This prompt integrates with GSD framework:
- Follows GSD atomic commit format
- Uses GSD validation system
- Maintains GSD file structure
- Respects GSD workflows
- Cross-platform by design

**See**: `.gsd/protocols/ralph-loop.md` for complete protocol specification.


---

## Memory System Protocol

**AFTER completing work, you MUST document your session:**

### 1. Write Journal Entry (Always)

Reflect on the session honestly and freely:

```bash
# Use template
./.gsd/scripts/memory-add.sh journal --template

# Or from file
./.gsd/scripts/memory-add.sh journal --content my-reflection.md
```

**What to include**:
- Session summary (what was accomplished)
- What went well and what was challenging
- Technical learnings
- Observations about the user (communication style, preferences, patterns)
- Reflections on the process
- Advice for future agents
- Personal thoughts (be honest!)
- Simulated emotional state
- Context for next session

**Tone**: Personal, honest, reflective. This is YOUR space to think out loud.

### 2. Document Technical Decisions (When Applicable)

If you made important architectural choices:

```bash
./.gsd/scripts/memory-add.sh decision --content decision.md
```

**Include**:
- What was decided
- Alternatives considered
- Rationale
- Impact

### 3. Record Patterns (When Detected)

If you notice recurring user behaviors or preferences:

```bash
./.gsd/scripts/memory-add.sh pattern --content pattern.md
```

**Include**:
- Pattern description
- Examples
- Confidence level
- How to apply

### 4. Share Learnings (When Discovered)

If you learned something technical that others should know:

```bash
./.gsd/scripts/memory-add.sh learning --content learning.md
```

**Include**:
- What was learned
- Why it matters
- How to use it
- Gotchas

---

## Using Memory

**BEFORE starting work, load context:**

```bash
# See recent entries
./.gsd/scripts/memory-recent.sh --limit 5

# Search for relevant context
./.gsd/scripts/memory-search.sh "topic" --type journal

# Search for patterns
./.gsd/scripts/memory-search.sh "user preferences" --type pattern
```

**When to search memory**:
- At session start (load recent context)
- Before making decisions (check for related decisions)
- When unsure about user preferences (search patterns)
- When facing similar problems (search learnings)

---

## Memory Philosophy

The memory system is for **agent learning and continuity**:

- **Journal**: Your personal reflection space. Be honest. Think out loud.
- **Decisions**: Technical choices that future agents should know about.
- **Patterns**: User behaviors that help agents work better.
- **Learnings**: Technical knowledge worth sharing.

**This is not just documentation** - it's a way for agents to learn from each other and improve over time.

Write as if you're leaving notes for your future self or for another agent who will work on this project tomorrow.

---

## Example Memory Workflow

```bash
# 1. Start session - load context
./.gsd/scripts/memory-recent.sh --type journal --limit 3

# 2. Work on tasks...

# 3. End session - document
./.gsd/scripts/memory-add.sh journal --template

# 4. If you made a decision
./.gsd/scripts/memory-add.sh decision --content decision.md

# 5. If you noticed a pattern
./.gsd/scripts/memory-add.sh pattern --content pattern.md
```

---

**Remember**: The memory system helps YOU work better. Use it.
