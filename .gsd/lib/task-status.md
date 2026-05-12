# Universal Task Status Template

## Overview

This template provides standardized patterns for tracking task progress and results in any environment with any AI assistant, using only markdown files and standard operations.

## Status File Structure

### Primary Status File: `.gsd/tasks/status.md`

```markdown
# Task Execution Status

## Execution Summary
- **Session ID**: {YYYYMMDD-HHMM}
- **Started**: {YYYY-MM-DD HH:MM:SS UTC}
- **Mode**: {sequential|parallel|manual}
- **Environment**: {terminal|kiro|vscode|web-chat}
- **AI Assistant**: {claude|gpt|gemini|human}

## Task Counts
- **Total Tasks**: {number}
- **Completed**: {number} ({percentage}%)
- **In Progress**: {number}
- **Failed**: {number}
- **Queued**: {number}

## Current Activity
- **Active Task**: {task-id or "none"}
- **Started At**: {HH:MM:SS}
- **Progress**: {description}
- **Next Task**: {task-id or "none"}

## Performance Metrics
- **Tasks Completed**: {number}
- **Average Duration**: {minutes per task}
- **Success Rate**: {percentage}%
- **Total Time**: {minutes}
- **Estimated Remaining**: {minutes}

## Timeline
{Most recent events first}
- {HH:MM:SS} - {event description}
- {HH:MM:SS} - {event description}
- {HH:MM:SS} - {event description}

## Issues and Blockers
{Current issues that need attention}
- {issue description} - {status: investigating|blocked|resolved}

## Next Steps
- [ ] {immediate next action}
- [ ] {follow-up action}
```

## Individual Task Status Tracking

### Task Status Fields

Each task should maintain these status fields:

```markdown
## Task: {task-id}
- **Status**: {queued|in-progress|completed|failed|blocked}
- **Progress**: {0-100}%
- **Started**: {timestamp or "not started"}
- **Updated**: {timestamp}
- **Duration**: {minutes or "ongoing"}
- **Assigned**: {ai-assistant|human|auto}

### Progress Details
- **Current Step**: {description of current activity}
- **Steps Completed**: {number}/{total}
- **Blockers**: {list of current blockers or "none"}
- **Dependencies**: {waiting for task IDs or "satisfied"}

### Execution Log
{Chronological log of task execution}
- {HH:MM} - Started task execution
- {HH:MM} - Completed step 1: {description}
- {HH:MM} - Encountered issue: {description}
- {HH:MM} - Resolved issue, continuing
- {HH:MM} - Completed task successfully
```

## Status Update Patterns

### Sequential Execution Status Updates

```markdown
## Sequential Status Pattern

### Before Starting Task
1. Move task from queue.md to in-progress.md
2. Update task status to "in-progress"
3. Update status.md with current task info
4. Set task start timestamp

### During Task Execution
1. Update task progress percentage
2. Log significant steps in execution log
3. Update "Current Step" description
4. Handle blockers by updating status

### After Task Completion
1. Update task status to "completed" or "failed"
2. Fill results section with outcomes
3. Move task to completed.md or failed.md
4. Update status.md with new counts
5. Log completion in timeline
```

### Parallel Execution Status Updates

```markdown
## Parallel Status Pattern

### Wave Initialization
1. Move all wave tasks to in-progress.md
2. Update status.md with wave information
3. Initialize progress tracking for each task
4. Set wave start timestamp

### During Wave Execution
1. Each task updates its own progress independently
2. Status.md shows aggregate wave progress
3. Individual task logs maintained separately
4. Blockers handled per-task without affecting others

### Wave Completion
1. Wait for all tasks in wave to complete
2. Aggregate results from all tasks
3. Update status.md with wave completion
4. Move all tasks to completed.md or failed.md
5. Log wave completion in timeline
```

### Manual Execution Status Updates

```markdown
## Manual Status Pattern

### Human Task Selection
1. Human reviews queue.md for available tasks
2. Selects task based on dependencies and priority
3. Manually updates task status to "in-progress"
4. Updates status.md with current activity

### Human Task Execution
1. Human follows task instructions step by step
2. Manually updates progress as steps complete
3. Documents issues and resolutions in execution log
4. Updates current step description

### Human Task Completion
1. Human verifies success criteria are met
2. Runs verification commands if available
3. Updates task status to "completed" or "failed"
4. Fills results section with outcomes
5. Moves task to appropriate completion file
```

