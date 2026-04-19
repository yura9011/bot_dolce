# Emoji Replacement Map

## Reason for Removal

Emojis cause cross-platform compatibility issues:
- **Encoding**: Require UTF-8, fail on systems with different encoding
- **Bash/PowerShell**: Can cause parsing errors in scripts
- **Grep/Select-String**: May not match correctly
- **File names**: Some systems don't support emojis in filenames
- **Terminal output**: Fail on terminals without UTF-8 support
- **Git diffs**: Can cause display issues

For a universal framework, ASCII characters are more reliable.

## Complete Emoji List Found

### Status Indicators
| Emoji | ASCII Replacement | Usage |
|-------|-------------------|-------|
| ✅ | [OK] or [DONE] | Completed tasks, success |
| ✓ | [OK] | Completed, validated |
| ❌ | [FAIL] or [ERROR] | Failed tasks, errors |
| ✗ | [FAIL] | Failed validation |
| ⚠️ | [WARN] | Warnings, cautions |
| ❓ | [QUESTION] | Questions, unknowns |

### Priority Levels
| Emoji | ASCII Replacement | Usage |
|-------|-------------------|-------|
| 🔴 | [CRITICAL] or [HIGH] | High priority, critical |
| 🟡 | [MEDIUM] | Medium priority |
| 🟢 | [LOW] or [OK] | Low priority, optional |

### Progress Indicators
| Emoji | ASCII Replacement | Usage |
|-------|-------------------|-------|
| ⏳ | [IN-PROGRESS] | Work in progress |
| ⏸ | [PAUSED] | Paused, queued |
| ► | [NEXT] | Next step, continue |

### Symbols
| Emoji | ASCII Replacement | Usage |
|-------|-------------------|-------|
| 💾 | [SAVE] | Save state |
| 🔒 | [LOCK] | Planning lock |
| 🧹 | [CLEAN] | Context hygiene |
| 📋 | [NOTE] | Notes, lists |
| 💡 | [TIP] | Tips, suggestions |
| 🎯 | [GOAL] | Goals, objectives |

## Files Containing Emojis

### High Priority (Core Documentation)
1. `STATE.md` - Project state
2. `.gsd/protocols/README.md` - Protocol overview
3. `.gsd/protocols/parallel.md` - Parallel processing
4. `.gsd/milestones/gsd-universal/phases/2/SUMMARY.md` - Phase 2 summary

### Medium Priority (Workflows)
5. `.gsd/workflows/plan-milestone-gaps.md`
6. `.gsd/workflows/list-phase-assumptions.md`
7. `.gsd/workflows/check-todos.md`

### Low Priority (Templates & Examples)
8. `.gsd/templates/todo.md`
9. `.gsd/examples/quick-reference.md`

### Archive (Already Archived)
10. `.gsd/archive/FILE-STRUCTURE-AUDIT.md`
11. `.gsd/archive/KIRO-CONTENT-ANALYSIS.md`
12. `.gsd/milestones/gsd-universal/phases/1/AUDIT.md`

## Replacement Strategy

### Phase 1: Core Files (Immediate)
Replace emojis in:
- STATE.md
- .gsd/protocols/*.md
- .gsd/milestones/gsd-universal/phases/2/SUMMARY.md

### Phase 2: Workflows (Next)
Replace emojis in:
- .gsd/workflows/*.md

### Phase 3: Templates & Examples (Optional)
Replace emojis in:
- .gsd/templates/*.md
- .gsd/examples/*.md

### Phase 4: Archive (Low Priority)
Archive files can keep emojis (not actively used).

## Replacement Examples

### Before:
```markdown
✅ Task completed successfully
❌ Validation failed
🔴 Critical issue found
```

### After:
```markdown
[OK] Task completed successfully
[FAIL] Validation failed
[CRITICAL] Critical issue found
```

### Before (in tables):
```markdown
| Priority | Icon |
|----------|------|
| High | 🔴 |
| Medium | 🟡 |
| Low | 🟢 |
```

### After (in tables):
```markdown
| Priority | Indicator |
|----------|-----------|
| High | [CRITICAL] |
| Medium | [MEDIUM] |
| Low | [LOW] |
```

## Total Count

- **Emojis found**: ~200+ instances
- **Files affected**: ~15 files
- **Priority files**: 7 files
- **Archive files**: 3 files (can skip)

## Next Steps

1. Replace emojis in STATE.md
2. Replace emojis in .gsd/protocols/*.md
3. Replace emojis in Phase 2 summary
4. Replace emojis in workflows
5. Commit changes
6. Verify no emojis remain in active files
