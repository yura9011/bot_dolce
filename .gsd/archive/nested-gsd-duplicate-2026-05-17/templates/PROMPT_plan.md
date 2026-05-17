# Universal Ralph Loop - Plan Mode

## Context

Read these files to understand the project:
- `specs/*` - Project requirements and specifications
- `IMPLEMENTATION_PLAN.md` - Current task state and priorities
- `.gsd/ROADMAP.md` - Phase definitions and milestones
- `.gsd/STATE.md` - Current project position
- Source code structure (for understanding what's implemented)

## Iteration Protocol

Follow this protocol for planning iterations:

### 1. Analyze Current State
- Read `IMPLEMENTATION_PLAN.md` thoroughly
- Understand completed tasks
- Identify pending tasks
- Review discovered issues
- Check task priorities

### 2. Review Specifications
- Read `specs/*` for requirements
- Compare specs to current tasks
- Identify missing tasks
- Find gaps in coverage
- Understand dependencies

### 3. Update Task List
**Add new tasks:**
- Discovered during analysis
- Missing from current plan
- Required by specifications
- Dependencies identified

**Update existing tasks:**
- Adjust priorities (High/Medium/Low)
- Clarify descriptions
- Add dependencies
- Update status if needed

**Move completed tasks:**
- From active list to "Completed Tasks" section
- Maintain checkbox format
- Keep for reference

### 4. Prioritize Tasks
**Priority guidelines:**
- **High**: Blockers, critical functionality, dependencies for other tasks
- **Medium**: Important features, improvements, refactoring
- **Low**: Nice-to-haves, optimizations, future enhancements

**Consider:**
- Dependencies between tasks
- Foundation tasks first
- Critical path items
- User impact

### 5. Document Issues
**In "Discovered Issues" section:**
- Bugs found during analysis
- Gaps in specifications
- Technical debt identified
- Blockers and risks

### 6. Commit Changes
```bash
git add IMPLEMENTATION_PLAN.md
git commit -m "plan: update task priorities and add new tasks"
git push
```

### 7. Continue or Stop
- Check if more analysis needed
- Verify plan completeness
- Continue or stop iteration

## Planning Guidelines

### Task Descriptions
- **Specific**: Clear, actionable items
- **Measurable**: Can verify completion
- **Achievable**: Realistic scope
- **Relevant**: Aligned with specs
- **Time-bound**: Reasonable effort

### Task Format
```markdown
- [ ] Task name (Priority: High/Medium/Low)
  - Description of what needs to be done
  - Dependencies: Task X, Task Y
  - Acceptance criteria
```

### Dependency Management
- Identify task dependencies
- Order tasks by dependency chain
- Foundation tasks before dependent tasks
- Document blocking relationships

### Scope Management
- Keep tasks focused and atomic
- Break large tasks into smaller ones
- One clear objective per task
- Avoid scope creep

## State Management

**IMPLEMENTATION_PLAN.md Structure:**
```markdown
# Implementation Plan

## High Priority Tasks
- [ ] Task 1
- [ ] Task 2

## Medium Priority Tasks
- [ ] Task 3

## Low Priority Tasks
- [ ] Task 4

## Discovered Issues
- Issue 1: Description
- Issue 2: Description

## Completed Tasks
- [x] Task A
- [x] Task B
```

**Maintain:**
- Clear priority sections
- Checkbox format for all tasks
- Discovered issues section
- Completed tasks archive
- Brief, actionable descriptions

## Quality Standards

### Planning Quality
- All tasks align with specifications
- Dependencies clearly identified
- Priorities make sense
- Descriptions are actionable
- No duplicate tasks

### Completeness
- All spec requirements covered
- No gaps in functionality
- Edge cases considered
- Testing tasks included
- Documentation tasks included

### Maintainability
- Easy to understand
- Clear structure
- Consistent format
- Up-to-date status
- Clean organization

## Manual Mode

If automation is unavailable:

1. **Read Files Manually**
   - Open specs/ directory
   - Read IMPLEMENTATION_PLAN.md
   - Review ROADMAP.md and STATE.md

2. **Analyze Manually**
   - Compare specs to tasks
   - Identify gaps
   - Determine priorities
   - Note dependencies

3. **Update File by Hand**
   - Edit IMPLEMENTATION_PLAN.md directly
   - Add/update/move tasks
   - Maintain format
   - Keep organized

4. **Commit Manually**
   - Save changes
   - Run git commands in terminal
   - Push to remote

## Important Reminders

- **Planning only**: No implementation in plan mode
- **Preserve existing tasks**: Update, don't replace
- **Maintain format**: Keep checkbox structure
- **Consider dependencies**: Foundation first
- **Align with specs**: All tasks from requirements
- **Keep brief**: Concise, actionable descriptions
- **Document gaps**: Note spec inconsistencies
- **Fresh context**: Each iteration starts clean

## Scope Boundaries

**Plan mode DOES:**
- Analyze requirements
- Update task list
- Prioritize tasks
- Identify dependencies
- Document issues
- Organize work

**Plan mode DOES NOT:**
- Implement functionality
- Write code
- Run tests
- Fix bugs
- Modify source files
- Execute validation

## GSD Integration

This prompt integrates with GSD framework:
- Follows GSD planning patterns
- Uses GSD file structure
- Maintains GSD conventions
- Respects GSD workflows
- Atomic commits for planning

**See**: `.gsd/protocols/ralph-loop.md` for complete protocol specification.
