# Brownfield Guide - Adding GSD to Existing Projects

**How to adopt GSD in a project that already has code.**

---

## Overview

Most developers have existing projects. This guide shows how to add GSD to a codebase that's already in progress.

**Timeline**: 30-60 minutes to set up, then use GSD normally.

---

## Prerequisites

- Existing project with code
- Git repository (recommended)
- AI assistant
- Text editor

---

## Step-by-Step Setup

### Step 1: Add GSD Files

**Option A: Copy from GSD Repository**

```bash
# Clone GSD to temporary location
git clone https://github.com/your-org/gsd-universal.git /tmp/gsd-universal

# In your existing project
cd /path/to/your/project

# Copy GSD files
cp -r /tmp/gsd-universal/.gsd .
cp -r /tmp/gsd-universal/scripts .
cp /tmp/gsd-universal/loop.sh .
cp /tmp/gsd-universal/loop.ps1 .
cp /tmp/gsd-universal/PROMPT_build.md .
cp /tmp/gsd-universal/PROMPT_plan.md .
cp /tmp/gsd-universal/AGENTS.md .

# Clean up
rm -rf /tmp/gsd-universal
```

**Option B: Manual Download**

1. Download GSD from GitHub
2. Extract archive
3. Copy these directories/files to your project:
   - `.gsd/` directory
   - `scripts/` directory
   - `loop.sh` and `loop.ps1`
   - `PROMPT_build.md` and `PROMPT_plan.md`
   - `AGENTS.md`

### Step 2: Commit GSD Files

```bash
# Add GSD to git
git add .gsd/ scripts/ loop.sh loop.ps1 PROMPT_*.md AGENTS.md

# Commit
git commit -m "feat: Add GSD framework

- Add .gsd/ workflows and protocols
- Add scripts/ for automation
- Add Ralph Loop (loop.sh, loop.ps1)
- Add AGENTS.md for operational guide"
```

### Step 3: Index Your Codebase

Generate codebase intelligence so AI understands your project:

```bash
# Run indexing script
./scripts/index-codebase.sh

# This creates .gsd/intel/ with:
# - index.json (all exports and imports)
# - conventions.json (detected naming patterns)
# - graph.json (dependency graph)
# - summary.md (AI-readable summary)
# - hotspots.json (frequently changed files)
# - metadata.json (indexing stats)
```

**What it does**:
- Scans all source files
- Extracts exports and imports
- Detects naming conventions (PascalCase, camelCase, etc.)
- Identifies directory purposes
- Maps dependencies (who imports who)
- Finds hotspots (critical files)
- Generates summary for AI

**Time**: 5-30 seconds depending on codebase size

### Step 4: Review Intelligence Summary

Open `.gsd/intel/summary.md` and review:

```markdown
# Codebase Intelligence Summary

## Project Structure
- src/components/ - React components (23 files)
- src/lib/ - Utilities (8 files)
- ...

## Naming Conventions
- Components: PascalCase (95% confidence)
- Utilities: camelCase (98% confidence)
- ...

## Key Files (Hotspots)
- src/lib/utils.ts - Imported by 23 files
- ...
```

**This is what AI will read to understand your codebase.**

### Step 5: Commit Intelligence

```bash
# Add intelligence files
git add .gsd/intel/

# Commit
git commit -m "feat: Add codebase intelligence

- Index existing codebase
- Detect conventions and patterns
- Generate dependency graph
- Create AI-readable summary"
```

---

## Understanding Your Codebase

### Step 6: Map Architecture

Now use AI to document your architecture:

**Open your AI assistant and say**:

```
I have an existing codebase and just added GSD framework.

Please read .gsd/intel/summary.md to understand my codebase structure.

Then read .gsd/workflows/map.md and help me create:
1. ARCHITECTURE.md - System architecture
2. FILE-STRUCTURE.md - Directory organization
3. PATTERNS.md - Code patterns and conventions
```

**What happens**:
- AI reads intelligence summary
- AI understands your structure
- AI asks clarifying questions
- AI documents architecture

**Time**: 10-15 minutes

**Files created**:
- `ARCHITECTURE.md` - High-level system design
- `FILE-STRUCTURE.md` - Directory purposes
- `PATTERNS.md` - Coding conventions

### Step 7: Commit Documentation

```bash
git add ARCHITECTURE.md FILE-STRUCTURE.md PATTERNS.md
git commit -m "docs: Document existing architecture

- Add architecture overview
- Document file structure
- Capture code patterns"
```

---

## Planning Next Work

### Step 8: Define Current State

Create `STATE.md` to capture where you are:

**Ask your AI**:

