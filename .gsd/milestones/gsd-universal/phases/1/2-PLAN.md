---
phase: 1
plan: 2
wave: 1
milestone: gsd-universal
---

# Plan 1.2: Universal Parallel Processing Pattern

## Objective
Replace Kiro's `invokeSubAgent` with a universal parallel processing pattern that works with any AI assistant using only file-based coordination and standard shell operations.

## Context
- .gsd/milestones/gsd-universal/MILESTONE.md
- .gsd/workflows/*.md (current subagent usage patterns)
- Current GSD workflows that use invokeSubAgent for context efficiency

## Tasks

<task type="auto">
  <name>Create Universal Parallel Processing Protocol</name>
  <files>.gsd/protocols/parallel.md</files>
  <action>
    Create comprehensive parallel processing protocol that:
    - Defines file-based task queues and status tracking
    - Specifies coordination patterns using standard files and git
    - Documents sequential execution with progress indicators as fallback
    - Provides clear task breakdown and dependency management
    - Includes cross-platform file locking and coordination mechanisms
    - NO references to invokeSubAgent, Kiro, or any specific IDE features
    - Works identically whether AI can execute in parallel or sequentially
  </action>
  <verify>cat .gsd/protocols/parallel.md | grep -E "(task-queue|status-tracking|file-based)" | wc -l</verify>
  <done>Protocol document exists with file-based coordination patterns and fallback strategies</done>
</task>

<task type="auto">
  <name>Create Universal Task Coordination System</name>
  <files>.gsd/lib/task-queue.md, .gsd/lib/task-status.md</files>
  <action>
    Create task coordination system using pure markdown:
    - task-queue.md: Template for task queue management via files
    - task-status.md: Template for tracking task progress and results
    - Define standard file formats for task coordination
    - Include examples of sequential execution with clear progress
    - Provide patterns for manual task coordination when needed
    - Ensure system works with any AI assistant or human execution
  </action>
  <verify>test -f .gsd/lib/task-queue.md && test -f .gsd/lib/task-status.md</verify>
  <done>Task coordination templates exist and provide clear patterns for any execution environment</done>
</task>

<task type="auto">
  <name>Update Workflows to Use Universal Patterns</name>
  <files>.gsd/workflows/map.md, .gsd/workflows/research-phase.md</files>
  <action>
    Update key workflows that currently use invokeSubAgent:
    - Replace invokeSubAgent calls with universal task coordination patterns
    - Add instructions for both parallel and sequential execution
    - Maintain same functionality but with universal compatibility
    - Include clear manual alternatives when AI coordination unavailable
    - Preserve existing workflow structure and user experience
    - Document how to achieve same results in any environment
  </action>
  <verify>grep -L "invokeSubAgent" .gsd/workflows/map.md .gsd/workflows/research-phase.md | wc -l</verify>
  <done>Key workflows updated to use universal patterns instead of IDE-specific features</done>
</task>

## Success Criteria
- [ ] Universal parallel processing protocol documented and implementable anywhere
- [ ] File-based task coordination system provides clear patterns
- [ ] Workflows function identically with or without IDE-specific parallel features
- [ ] Clear manual alternatives available for any execution environment
- [ ] No dependencies on invokeSubAgent or similar IDE-specific features