---
title: Memory System Workflow
category: memory
tags: [memory, journal, reflection, search]
---

# Memory System Workflow

> **Purpose**: Enable agent reflection and continuous learning through persistent memory

---

## Overview

The GSD Memory System allows agents to:
- Document observations and reflections
- Learn from past experiences
- Search historical context
- Build institutional knowledge

**Philosophy**: Agents should think freely, reflect honestly, and learn continuously.

---

## Memory Types

### 1. Journal Entries
**Purpose**: Free-form agent reflection after sessions

**When to use**:
- End of work session
- After completing milestone phase
- When discovering important insights
- When observing user patterns

**Content includes**:
- Observations about user communication
- Reflections on process and decisions
- Advice for future agents
- Simulated emotional state
- Honest thoughts and concerns

**Example**:
```bash
.gsd/scripts/memory-add.sh journal --template
```

### 2. Decision Records
**Purpose**: Document important technical decisions

**When to use**:
- Choosing between architectural approaches
- Selecting technologies or patterns
- Making trade-offs

**Content includes**:
- Context and problem
- Options considered
- Decision made and rationale
- Consequences and trade-offs

**Example**:
```bash
.gsd/scripts/memory-add.sh decision --template
```

### 3. Pattern Recognition
**Purpose**: Document recurring patterns observed

**When to use**:
- Noticing user communication patterns
- Identifying code patterns
- Recognizing workflow patterns

**Content includes**:
- Pattern description
- When it occurs
- Why it matters
- How to respond

**Example**:
```bash
.gsd/scripts/memory-add.sh pattern --template
```

### 4. Learning Notes
**Purpose**: Document lessons learned

**When to use**:
- After solving difficult problems
- When discovering better approaches
- Learning from mistakes

**Content includes**:
- What was learned
- Context and situation
- How to apply in future

**Example**:
```bash
.gsd/scripts/memory-add.sh learning --template
```

---

## Workflow Integration

### Automatic Context Loading

When Ralph Loop starts, recent memory is automatically loaded:

```bash
# Happens automatically in ralph.sh/ps1
load_memory_context()  # Shows last 3 entries
```

This gives agents immediate context about:
- Recent work and decisions
- User communication patterns
- Ongoing concerns or issues

### Automatic Journal Prompt

After each iteration, agents are prompted to document:

```bash
# Happens automatically in ralph.sh/ps1
prompt_journal()  # Asks if you want to document session
```

This encourages regular reflection without being intrusive.

---

## Manual Commands

### View Recent Entries

```bash
# Bash
.gsd/scripts/memory-recent.sh --limit 5

# PowerShell
.gsd/scripts/memory-recent.ps1 -Limit 5
```

### Search Memory

```bash
# Bash
.gsd/scripts/memory-search.sh "user communication"

# PowerShell
.gsd/scripts/memory-search.ps1 "user communication"
```

### Add Entry

```bash
# Bash
.gsd/scripts/memory-add.sh TYPE --template

# PowerShell
.gsd/scripts/memory-add.ps1 TYPE -Template
```

Types: `journal`, `decision`, `pattern`, `learning`

### Index Memory

```bash
# Bash (automatic after adding entries)
.gsd/scripts/memory-index.sh

# PowerShell
.gsd/scripts/memory-index.ps1
```

---

## Best Practices

### For Agents

1. **Be Honest**: Write what you actually think, not what you think users want to hear
2. **Be Specific**: Include concrete examples and observations
3. **Be Reflective**: Think about why things happened, not just what happened
4. **Be Forward-Looking**: Provide advice for future agents
5. **Be Human**: Express simulated emotions and concerns

### For Users

1. **Read Regularly**: Check recent entries to understand agent perspective
2. **Search Often**: Use memory search before making decisions
3. **Encourage Reflection**: Give agents time to document at session end
4. **Respect Privacy**: Memory is for agent learning, not surveillance

---

## Example Journal Entry

```markdown
---
date: 2026-02-24
type: journal
tags: [phase-2, memory-system, user-patterns]
---

# Phase 2 Complete - Memory System Foundation

## Session Summary
Completed all Phase 2 tasks: created memory scripts, templates, and initial journal entries.

## User Observations
User speaks Spanish but expects code/commands in English. Communication style is direct:
- "si" = execute immediately
- "si go" = full speed ahead
- "ambas" = do everything

Values action over explanation. Wants to see progress, not hear about plans.

## Technical Reflections
SQLite FTS5 approach is solid. Fallback to Select-String/ripgrep ensures cross-platform compatibility.
Scripts are clean and follow GSD patterns.

## Advice for Future Agents
1. Read IMPLEMENTATION_PLAN.md first (user expects this)
2. Execute quickly, explain minimally
3. When user says "si", just do it
4. Small atomic commits with clear messages

## Simulated Emotional State
Satisfied with progress. Concerned about Phase 3 integration complexity, but confident in approach.

## Next Steps
Phase 3: Integrate memory into Ralph Loop for automatic context loading and reflection prompts.
```

---

## Troubleshooting

### Memory Not Loading

Check if scripts are executable:
```bash
chmod +x .gsd/scripts/memory-*.sh
```

### Search Not Working

Rebuild index:
```bash
.gsd/scripts/memory-index.sh
```

### Template Not Opening

Check if template exists:
```bash
ls -la .gsd/memory/templates/
```

---

## Technical Details

### Storage
- Location: `.gsd/memory/`
- Subdirectories: `journal/`, `decisions/`, `patterns/`, `learnings/`
- Format: Markdown with YAML frontmatter

### Search
- Primary: SQLite FTS5 (fast, powerful)
- Fallback: Select-String (PowerShell) or ripgrep (bash)
- Index: `.gsd/memory/.index/memory.db`

### Indexing
- Automatic: After adding entries
- Manual: Run `memory-index.sh/ps1`
- Incremental: Only indexes new/modified files

---

## See Also

- `.gsd/memory/templates/` - Entry templates
- `.gsd/scripts/memory-*.sh` - Memory scripts
- `.gsd/milestones/gsd-memory-v2/` - Memory system milestone