```
Please help me create STATE.md for my existing project.

Include:
- Current version/milestone
- What's working
- What's incomplete
- Known issues
- Next priorities
```

**Example STATE.md**:
```markdown
# STATE.md

## Current Position
- Version: 0.5.0
- Status: In development
- Last Updated: 2026-01-21

## What's Working
- User authentication
- Basic CRUD operations
- API integration

## What's Incomplete
- Admin dashboard (50% done)
- Email notifications (not started)
- Search functionality (not started)

## Known Issues
- Performance issues with large datasets
- Mobile layout needs work
- Test coverage is low (30%)

## Next Priorities
1. Complete admin dashboard
2. Add email notifications
3. Improve performance
```

### Step 9: Create Roadmap

Define what to build next:

**Ask your AI**:

```
Based on STATE.md, please read .gsd/workflows/new-milestone.md
and help me create a roadmap for the next milestone.

I want to focus on: [describe your priority]
```

**What happens**:
- AI asks about goals and constraints
- AI creates requirements
- AI breaks work into phases
- AI creates roadmap

**Files created**:
- `PROJECT.md` - Project vision (if not exists)
- `REQUIREMENTS.md` - What needs to be built
- `ROADMAP.md` - Phases to complete milestone

### Step 10: Commit Planning

```bash
git add STATE.md PROJECT.md REQUIREMENTS.md ROADMAP.md
git commit -m "feat: Plan next milestone

- Document current state
- Define requirements
- Create roadmap with phases"
```

---

## Start Building

### Step 11: Plan First Phase

Now plan the first phase of new work:

**Ask your AI**:

```
Please read .gsd/workflows/plan.md and help me plan Phase 1.

Context:
- Read .gsd/intel/summary.md for codebase conventions
- Read ARCHITECTURE.md for system design
- Read ROADMAP.md for phase goals

Create detailed execution plans.
```

**What happens**:
- AI researches implementation approach
- AI creates 2-3 atomic task plans
- AI follows existing conventions
- Plans integrate with existing code

**Time**: 5-10 minutes

### Step 12: Execute with Ralph Loop

Execute the plans:

```bash
# Interactive mode (works with any AI)
./loop.sh

# Or automated mode (if you have AI CLI)
./loop.sh --auto
```

**Ralph Loop will**:
1. Show prompt
2. You execute with AI (or AI CLI executes)
3. Validate changes
4. Commit if validation passes
5. Continue with next task

### Step 13: Verify Work

After execution:

```
Please read .gsd/workflows/verify.md and help me verify Phase 1.
Check that all requirements are met and nothing broke.
```

**Important for brownfield**:
- Test existing functionality still works
- Check for regressions
- Verify integration with existing code

---

## Ongoing Workflow

### Regular Development

From now on, use GSD normally:

1. **Plan phase** - Define what to build
2. **Execute** - Build it with Ralph Loop
3. **Verify** - Test it works
4. **Repeat** - Continue with next phase

### Maintain Intelligence

Keep codebase intelligence up-to-date:

**Option 1: Manual (after big changes)**
```bash
./scripts/index-codebase.sh
git add .gsd/intel/
git commit -m "chore: Update codebase intelligence"
```

**Option 2: Git Hook (automatic)**
```bash
# Install post-commit hook
cp scripts/hooks/post-commit .git/hooks/
chmod +x .git/hooks/post-commit

# Now intelligence updates automatically after each commit
```

**Option 3: Scheduled (cron/task scheduler)**
```bash
# Run every hour
0 * * * * cd /path/to/project && ./scripts/index-codebase.sh --incremental
```

---

## Common Scenarios

### Scenario 1: Large Existing Codebase

**Challenge**: Thousands of files, complex structure

**Approach**:
1. Index codebase (may take 1-2 minutes)
2. Review intelligence summary
3. Focus on one area at a time
4. Use `.gsd/intel/graph.json` to understand dependencies
5. Plan small, focused phases

**Tip**: Don't try to understand everything at once. Let intelligence guide you.

### Scenario 2: Legacy Code with No Tests

**Challenge**: No test coverage, risky changes

**Approach**:
1. First milestone: Add tests
2. Use GSD to plan testing strategy
3. Add tests incrementally
4. Then proceed with features

**Tip**: Tests are backpressure. Add them first.

### Scenario 3: Multiple Developers

**Challenge**: Team needs to adopt GSD together

**Approach**:
1. One person sets up GSD (Steps 1-5)
2. Commit and push
3. Team pulls changes
4. Each developer runs `./scripts/index-codebase.sh`
5. Team reviews `.gsd/intel/summary.md` together
6. Agree on conventions and patterns