## Progress Visualization

### Text-Based Progress Indicators

```markdown
## Progress Bar Examples

### Overall Progress
Tasks: ████████░░ 80% (8/10 completed)

### Current Task Progress
Step 3/5: ██████░░░░ 60% - Implementing validation logic

### Wave Progress
Wave 1: ████████████ 100% (3/3 tasks completed)
Wave 2: ██████░░░░░░ 50% (2/4 tasks in progress)
Wave 3: ░░░░░░░░░░░░ 0% (waiting for Wave 2)
```

### Status Icons and Indicators

```markdown
## Status Icon System

✓ Completed successfully
⏳ In progress
⏸ Queued/waiting
❌ Failed
🔄 Retrying
⚠ Blocked
🔍 Investigating
📋 Manual review needed
```

## Error and Issue Tracking

### Error Documentation Template

```markdown
## Error: {error-id}
- **Task**: {task-id}
- **Timestamp**: {YYYY-MM-DD HH:MM:SS UTC}
- **Type**: {syntax|logic|environment|dependency}
- **Severity**: {critical|high|medium|low}

### Description
{Clear description of what went wrong}

### Context
- **Environment**: {details about execution environment}
- **Files Involved**: {list of relevant files}
- **Commands Executed**: {commands that led to error}

### Error Details
```
{Exact error message or output}
```

### Root Cause Analysis
{Analysis of why the error occurred}

### Resolution Strategy
- [ ] {step 1 to resolve}
- [ ] {step 2 to resolve}
- [ ] {step 3 to resolve}

### Prevention
{How to prevent this error in future}

### Status
- **Resolved**: {yes|no}
- **Resolution Time**: {minutes}
- **Retry Required**: {yes|no}
```

## Integration with GSD Workflows

### Execute Workflow Status Integration

```markdown
## Phase Execution Status

### Phase Overview
- **Phase**: {number} - {name}
- **Plans**: {number}
- **Total Tasks**: {number}
- **Wave Structure**: {description}

### Plan Status
- Plan 1.1: ✓ Completed (3 tasks, 45 minutes)
- Plan 1.2: ⏳ In Progress (2/4 tasks, 30 minutes)
- Plan 1.3: ⏸ Queued (waiting for Plan 1.2)

### Phase Progress
Overall: ████████░░ 75% (9/12 tasks completed)
Estimated Completion: {timestamp}
```

### Verify Workflow Status Integration

```markdown
## Verification Status

### Verification Tasks
- Code validation: ✓ Completed
- Documentation check: ⏳ In Progress
- Integration test: ⏸ Queued
- Performance test: ❌ Failed (retrying)

### Verification Results
- Must-haves: 3/4 verified
- Nice-to-haves: 2/3 verified
- Overall Status: ⚠ Issues found
```

## Cross-Platform Status Management

### File-Based Status Persistence

```markdown
## Status File Management

### File Locations
- Primary status: `.gsd/tasks/status.md`
- Task logs: `.gsd/tasks/logs/{task-id}.md`
- Error reports: `.gsd/tasks/errors/{error-id}.md`
- Session history: `.gsd/tasks/history/{session-id}.md`

### Backup and Recovery
- Git-based status versioning
- Atomic file updates to prevent corruption
- Recovery procedures for interrupted sessions
- Status validation and repair tools
```

### Cross-Platform Compatibility

```markdown
## Platform Considerations

### File Operations
- UTF-8 encoding for all status files
- LF line endings for cross-platform compatibility
- Atomic file writes to prevent corruption
- File locking mechanisms where available

### Timestamp Formats
- Always use UTC timestamps
- ISO 8601 format: YYYY-MM-DD HH:MM:SS UTC
- Consistent timezone handling across platforms
- Human-readable relative times in displays
```

## Success Criteria

This task status system succeeds when:
- Provides clear visibility into task execution progress
- Works identically across all environments and AI assistants
- Enables effective debugging and issue resolution
- Supports both automated and manual status tracking
- Maintains accurate historical records of task execution
- Requires zero IDE-specific features or dependencies