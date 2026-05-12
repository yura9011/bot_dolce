# Universal Parallel Processing Protocol

## Overview

This protocol defines universal patterns for coordinating multiple tasks that work in any environment with any AI assistant, using only file-based coordination and standard operations.

**Core Principles**: See `.gsd/protocols/README.md` for universal principles that apply to all protocols.

**Shell Patterns**: See `.gsd/examples/shell-patterns.md` for reusable code examples.

## Task Coordination Patterns

### File-Based Task Queue

Tasks are managed through standardized markdown files in `.gsd/tasks/` directory:

```
.gsd/tasks/
├── queue.md          # Active task queue
├── in-progress.md    # Currently executing tasks
├── completed.md      # Finished tasks with results
└── failed.md         # Failed tasks with error details
```

### Task Definition Format

Each task follows this standard format:

```markdown
## Task: {unique-id}
- **Type**: {research|implementation|verification|documentation}
- **Priority**: {high|medium|low}
- **Dependencies**: {comma-separated task IDs}
- **Assigned**: {ai-assistant|human|auto}
- **Status**: {queued|in-progress|completed|failed}
- **Created**: {timestamp}
- **Updated**: {timestamp}

### Description
{Clear description of what needs to be done}

### Context Files
- {list of relevant files to read}

### Success Criteria
- [ ] {measurable outcome 1}
- [ ] {measurable outcome 2}

### Results
{filled when task completes}
```

## Execution Patterns

### Pattern 1: Parallel Execution (When Available)

For AI assistants that support parallel processing:

1. **Task Distribution**: Split work into independent tasks
2. **Concurrent Execution**: Execute tasks simultaneously
3. **Status Synchronization**: Update status files as tasks complete
4. **Result Aggregation**: Combine results when all tasks finish

### Pattern 2: Sequential Execution (Universal Fallback)

For any environment:

1. **Task Ordering**: Sort tasks by dependencies and priority
2. **Sequential Processing**: Execute one task at a time
3. **Progress Tracking**: Update status after each task
4. **Clear Indicators**: Show progress to user throughout execution

### Pattern 3: Manual Coordination (Human Fallback)

When AI coordination unavailable:

1. **Task Breakdown**: Provide clear task list with instructions
2. **Manual Execution**: Human executes tasks following guidelines
3. **Status Updates**: Human updates status files manually
4. **Verification**: Clear checkpoints to verify completion

## Cross-Platform Implementation

**Complete implementation examples**: See `.gsd/examples/shell-patterns.md` for:
- Task queue initialization (bash and PowerShell)
- Add task functions
- Move task between states
- Progress tracking patterns

**Quick reference**:
```bash
# Bash: Initialize and add task
mkdir -p .gsd/tasks
echo "# Task Queue" > .gsd/tasks/queue.md
```

```powershell
# PowerShell: Initialize and add task
New-Item -ItemType Directory -Path .gsd/tasks -Force
"# Task Queue" | Out-File .gsd/tasks/queue.md -Encoding UTF8
```

## Workflow Integration Patterns

**Traditional approach** (IDE-specific):
```
invokeSubAgent({ name: "research-agent", prompt: "Research X" })
```

**Universal pattern**:
```
1. Create research task in queue.md
2. Execute research following task template
3. Document findings in task results
4. Move task to completed.md
5. Aggregate results for main workflow
```

**See also**: `.gsd/lib/task-queue.md` for task template format.

## Status Tracking

**Progress indicators**: See `.gsd/examples/shell-patterns.md` for progress tracking patterns.

**Example output**:
```
=== Task Execution Progress ===
[OK] Task 1: File structure analysis (completed)
[IN-PROGRESS] Task 2: Dependency mapping (in progress)  
[PAUSED] Task 3: Architecture docs (queued)
[FAIL] Task 4: Performance analysis (failed)

3/4 tasks processed, 1 remaining
```

**Status file format**: See `.gsd/lib/task-status.md` for complete template.

## Error Handling

**Standard error messages**: See `.gsd/examples/shell-patterns.md` for graceful degradation patterns.

**Key scenarios**:
- Parallel processing unavailable → Switch to sequential execution
- AI coordination fails → Provide manual task list
- File system restricted → Use git-based coordination

## Integration with GSD Workflows

**Execute workflow**: Use parallel.md for wave-based execution with task coordination.

**Verify workflow**: Break verification into independent checks using task queue.

**Map workflow**: Coordinate codebase analysis tasks (file structure, dependencies, architecture).

**Research workflow**: Coordinate research tasks with results aggregation.

**Example**:
```markdown
## Wave-Based Execution
1. Initialize task queue: `.gsd/tasks/queue.md`
2. Add wave tasks to queue
3. Execute (parallel if available, sequential otherwise)
4. Verify wave completion before proceeding
```

**See also**: `.gsd/workflows/execute.md`, `.gsd/workflows/map.md`, `.gsd/workflows/research-phase.md` for complete integration.

## Success Criteria

This protocol succeeds when:
- Works identically in any environment (terminal, IDE, web)
- Provides clear coordination with or without parallel processing
- Maintains task visibility and progress tracking
- Enables confident multi-task execution anywhere
- Requires zero IDE-specific features
- Supports both AI and human task execution

**See also**: `.gsd/protocols/README.md` for common success criteria across all protocols.