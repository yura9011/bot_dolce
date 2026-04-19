# Phase 2: Memory System Foundation

> **Goal**: Implement automatic memory system with agent reflection and learning

---

## Objective

Create a memory system where agents can:
- Reflect freely on sessions (journal)
- Document technical decisions
- Detect and record patterns
- Share learnings with future agents
- Express observations about users
- Build knowledge over time

**Philosophy**: Give agents a space to "think out loud" and learn.

---

## Memory Types

### 1. Journal (Free Reflection)
**Purpose**: Agent's personal space for reflection

**Content**:
- Session summaries
- What went well/poorly
- Observations about the user
- Learnings (technical and social)
- Advice for future agents
- Simulated emotional state
- Honest thoughts

**Tone**: Personal, honest, reflective

### 2. Decisions (Technical)
**Purpose**: Document architectural choices

**Content**:
- Decision made
- Context and alternatives
- Rationale
- Impact

**Tone**: Professional, factual

### 3. Patterns (Detected Behaviors)
**Purpose**: Learn user preferences and workflows

**Content**:
- Pattern description
- Confidence level
- Examples
- How to apply

**Tone**: Analytical, helpful

### 4. Learnings (Technical Knowledge)
**Purpose**: Share technical discoveries

**Content**:
- What was learned
- Why it matters
- How to apply
- Gotchas

**Tone**: Educational, practical

---

## File Structure

```
.gsd/memory/
├── journal/              # Agent reflections
│   └── YYYY-MM-DD-session-N.md
├── decisions/            # Technical decisions
│   └── YYYY-MM-DD-topic.md
├── patterns/             # Detected patterns
│   └── pattern-name.md
├── learnings/            # Technical learnings
│   └── topic.md
├── index.db              # SQLite FTS5 search
└── config.json           # Configuration
```

---

## Tasks

### Task 1: Create Memory Directory Structure
**Estimated Time**: 10 minutes

```bash
mkdir -p .gsd/memory/journal
mkdir -p .gsd/memory/decisions
mkdir -p .gsd/memory/patterns
mkdir -p .gsd/memory/learnings
```

**Validation**:
- [ ] All directories exist
- [ ] Correct permissions

---

### Task 2: Create Memory Entry Templates
**Estimated Time**: 30 minutes

**Files to create**:
- `.gsd/memory/templates/journal.md`
- `.gsd/memory/templates/decision.md`
- `.gsd/memory/templates/pattern.md`
- `.gsd/memory/templates/learning.md`

**Validation**:
- [ ] All templates exist
- [ ] Templates have clear structure
- [ ] Examples included

---

### Task 3: Create memory-add Scripts
**Estimated Time**: 1 hour

**Files**:
- `.gsd/scripts/memory-add.sh`
- `.gsd/scripts/memory-add.ps1`

**Functionality**:
- Accept type (journal, decision, pattern, learning)
- Accept content (markdown)
- Generate filename with timestamp
- Write to appropriate directory
- Trigger indexing

**Validation**:
- [ ] Scripts work on both platforms
- [ ] Files created correctly
- [ ] Timestamps accurate

---

### Task 4: Create SQLite FTS5 Indexing
**Estimated Time**: 1.5 hours

**Files**:
- `.gsd/scripts/memory-index.sh`
- `.gsd/scripts/memory-index.ps1`

**Functionality**:
- Create SQLite database with FTS5
- Index all memory files
- Extract metadata (date, type, tags)
- Fast full-text search

**Schema**:
```sql
CREATE VIRTUAL TABLE memory USING fts5(
    filename,
    type,
    date,
    tags,
    content
);
```

**Validation**:
- [ ] Database created
- [ ] All files indexed
- [ ] Search works
- [ ] Fast (<100ms)

---

### Task 5: Create memory-search Scripts
**Estimated Time**: 1 hour

**Files**:
- `.gsd/scripts/memory-search.sh`
- `.gsd/scripts/memory-search.ps1`

**Functionality**:
- Search by query
- Filter by type
- Filter by date range
- Filter by tags
- Return ranked results

**Usage**:
```bash
# Search all
./memory-search.sh "bash decision"

# Search journal only
./memory-search.sh "user communication" --type journal

# Search date range
./memory-search.sh "migration" --from 2026-02-20 --to 2026-02-25
```

**Validation**:
- [ ] Search works
- [ ] Filters work
- [ ] Results ranked by relevance
- [ ] Fast results

---

### Task 6: Create memory-recent Script
**Estimated Time**: 30 minutes

**Files**:
- `.gsd/scripts/memory-recent.sh`
- `.gsd/scripts/memory-recent.ps1`

**Functionality**:
- Show N most recent entries
- Filter by type
- Show summary or full content

**Usage**:
```bash
# Last 5 entries
./memory-recent.sh

# Last 10 journal entries
./memory-recent.sh --type journal --limit 10
```

**Validation**:
- [ ] Shows recent entries
- [ ] Sorted by date
- [ ] Filters work

---

### Task 7: Create First Journal Entry
**Estimated Time**: 15 minutes

**Purpose**: Test the system and document Phase 1

**Content**: Reflection on Phase 1 completion
- What we accomplished
- How the migration went
- Observations about the user
- Learnings
- Advice for future agents

**Validation**:
- [ ] Entry created
- [ ] Indexed
- [ ] Searchable

---

### Task 8: Update PROMPT Files
**Estimated Time**: 45 minutes

**Files to update**:
- `.gsd/config/PROMPT_build.md`
- `.gsd/config/PROMPT_plan.md`

**Add sections**:
- Auto-documentation protocol
- When to write journal entries
- When to document decisions
- When to record patterns
- How to use memory search

**Validation**:
- [ ] Prompts updated
- [ ] Clear instructions
- [ ] Examples included

---

## Success Criteria

- [ ] Memory directories created
- [ ] Templates available
- [ ] Scripts work (bash + PowerShell)
- [ ] SQLite FTS5 indexing works
- [ ] Search returns results in <100ms
- [ ] First journal entry created
- [ ] PROMPT files updated
- [ ] Documentation complete

---

## Estimated Time

**Total**: 5-6 hours

- Task 1: 10 minutes
- Task 2: 30 minutes
- Task 3: 1 hour
- Task 4: 1.5 hours
- Task 5: 1 hour
- Task 6: 30 minutes
- Task 7: 15 minutes
- Task 8: 45 minutes
- Buffer: 30 minutes

---

## Dependencies

- SQLite (already installed on all platforms)
- Bash or PowerShell
- Git

---

## Risks

1. **SQLite not available**: Mitigated by fallback to ripgrep
2. **Performance issues**: Mitigated by FTS5 optimization
3. **Complex queries**: Mitigated by simple search interface

---

## Next Phase

After Phase 2 completion, proceed to Phase 3: Agent Integration
