---
phase: 1
plan: 1
wave: 1
milestone: gsd-universal
---

# Plan 1.1: Universal Validation System

## Objective
Replace Kiro's `getDiagnostics` with a universal validation system that works with any AI assistant in any environment using only standard shell commands and language-specific linters.

## Context
- .gsd/milestones/gsd-universal/MILESTONE.md
- AGENTS.md (current validation commands)
- scripts/validate-*.sh and scripts/validate-*.ps1 (existing validation)
- .gsd/workflows/*.md (current workflow dependencies)

## Tasks

<task type="auto">
  <name>Create Universal Validation Protocol</name>
  <files>.gsd/protocols/validation.md</files>
  <action>
    Create comprehensive validation protocol that:
    - Defines standard shell commands for syntax checking (eslint, pylint, tsc, etc.)
    - Provides fallback methods when linters unavailable
    - Specifies cross-platform command patterns (bash + PowerShell)
    - Documents manual verification steps as ultimate fallback
    - Includes environment detection and graceful degradation
    - NO references to getDiagnostics, Kiro, or any specific IDE
  </action>
  <verify>cat .gsd/protocols/validation.md | grep -E "(eslint|pylint|tsc)" | wc -l</verify>
  <done>Protocol document exists with language-specific validation commands and fallback strategies</done>
</task>

<task type="auto">
  <name>Update Validation Scripts</name>
  <files>scripts/validate-universal.sh, scripts/validate-universal.ps1</files>
  <action>
    Create new universal validation scripts that:
    - Implement the validation protocol from previous task
    - Detect available linters and use appropriate commands
    - Provide clear error messages when tools unavailable
    - Work identically on bash and PowerShell
    - Replace current IDE-specific validation patterns
    - Include manual verification instructions in output
  </action>
  <verify>./scripts/validate-universal.sh --dry-run && ./scripts/validate-universal.ps1 -DryRun</verify>
  <done>Universal validation scripts execute successfully and detect available tools</done>
</task>

<task type="auto">
  <name>Update AGENTS.md Validation Commands</name>
  <files>AGENTS.md</files>
  <action>
    Replace current validation section with universal commands:
    - Change "Use Kiro's getDiagnostics" to "Use universal validation protocol"
    - Update validation commands to use new universal scripts
    - Add fallback instructions for environments without linters
    - Maintain cross-platform compatibility (bash + PowerShell)
    - Keep under 60 lines total as required
  </action>
  <verify>grep -q "universal validation" AGENTS.md && grep -q "validate-universal" AGENTS.md</verify>
  <done>AGENTS.md references universal validation system instead of IDE-specific tools</done>
</task>

## Success Criteria
- [ ] Universal validation protocol documented and implementable in any environment
- [ ] Validation works without any IDE-specific dependencies
- [ ] Cross-platform compatibility maintained (bash + PowerShell)
- [ ] Clear fallback strategies when tools unavailable
- [ ] AGENTS.md updated to reference universal system