---
description: Ad-hoc tasks without full planning - for bug fixes, small features, and one-off tasks
---

# Quick Mode - Ad-hoc Tasks Without Full Planning

**Use for**: Bug fixes, small features, config changes, one-off tasks that don't need full phase planning.

---

## When to Use Quick Mode

**Use Quick Mode when**:
- Fixing a bug
- Making a small change
- Updating configuration
- Adding a simple feature
- Refactoring a single file
- Updating documentation

**Don't use Quick Mode when**:
- Building a new feature (use `/plan` instead)
- Making architectural changes
- Touching multiple systems
- Unsure of scope (plan first)

**Rule of thumb**: If it takes more than 1 hour, it's not a quick task.

---

## Process

### Step 1: Describe the Task

Tell your AI what needs to be done:

```
I need to make a quick change:
[Describe the task clearly]

Please help me:
1. Understand what needs to change
2. Make the changes
3. Verify it works
4. Commit atomically
```

**Example**:
```
I need to fix a bug where the login button doesn't work on mobile.

Please help me:
1. Identify the issue
2. Fix the button
3. Test on mobile viewport
4. Commit the fix
```

### Step 2: AI Investigates

AI will:
- Read relevant files
- Understand the issue
- Identify what needs to change
- Propose a solution

**You review and approve the approach.**

### Step 3: AI Implements

AI makes the changes:
- Edits files
- Follows existing conventions
- Keeps changes minimal
- Adds tests if needed

### Step 4: Validate

Run validation to ensure nothing broke:

**Windows**:
```powershell
./scripts/validate.ps1 -All
```

**Mac/Linux**:
```bash
./scripts/validate.sh --all
```

**If validation fails**: Fix issues before committing.

### Step 5: Test Manually

Test the actual functionality:
- Does the bug fix work?
- Does the feature work as expected?
- Did anything else break?

**If issues found**: Ask AI to fix them.

### Step 6: Commit

Commit with descriptive message:

```bash
git add -A
git commit -m "fix: Login button not working on mobile

- Adjusted button size for mobile viewport
- Added touch-friendly padding
- Tested on iOS and Android"
```

**Commit format**: `type: description`
- `fix:` - Bug fixes
- `feat:` - New features
- `refactor:` - Code refactoring
- `docs:` - Documentation
- `chore:` - Maintenance tasks
- `test:` - Adding tests

---

## Quick Mode with Ralph Loop

You can also use Ralph Loop for quick tasks:

### Step 1: Create Quick Plan

Create a simple `IMPLEMENTATION_PLAN.md`:

```markdown
# Quick Task: Fix Login Button on Mobile

## Task
- [ ] Fix login button not working on mobile viewport

## Success Criteria
- Button is clickable on mobile
- Button has proper touch target size
- No layout issues on small screens

## Verification
- Test on mobile viewport
- Validation passes
- No regressions
```

### Step 2: Run Ralph Loop

```bash
# Interactive mode
./loop.sh

# Or automated mode
./loop.sh --auto
```

Ralph will:
1. Read the plan
2. Execute the task
3. Validate changes
4. Commit if validation passes

### Step 3: Verify

Test the fix manually and verify it works.

---

## Examples

### Example 1: Bug Fix

**Task**: Fix typo in error message

**Process**:
```
AI: I need to fix a typo in the error message.
    File: src/lib/errors.ts
    Line 45: "Occured" should be "Occurred"

1. Find the file
2. Fix the typo
3. Commit
```

**Commit**:
```bash
git commit -m "fix: Correct typo in error message

Changed 'Occured' to 'Occurred' in src/lib/errors.ts"
```

### Example 2: Add Configuration

**Task**: Add new environment variable

**Process**:
```
AI: I need to add a new environment variable for API timeout.

1. Add TIMEOUT_MS to .env.example
2. Update config.ts to read the variable
3. Add default value (5000ms)
4. Update documentation
5. Commit
```

**Commit**:
```bash
git commit -m "feat: Add configurable API timeout

- Add TIMEOUT_MS environment variable
- Default to 5000ms if not set
- Update .env.example and docs"
```

### Example 3: Refactor Function

**Task**: Extract repeated code into utility function

**Process**:
```
AI: I see repeated date formatting code in 3 places.

1. Create formatDate utility in src/lib/utils.ts
2. Replace repeated code with utility calls
3. Add tests for utility
4. Commit
```

**Commit**:
```bash
git commit -m "refactor: Extract date formatting to utility

- Create formatDate function in utils.ts
- Replace 3 instances of repeated code
- Add unit tests"
```

### Example 4: Update Documentation

**Task**: Add missing API documentation

**Process**:
```
AI: I need to document the new API endpoint.

1. Add endpoint to API.md
2. Include request/response examples
3. Document error codes
4. Commit
```

**Commit**:
```bash
git commit -m "docs: Document new user profile endpoint

- Add GET /api/users/:id documentation
- Include request/response examples
- Document error codes"
```

---

## Quick Mode Best Practices

### 1. Keep It Small

If the task grows beyond 1 hour, stop and create a proper phase plan.

### 2. One Thing at a Time

Don't mix multiple unrelated changes in one quick task.

### 3. Test Thoroughly

Quick doesn't mean sloppy. Test your changes.

### 4. Follow Conventions

Even quick tasks should follow codebase conventions.

### 5. Atomic Commits

One task = one commit. Don't bundle multiple fixes.

### 6. Descriptive Messages

Commit messages should explain what and why.

---

## When Quick Mode Isn't Enough

**Signs you need full planning**:
- Task touches multiple systems
- Unsure of implementation approach
- Requires research
- Affects architecture
- Takes more than 1 hour
- Has dependencies on other work

**Solution**: Use `/plan` workflow instead:
1. Create phase in ROADMAP.md
2. Plan the phase properly
3. Execute with Ralph Loop
4. Verify thoroughly

---

## Quick Mode Checklist

Before committing:
- [ ] Changes are minimal and focused
- [ ] Validation passes
- [ ] Manual testing done
- [ ] No regressions introduced
- [ ] Commit message is descriptive
- [ ] Only one logical change per commit

---

## Troubleshooting

### "Validation fails"

**Solution**: Fix the validation errors before committing. Quick mode still requires passing validation.

### "Change is bigger than expected"

**Solution**: Stop and create a proper phase plan. Don't force a big change through quick mode.

### "Unsure if this will work"

**Solution**: Research first, then implement. Or use full planning workflow.

### "Multiple things need to change"

**Solution**: Either:
- Make multiple quick commits (one per change)
- Or create a phase plan if changes are related

---

## Summary

**Quick Mode is for**:
- Small, focused changes
- Clear, well-understood tasks
- Bug fixes and minor features
- Tasks under 1 hour

**Quick Mode is NOT for**:
- Large features
- Architectural changes
- Unclear scope
- Research-heavy work

**Process**:
1. Describe task
2. AI implements
3. Validate
4. Test manually
5. Commit atomically

**Key principle**: Quick mode maintains GSD quality standards (validation, testing, atomic commits) with less upfront planning.

---

**Ready for a quick task? Describe what needs to be done and let's get it done.**
