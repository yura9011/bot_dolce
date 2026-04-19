---
phase: 2
plan: 2
wave: 2
milestone: gsd-universal
---

# Plan 2.2: Universal Ralph Scripts

## Objective

Create universal Ralph Loop scripts (bash + PowerShell) that implement the protocol without CLI dependencies. These scripts coordinate the iteration cycle using only standard tools and file operations.

## Context

- `.gsd/protocols/ralph-loop.md` - Protocol definition (from Plan 2.1)
- `.gsd/templates/PROMPT_build.md` - Universal prompt template (from Plan 2.1)
- `loop.sh` and `loop.ps1` - Current implementation (to be replaced)
- `.gsd/examples/shell-patterns.md` - Reusable shell patterns
- `.gsd/protocols/validation.md` - Validation patterns

## Tasks

<task type="auto">
  <name>Create Universal Ralph Loop Scripts</name>
  <files>scripts/ralph.sh, scripts/ralph.ps1</files>
  <action>
Create `scripts/ralph.sh` and `scripts/ralph.ps1` that implement Universal Ralph protocol:

**Core Functionality:**
1. **Initialization**
   - Validate setup (PROMPT_build.md, IMPLEMENTATION_PLAN.md, specs/ exist)
   - Check git is available
   - Detect available validation tools

2. **Iteration Cycle** (NO CLI dependencies)
   - Display iteration number and prompt file
   - Show prompt content to user
   - PAUSE for user to execute with their AI
   - Wait for user confirmation to continue
   - Run validation (./scripts/validate.sh or .ps1)
   - Check git status
   - Prompt for commit if changes exist
   - Continue to next iteration or stop

3. **State Management**
   - Track iteration count
   - Log to `.ralph/session-{timestamp}.log`
   - Update IMPLEMENTATION_PLAN.md status
   - Git commits for each iteration

4. **Modes**
   - `build` - Execute PROMPT_build.md
   - `plan` - Execute PROMPT_plan.md
   - `--manual` - Full manual mode (just show prompts, no automation)
   - `--dry-run` - Validate setup only

**Key Differences from Current loop.sh/loop.ps1:**
- NO AI CLI execution (no `kiro`, `claude`, `openai` commands)
- Interactive mode: show prompt → wait for user → validate → continue
- User executes AI manually (web chat, IDE, terminal)
- Scripts coordinate the process, don't execute AI

**Script Structure (bash):**
```bash
#!/bin/bash
# ralph.sh - Universal Ralph Loop coordinator

MODE="build"
MAX_ITERATIONS=50
MANUAL_MODE=false

show_prompt() {
    local prompt_file="$1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo " RALPH LOOP - Iteration $iteration/$MAX_ITERATIONS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Prompt file: $prompt_file"
    echo ""
    cat "$prompt_file"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

wait_for_user() {
    echo ""
    echo "Execute this prompt with your AI assistant, then press ENTER to continue..."
    read -r
}

run_validation() {
    echo "Running validation..."
    if [[ -x "./scripts/validate.sh" ]]; then
        ./scripts/validate.sh --all
    else
        echo "Validation script not found, skipping"
    fi
}

# Main loop
for ((iteration=1; iteration<=MAX_ITERATIONS; iteration++)); do
    show_prompt "PROMPT_$MODE.md"
    wait_for_user
    run_validation
    
    # Check for changes
    if [[ -n $(git status --porcelain) ]]; then
        echo "Changes detected. Commit? (y/n)"
        read -r response
        if [[ "$response" == "y" ]]; then
            git add -A
            git commit
            git push
        fi
    fi
    
    echo "Continue to next iteration? (y/n)"
    read -r response
    [[ "$response" != "y" ]] && break
done
```

**PowerShell version:**
Similar structure but using PowerShell syntax.

**Reference:**
- See `.gsd/examples/shell-patterns.md` for file operations
- See `.gsd/protocols/validation.md` for validation patterns
- See current `loop.sh` for iteration structure (but remove CLI execution)

**Avoid:**
- Don't execute AI CLIs (kiro, claude, etc.)
- Don't assume automation is available
- Don't use IDE-specific features
  </action>
  <verify>test -f scripts/ralph.sh && test -f scripts/ralph.ps1 && ! grep -q "kiro\|claude\|openai" scripts/ralph.sh</verify>
  <done>
- [ ] scripts/ralph.sh created (bash version)
- [ ] scripts/ralph.ps1 created (PowerShell version)
- [ ] No AI CLI dependencies (no kiro, claude, openai commands)
- [ ] Interactive mode: show prompt → wait → validate → continue
- [ ] Validation integration (./scripts/validate.sh or .ps1)
- [ ] Git integration for commits
- [ ] Manual mode support (--manual flag)
- [ ] Dry-run mode for setup validation
  </done>
</task>

<task type="auto">
  <name>Update Documentation and Integration</name>
  <files>README.md, .gsd/UNIVERSAL-SETUP.md, AGENTS.md</files>
  <action>
Update documentation to explain Universal Ralph Loop:

**README.md updates:**
Add section "Ralph Loop - Autonomous Execution":
```markdown
## Ralph Loop - Autonomous Execution

Ralph Loop enables autonomous execution of GSD tasks through iterative AI assistance.

### Universal Ralph (Works Anywhere)

Ralph is a **protocol**, not a tool. It works with any AI assistant:
- ChatGPT web interface
- Claude web interface  
- Kiro IDE
- VS Code + Copilot
- Terminal + any AI

### Quick Start

1. Ensure setup complete: `./scripts/ralph.sh --dry-run`
2. Start build mode: `./scripts/ralph.sh build`
3. Execute prompts with your AI assistant
4. Let Ralph coordinate validation and commits

### Modes

- `build` - Implement functionality from IMPLEMENTATION_PLAN.md
- `plan` - Update and prioritize tasks
- `--manual` - Full manual mode (no automation)
- `--dry-run` - Validate setup only

See `.gsd/protocols/ralph-loop.md` for complete protocol specification.
```

**.gsd/UNIVERSAL-SETUP.md updates:**
Add Ralph Loop setup section:
- How to use Ralph with different AI assistants
- Manual execution instructions
- Troubleshooting common issues

**AGENTS.md updates:**
Add Ralph Loop commands:
```markdown
## Ralph Loop Operations

- Build mode: `./scripts/ralph.sh build` or `./scripts/ralph.ps1 -Mode build`
- Plan mode: `./scripts/ralph.sh plan` or `./scripts/ralph.ps1 -Mode plan`
- Manual mode: `./scripts/ralph.sh --manual` or `./scripts/ralph.ps1 -Manual`
- Dry run: `./scripts/ralph.sh --dry-run` or `./scripts/ralph.ps1 -DryRun`
```

**Keep brief** - detailed docs go in protocol file, not AGENTS.md.
  </action>
  <verify>grep -q "Ralph Loop" README.md && grep -q "ralph.sh" AGENTS.md</verify>
  <done>
- [ ] README.md updated with Ralph Loop section
- [ ] .gsd/UNIVERSAL-SETUP.md includes Ralph setup instructions
- [ ] AGENTS.md updated with Ralph commands (kept brief)
- [ ] Documentation explains universal nature (works with any AI)
- [ ] Manual execution mode documented
  </done>
</task>

## Success Criteria

- [ ] Universal Ralph scripts created (bash + PowerShell)
- [ ] Scripts coordinate iterations without CLI dependencies
- [ ] Interactive mode: show prompt → user executes → validate → continue
- [ ] Validation and git integration working
- [ ] Documentation updated explaining universal approach
- [ ] Manual mode available for any environment
- [ ] Cross-platform compatibility verified
