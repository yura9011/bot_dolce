# Universal Ralph Loop - Build Mode

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
