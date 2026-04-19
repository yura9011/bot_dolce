# Phase [N] - Plan [M]

**Phase**: [Phase N: Name]
**Plan Number**: [M]
**Created**: [Date]
**Wave**: [Wave number for execution grouping]

---

## Goal
[What this plan accomplishes in 1-2 sentences]

---

## Prerequisites
- [ ] [Dependency 1 - e.g., "Phase 1 complete"]
- [ ] [Dependency 2 - e.g., "Database schema created"]
- [ ] [Dependency 3]

---

## Tasks

### Task 1: [Task Name]

**Description**: [What needs to be done]

**Files to Modify**:
- `path/to/file1.ext`
- `path/to/file2.ext`

**Changes**:
```
- [Specific change 1]
- [Specific change 2]
- [Specific change 3]
```

**Implementation Notes**:
[Any important details about how to implement]

**Verification**:
- [ ] [How to verify this task - e.g., "Run tests pass"]
- [ ] [Verification step 2 - e.g., "API returns 200"]

---

### Task 2: [Task Name]

**Description**: [What needs to be done]

**Files to Modify**:
- `path/to/file3.ext`

**Changes**:
```
- [Specific change 1]
- [Specific change 2]
```

**Verification**:
- [ ] [How to verify]

---

### Task 3: [Task Name]

**Description**: [What needs to be done]

**Files to Create**:
- `path/to/new-file.ext`

**Content**:
```
[High-level description of what goes in the file]
```

**Verification**:
- [ ] [How to verify]

---

## Success Criteria

- [ ] [Measurable criterion 1]
- [ ] [Measurable criterion 2]
- [ ] [Measurable criterion 3]

---

## Rollback Plan

If this plan fails:
1. [Rollback step 1]
2. [Rollback step 2]

---

## Estimated Effort
[Small | Medium | Large] - [Reasoning]

---

## XML Structure

```xml
<plan id="phase-N-plan-M" wave="N">
  <goal>What this accomplishes</goal>
  
  <prerequisites>
    <item>Dependency 1</item>
    <item>Dependency 2</item>
  </prerequisites>
  
  <tasks>
    <task id="1">
      <name>Task Name</name>
      <description>What needs to be done</description>
      <files>
        <modify>path/to/file1.ext</modify>
        <modify>path/to/file2.ext</modify>
      </files>
      <changes>
        <change>Specific change 1</change>
        <change>Specific change 2</change>
      </changes>
      <verification>
        <check>Verification step 1</check>
        <check>Verification step 2</check>
      </verification>
    </task>
    
    <task id="2">
      <name>Task Name</name>
      <description>What needs to be done</description>
      <files>
        <modify>path/to/file3.ext</modify>
      </files>
      <changes>
        <change>Specific change 1</change>
      </changes>
      <verification>
        <check>Verification step</check>
      </verification>
    </task>
  </tasks>
  
  <success_criteria>
    <criterion>Measurable criterion 1</criterion>
    <criterion>Measurable criterion 2</criterion>
  </success_criteria>
</plan>
```
