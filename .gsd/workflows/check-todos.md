---
description: List all pending todo items
argument-hint: "[--all] [--priority high|medium|low]"
---

# /check-todos Workflow

<objective>
Display pending todo items, optionally filtered by priority or status.
</objective>

<context>
**Flags:**
- `--all` — Show completed items too
- `--priority high|medium|low` — Filter by priority

**Input:**
- `.gsd/TODO.md` — Todo items
</context>

<process>

## 1. Load TODO.md

```powershell
if (-not (Test-Path ".gsd/TODO.md")) {
    Write-Output "No todos found. Use /add-todo to create one."
    exit
}

Get-Content ".gsd/TODO.md"
```

---

## 2. Parse and Filter

Count items by status:
- `- [ ]` = pending
- `- [x]` = complete

Filter by priority if flag provided.

---

## 3. Display

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► TODOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PENDING ({N} items)
───────────────────
[CRITICAL] {high priority item}
[MEDIUM] {medium priority item}
[LOW] {low priority item}

{If --all flag:}
COMPLETED ({M} items)
─────────────────────
✅ {completed item}

───────────────────────────────────────────────────────

/add-todo <item> — add new item

───────────────────────────────────────────────────────
```

</process>

<priority_indicators>
| Priority | Indicator |
|----------|-----------|
| high | [CRITICAL] |
| medium | [MEDIUM] |
| low | [LOW] |
| done | [DONE] |
</priority_indicators>
