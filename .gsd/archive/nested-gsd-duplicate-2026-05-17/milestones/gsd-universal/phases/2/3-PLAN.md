---
phase: 2
plan: 3
wave: 2
milestone: gsd-universal
---

# Plan 2.3: Migrate Current Ralph to Universal

## Objective

Migrate the current Ralph Loop implementation (loop.sh/loop.ps1) to use the new universal protocol. Update existing prompt files to universal templates and ensure backward compatibility.

## Context

- `scripts/ralph.sh` and `scripts/ralph.ps1` - New universal scripts (from Plan 2.2)
- `loop.sh` and `loop.ps1` - Current CLI-dependent implementation
- `PROMPT_build.md` and `PROMPT_plan.md` - Current prompts (CLI-dependent)
- `.gsd/templates/PROMPT_build.md` - Universal template (from Plan 2.1)
- `.gsd/protocols/ralph-loop.md` - Protocol specification

## Tasks

<task type="auto">
  <name>Replace Current Ralph Implementation</name>
  <files>loop.sh, loop.ps1, PROMPT_build.md, PROMPT_plan.md</files>
  <action>
Migrate current Ralph to universal protocol:

**Step 1: Backup Current Implementation**
Move current files to legacy:
```bash
mkdir -p .gsd/legacy/ralph-cli/
mv loop.sh .gsd/legacy/ralph-cli/
mv loop.ps1 .gsd/legacy/ralph-cli/
mv PROMPT_build.md .gsd/legacy/ralph-cli/
mv PROMPT_plan.md .gsd/legacy/ralph-cli/
```

**Step 2: Install Universal Ralph**
Copy universal scripts to root:
```bash
cp scripts/ralph.sh loop.sh
cp scripts/ralph.ps1 loop.ps1
chmod +x loop.sh
```

**Step 3: Install Universal Prompts**
Copy universal templates to root:
```bash
cp .gsd/templates/PROMPT_build.md PROMPT_build.md
cp .gsd/templates/PROMPT_plan.md PROMPT_plan.md
```

**Step 4: Update IMPLEMENTATION_PLAN.md**
Add migration note at top:
```markdown
# Implementation Plan

**Ralph Loop Migration**: This project now uses Universal Ralph Loop protocol.
- See `.gsd/protocols/ralph-loop.md` for protocol specification
- See `.gsd/legacy/ralph-cli/` for previous CLI-dependent implementation
- Current implementation works with any AI assistant (no CLI required)

## Current Tasks
...
```

**Step 5: Verify Migration**
Test universal Ralph:
```bash
./loop.sh --dry-run  # Should pass validation
./loop.ps1 -DryRun   # Should pass validation
```

**Avoid:**
- Don't delete legacy files (keep for reference)
- Don't break existing workflows
- Don't remove git history
  </action>
  <verify>test -f loop.sh && test -f loop.ps1 && test -d .gsd/legacy/ralph-cli/ && ! grep -q "kiro\|claude\|openai" loop.sh</verify>
  <done>
- [ ] Current Ralph files moved to .gsd/legacy/ralph-cli/
- [ ] Universal Ralph scripts installed as loop.sh and loop.ps1
- [ ] Universal prompts installed as PROMPT_build.md and PROMPT_plan.md
- [ ] IMPLEMENTATION_PLAN.md updated with migration note
- [ ] Dry-run validation passes
- [ ] No CLI dependencies in new implementation
  </done>
</task>

<task type="auto">
  <name>Update GSD Workflows for Universal Ralph</name>
  <files>.gsd/workflows/execute.md, .gsd/workflows/verify.md, STATE.md, ROADMAP.md</files>
  <action>
Update GSD workflows to reference Universal Ralph:

**.gsd/workflows/execute.md:**
Add Ralph Loop integration section:
```markdown
## Ralph Loop Integration (Optional)

For autonomous execution, use Ralph Loop:

```bash
# Start Ralph in build mode
./loop.sh build

# Or manual mode
./loop.sh --manual
```

Ralph will coordinate:
1. Show prompts from IMPLEMENTATION_PLAN.md
2. Wait for you to execute with your AI
3. Run validation after each iteration
4. Manage git commits
5. Continue until complete

See `.gsd/protocols/ralph-loop.md` for details.
```

**STATE.md:**
Update Phase 2 status:
```markdown
## Current Position

- **Milestone**: gsd-universal  
- **Phase**: 2 (Complete)
- **Task**: Universal Ralph Loop implemented
- **Status**: Ready for Phase 3 (/plan 3)
- **Last Updated**: 2026-01-21
```

**ROADMAP.md:**
Mark Phase 2 complete:
```markdown
### Phase 2: Universal Ralph Loop
**Status**: ✅ Complete
**Objective**: Transform Ralph Loop into pure protocol-based system

**Key Deliverables:**
- ✅ Protocol-based Ralph (no external CLI dependencies)
- ✅ Self-executing within any environment (IDE or terminal)
- ✅ Universal prompt templates (work with any AI)
- ✅ Cross-platform scripts (bash + PowerShell)
- ✅ File-based state management
```

**Avoid:**
- Don't break existing workflow references
- Don't remove backward compatibility notes
  </action>
  <verify>grep -q "Ralph Loop" .gsd/workflows/execute.md && grep -q "Phase 2 (Complete)" STATE.md</verify>
  <done>
- [ ] .gsd/workflows/execute.md updated with Ralph integration
- [ ] STATE.md updated to Phase 2 complete
- [ ] ROADMAP.md marks Phase 2 as complete
- [ ] Workflows reference universal protocol
- [ ] Backward compatibility maintained
  </done>
</task>

## Success Criteria

- [ ] Current Ralph migrated to universal protocol
- [ ] Legacy CLI-dependent version preserved in .gsd/legacy/
- [ ] Universal Ralph installed as loop.sh and loop.ps1
- [ ] Universal prompts installed as PROMPT_build.md and PROMPT_plan.md
- [ ] GSD workflows updated to reference Universal Ralph
- [ ] STATE.md and ROADMAP.md updated
- [ ] Dry-run validation passes
- [ ] No CLI dependencies in new implementation
- [ ] Backward compatibility maintained
