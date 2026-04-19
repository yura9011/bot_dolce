# Universal Task Queue Template

## Overview

This template provides a standardized format for managing task queues in any environment with any AI assistant, using only markdown files and standard operations.

## Task Queue Structure

```
.gsd/tasks/
├── queue.md          # Tasks waiting to be executed
├── in-progress.md    # Currently executing tasks
├── completed.md      # Successfully finished tasks
├── failed.md         # Tasks that failed with error details
└── status.md         # Overall execution status and progress
```

## Task Definition Template

Copy this template for each new task:

```markdown
## Task: {unique-id}
- **Type**: {research|implementation|verification|documentation}
- **Priority**: {high|medium|low}
- **Dependencies**: {comma-separated task IDs or "none"}
- **Assigned**: {ai-assistant|human|auto}
- **Status**: {queued|in-progress|completed|failed}
- **Created**: {YYYY-MM-DD HH:MM:SS UTC}
- **Updated**: {YYYY-MM-DD HH:MM:SS UTC}
- **Estimated Duration**: {minutes}

### Description
{Clear, actionable description of what needs to be done}

### Context Files
- {file1.md} - {brief description}
- {file2.js} - {brief description}
- {directory/} - {brief description}

### Prerequisites
- [ ] {prerequisite 1}
- [ ] {prerequisite 2}

### Success Criteria
- [ ] {measurable outcome 1}
- [ ] {measurable outcome 2}
- [ ] {measurable outcome 3}

### Verification Commands
```bash
# Commands to verify task completion
{command1}
{command2}
```

### Results
{This section filled when task completes}
- **Completed**: {timestamp}
- **Duration**: {actual minutes}
- **Output Files**: {list of created/modified files}
- **Notes**: {any important observations}

### Errors (if failed)
- **Error**: {error description}
- **Cause**: {root cause analysis}
- **Retry Strategy**: {how to fix and retry}
```

## Queue Management Operations

### Adding a New Task

1. **Create task entry** in `queue.md` using template above
2. **Assign unique ID** (format: `task-YYYYMMDD-NNN`)
3. **Set dependencies** based on other task IDs
4. **Estimate duration** for planning purposes
5. **Update status.md** with new task count

### Moving Tasks Between States

#### From Queue to In-Progress
1. Cut task block from `queue.md`
2. Paste into `in-progress.md`
3. Update task status to "in-progress"
4. Update timestamp in "Updated" field
5. Update `status.md` with current counts

#### From In-Progress to Completed
1. Fill "Results" section with outcomes
2. Cut task block from `in-progress.md`
3. Paste into `completed.md`
4. Update task status to "completed"
5. Update timestamp and duration
6. Update `status.md` with progress

#### From In-Progress to Failed
1. Fill "Errors" section with details
2. Cut task block from `in-progress.md`
3. Paste into `failed.md`
4. Update task status to "failed"
5. Create retry task if appropriate
6. Update `status.md` with failure count

## Execution Patterns

### Sequential Execution (Universal)
```markdown
## Sequential Task Processing

1. **Initialize**: Create task directory structure
2. **Load Queue**: Read all tasks from queue.md
3. **Sort by Priority**: High → Medium → Low
4. **Check Dependencies**: Only start tasks with satisfied dependencies
5. **Execute One Task**: Move to in-progress, execute, move to completed/failed
6. **Update Status**: Refresh status.md after each task
7. **Repeat**: Continue until queue empty

### Progress Indicators
- Show current task being executed
- Display completed/total task count
- Estimate remaining time based on completed tasks
- Provide clear error messages for failed tasks
```

### Parallel Execution (When Available)
```markdown
## Parallel Task Processing

1. **Initialize**: Create task directory structure
2. **Load Queue**: Read all tasks from queue.md
3. **Group by Dependencies**: Create execution waves
4. **Execute Wave**: Start all independent tasks in parallel
5. **Monitor Progress**: Track completion of parallel tasks
6. **Synchronize**: Wait for wave completion before next wave
7. **Update Status**: Aggregate results from parallel execution

### Coordination Mechanisms
- File-based status updates for each parallel task
- Atomic file operations to prevent conflicts
- Clear error isolation between parallel tasks
- Result aggregation after wave completion
```

### Manual Execution (Human Fallback)
```markdown
## Manual Task Coordination

When AI coordination is unavailable:

1. **Review Queue**: Human reads queue.md for task list
2. **Select Task**: Choose next task based on dependencies and priority
3. **Execute Manually**: Follow task description and success criteria
4. **Update Status**: Manually move task between files
5. **Document Results**: Fill results section with outcomes
6. **Verify Completion**: Run verification commands
7. **Continue**: Repeat for next task

### Human-Friendly Format
- Clear, step-by-step instructions in each task
- Verification commands that can be copy-pasted
- Success criteria that are easy to check manually
- Error handling instructions for common issues
```

## Status Tracking Template

Use this template for `status.md`:

```markdown
# Task Execution Status

## Summary
- **Total Tasks**: {number}
- **Completed**: {number} ({percentage}%)
- **In Progress**: {number}
- **Failed**: {number}
- **Remaining**: {number}

## Current Execution
- **Mode**: {sequential|parallel|manual}
- **Current Task**: {task-id or "none"}
- **Started**: {timestamp}
- **Estimated Completion**: {timestamp}

## Progress Timeline
- {HH:MM} - {event description}
- {HH:MM} - {event description}
- {HH:MM} - {event description}

## Performance Metrics
- **Average Task Duration**: {minutes}
- **Success Rate**: {percentage}%
- **Total Execution Time**: {minutes}

## Next Steps
- [ ] {next action 1}
- [ ] {next action 2}

## Issues and Blockers
- {issue description and resolution plan}
```

## Integration with GSD Workflows

### Execute Workflow Integration
```markdown
## Using Task Queue in /execute

1. **Phase Planning**: Break phase into tasks using this template
2. **Queue Population**: Add all phase tasks to queue.md
3. **Wave Organization**: Group tasks by dependencies
4. **Execution**: Use appropriate execution pattern (sequential/parallel/manual)
5. **Verification**: Aggregate task results for phase verification
```

### Research Workflow Integration
```markdown
## Using Task Queue in /research-phase

1. **Research Breakdown**: Split research into focused investigation tasks
2. **Task Creation**: Create research tasks with specific questions
3. **Parallel Research**: Execute research tasks independently
4. **Result Aggregation**: Combine findings into RESEARCH.md
```

## Cross-Platform Compatibility

### File Operations
- Use UTF-8 encoding for all task files
- Use LF line endings for cross-platform compatibility
- Avoid special characters in task IDs
- Use relative paths for file references

### Command Compatibility
- Provide both bash and PowerShell verification commands
- Use cross-platform tools when possible
- Include manual verification steps as fallback
- Test commands on multiple platforms

## Success Criteria

This task queue system succeeds when:
- Works identically in any environment (terminal, IDE, web)
- Provides clear task coordination with any AI assistant
- Supports both automated and manual task execution
- Maintains visibility into task progress and status
- Requires zero IDE-specific features
- Enables confident multi-task management anywhere