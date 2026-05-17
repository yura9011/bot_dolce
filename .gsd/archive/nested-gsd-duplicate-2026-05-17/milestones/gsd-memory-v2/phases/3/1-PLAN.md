# Phase 3: Agent Integration

> **Goal**: Integrate memory system into Ralph Loop for automatic context loading and reflection

---

## Objective

Make memory system seamless and automatic:
- Auto-load context at session start
- Auto-prompt for reflection at session end
- Integrate into Ralph Loop workflow
- Make it invisible but powerful

**Philosophy**: Agents shouldn't have to remember to use memory - it should just work.

---

## Integration Points

### 1. Session Start (Auto-Load Context)
When Ralph Loop starts, automatically:
- Load recent journal entries (last 3)
- Show summary to agent
- Inject into context

### 2. Session End (Auto-Prompt Reflection)
When Ralph Loop completes iteration, automatically:
- Prompt agent to write journal entry
- Provide template
- Save and index

### 3. Before Decisions (Auto-Search)
When agent is about to make important decision:
- Search for related decisions
- Show relevant patterns
- Inform current decision

---

## Tasks

### Task 1: Update Ralph Scripts with Memory Loading
**Estimated Time**: 1 hour

**Files to update**:
- `.gsd/scripts/ralph.sh`
- `.gsd/scripts/ralph.ps1`
- `.gsd/scripts/loop.sh`
- `.gsd/scripts/loop.ps1`

**Changes**:
Add at start of loop:
```bash
# Load recent memory context
if [[ -x ".gsd/scripts/memory-recent.sh" ]]; then
    echo "Loading recent context..."
    .gsd/scripts/memory-recent.sh --limit 3 > /tmp/memory-context.txt
    
    # Show to user
    cat /tmp/memory-context.txt
fi
```

**Validation**:
- [ ] Context loads at session start
- [ ] Shows last 3 entries
- [ ] Works on both platforms

---

### Task 2: Add Memory Prompt at Session End
**Estimated Time**: 45 minutes

**Changes**:
Add at end of iteration:
```bash
# Prompt for journal entry
echo ""
echo "Would you like to document this session? (y/n)"
read -r response

if [[ "$response" == "y" ]]; then
    .gsd/scripts/memory-add.sh journal --template
fi
```

**Validation**:
- [ ] Prompts after iteration
- [ ] Opens template if yes
- [ ] Skips if no
- [ ] Works on both platforms

---

### Task 3: Create Memory Workflow
**Estimated Time**: 30 minutes

**File**: `.gsd/workflows/memory.md`

**Content**:
- How to use memory system
- When to write entries
- How to search
- Examples

**Validation**:
- [ ] Workflow documented
- [ ] Examples clear
- [ ] Follows GSD patterns

---

### Task 4: Update AGENTS.md
**Estimated Time**: 15 minutes

**Add section**:
```markdown
## Memory System

- View recent: `.gsd/scripts/memory-recent.sh`
- Search: `.gsd/scripts/memory-search.sh "query"`
- Add entry: `.gsd/scripts/memory-add.sh TYPE --template`
- Types: journal, decision, pattern, learning
```

**Validation**:
- [ ] Commands documented
- [ ] Under 60 lines total
- [ ] Clear and concise

---

### Task 5: Test Complete Workflow
**Estimated Time**: 30 minutes

**Test scenario**:
1. Start Ralph Loop
2. Verify context loads
3. Complete a task
4. Verify journal prompt
5. Write journal entry
6. Verify entry indexed
7. Search for entry
8. Verify found

**Validation**:
- [ ] All steps work
- [ ] No errors
- [ ] Smooth experience

---

### Task 6: Create Example Pattern Entry
**Estimated Time**: 20 minutes

**Purpose**: Demonstrate pattern detection

**Content**: Document user communication pattern

**Validation**:
- [ ] Pattern entry created
- [ ] Indexed
- [ ] Searchable

---

## Success Criteria

- [ ] Memory loads automatically at session start
- [ ] Journal prompt appears at session end
- [ ] Workflow documented
- [ ] AGENTS.md updated
- [ ] Complete workflow tested
- [ ] Example pattern created
- [ ] All scripts work seamlessly

---

## Estimated Time

**Total**: 3-4 hours

- Task 1: 1 hour
- Task 2: 45 minutes
- Task 3: 30 minutes
- Task 4: 15 minutes
- Task 5: 30 minutes
- Task 6: 20 minutes
- Buffer: 30 minutes

---

## Dependencies

- Phase 2 complete (memory system functional)
- Ralph Loop scripts working
- All memory scripts operational

---

## Risks

1. **Interrupting workflow**: Mitigated by making prompts optional
2. **Too much output**: Mitigated by limiting to 3 recent entries
3. **Performance**: Mitigated by fast scripts

---

## Next Phase

After Phase 3 completion, proceed to Phase 4: Testing & Documentation