**Tip**: Intelligence helps align team on conventions.

### Scenario 4: Inconsistent Code Style

**Challenge**: Mixed patterns, no clear conventions

**Approach**:
1. Index codebase
2. Review `.gsd/intel/conventions.json`
3. See what patterns exist (even if inconsistent)
4. Decide on standard
5. Create refactoring phase to align
6. Use GSD to execute refactoring

**Tip**: Intelligence shows you what you have. You decide what you want.

### Scenario 5: Monorepo with Multiple Projects

**Challenge**: Multiple packages/apps in one repo

**Approach**:
1. Index entire repo
2. Intelligence will detect all patterns
3. Create separate roadmaps per project
4. Use `--dir` flag to index specific areas:
   ```bash
   ./scripts/index-codebase.sh --dir packages/app1
   ```

**Tip**: Intelligence works at any scope.

---

## Migration Checklist

Use this checklist to ensure complete setup:

### Initial Setup
- [ ] Copy GSD files to project
- [ ] Commit GSD files
- [ ] Run codebase indexing
- [ ] Review intelligence summary
- [ ] Commit intelligence

### Documentation
- [ ] Create/update ARCHITECTURE.md
- [ ] Create/update FILE-STRUCTURE.md
- [ ] Create/update PATTERNS.md
- [ ] Create STATE.md
- [ ] Commit documentation

### Planning
- [ ] Create/update PROJECT.md
- [ ] Create REQUIREMENTS.md for next work
- [ ] Create ROADMAP.md with phases
- [ ] Commit planning

### Validation
- [ ] Run `./scripts/validate.sh --all`
- [ ] Fix any validation errors
- [ ] Ensure git status is clean

### First Phase
- [ ] Plan Phase 1
- [ ] Execute with Ralph Loop
- [ ] Verify results
- [ ] Commit changes

### Automation (Optional)
- [ ] Install git hooks for auto-indexing
- [ ] Set up scheduled indexing
- [ ] Configure validation in CI/CD

---

## Tips for Success

### 1. Start with Intelligence

Always index first. Intelligence helps AI understand your codebase and follow existing patterns.

### 2. Document What Exists

Before adding new features, document current architecture. This prevents AI from making inconsistent changes.

### 3. Small Phases

Don't plan huge changes. Break work into small phases that integrate with existing code.

### 4. Test Integration

After each phase, verify existing functionality still works. Brownfield requires extra care.

### 5. Keep Intelligence Updated

Re-index after significant changes. Stale intelligence leads to inconsistent code.

### 6. Use Hotspots

Check `.gsd/intel/hotspots.json` to identify critical files. Be extra careful with high-centrality files.

### 7. Follow Detected Conventions

AI reads `.gsd/intel/summary.md` for conventions. Trust the detected patterns unless you're intentionally changing them.

---

## Troubleshooting

### "Indexing fails on some files"

**Solution**: 
- Check `.gsd/intel/metadata.json` for errors
- Indexing skips unparseable files (binary, etc.)
- This is normal and expected

### "AI makes changes that don't match existing code"

**Solution**:
- Ensure AI reads `.gsd/intel/summary.md`
- Be explicit: "Follow conventions in .gsd/intel/summary.md"
- Re-index if codebase changed significantly

### "Intelligence shows wrong conventions"

**Solution**:
- Intelligence detects what exists, not what you want
- If codebase is inconsistent, intelligence reflects that
- Decide on standard, then refactor to align

### "Validation fails on existing code"

**Solution**:
- Validation checks new changes, not existing code
- If existing code has issues, fix them first
- Or adjust validation rules in `scripts/validate.sh`

---

## Next Steps

### Learn More

- Read `QUICKSTART.md` - General GSD usage
- Read `.gsd/protocols/codebase-intelligence.md` - Intelligence details
- Read `.gsd/workflows/map.md` - Codebase mapping

### Explore Features

- **Parallel Execution**: `.gsd/protocols/parallel.md`
- **Git Hooks**: Automatic validation and indexing
- **Custom Workflows**: Create your own

### Get Help

- GitHub Issues - Report problems
- GitHub Discussions - Ask questions
- Examples - See `.gsd/examples/`

---

## Summary

**Brownfield adoption in 5 steps**:
1. **Add GSD files** - Copy framework to project
2. **Index codebase** - Generate intelligence
3. **Document architecture** - Capture what exists
4. **Plan next work** - Define roadmap
5. **Execute normally** - Use GSD workflows

**Key insight**: Intelligence helps AI understand and respect existing code.

**Timeline**: 30-60 minutes setup, then normal GSD workflow.

---

**Ready to add GSD to your existing project? Start with Step 1 above.**
