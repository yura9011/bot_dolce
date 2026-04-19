---
phase: 1
plan: 3
wave: 2
milestone: gsd-universal
---

# Plan 1.3: Universal File Structure & Workflow Definitions

## Objective
Eliminate all IDE-specific directory dependencies (like .kiro/) and create a pure, universal file structure that works identically in any environment with any AI assistant.

## Context
- .gsd/milestones/gsd-universal/MILESTONE.md
- Current .kiro/ directory usage patterns
- .gsd/ directory structure (already universal)
- .gsd/workflows/*.md (current workflow definitions)

## Tasks

<task type="auto">
  <name>Create Universal File Structure Protocol</name>
  <files>.gsd/protocols/file-structure.md</files>
  <action>
    Create comprehensive file structure protocol that:
    - Defines universal directory structure using only .gsd/ and standard project files
    - Eliminates all references to .kiro/, .claude/, .cursor/, etc.
    - Specifies where to store state, configuration, and temporary files universally
    - Documents fallback patterns for environments with file system restrictions
    - Includes git-based state management and recovery patterns
    - Provides clear migration path from IDE-specific structures
    - Works identically in terminal, IDE, or web-based environments
  </action>
  <verify>cat .gsd/protocols/file-structure.md | grep -E "(\.gsd|universal|cross-platform)" | wc -l</verify>
  <done>Universal file structure protocol eliminates all IDE-specific directory dependencies</done>
</task>

<task type="auto">
  <name>Update Core Workflows for Universal Compatibility</name>
  <files>.gsd/workflows/new-project.md, .gsd/workflows/execute.md, .gsd/workflows/verify.md</files>
  <action>
    Update core GSD workflows to be completely universal:
    - Remove any references to IDE-specific features or directories
    - Replace with universal patterns from protocols created in previous plans
    - Ensure workflows work identically in any environment
    - Add clear instructions for manual execution when AI features unavailable
    - Maintain all current functionality but with universal compatibility
    - Include environment detection and graceful degradation patterns
  </action>
  <verify>grep -L "getDiagnostics\|invokeSubAgent\|\.kiro" .gsd/workflows/new-project.md .gsd/workflows/execute.md .gsd/workflows/verify.md | wc -l</verify>
  <done>Core workflows updated to use only universal patterns and protocols</done>
</task>

<task type="auto">
  <name>Create Universal Environment Setup Guide</name>
  <files>.gsd/UNIVERSAL-SETUP.md</files>
  <action>
    Create comprehensive setup guide for GSD Universal:
    - Instructions for any environment (terminal + AI chat, any IDE, web-based)
    - Required tools: git, basic shell, text editor (any)
    - Optional tools: language linters, but with clear fallbacks
    - Step-by-step setup for different environments
    - Troubleshooting guide for common environment issues
    - Migration instructions from IDE-specific GSD setups
    - Verification steps to confirm universal setup works
  </action>
  <verify>test -f .gsd/UNIVERSAL-SETUP.md && grep -q "any environment" .gsd/UNIVERSAL-SETUP.md</verify>
  <done>Universal setup guide enables GSD adoption in any environment without dependencies</done>
</task>

## Success Criteria
- [ ] Universal file structure eliminates all IDE-specific directory dependencies
- [ ] Core workflows function identically in any environment
- [ ] Setup guide enables GSD use with any AI assistant in any environment
- [ ] Clear migration path from current IDE-specific implementations
- [ ] Zero dependencies on specific IDEs, tools, or platforms