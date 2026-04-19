# Universal Codebase Intelligence Protocol

## Overview

This protocol defines a universal system for understanding and indexing codebases that works in any environment with any AI assistant, using only file-based storage and standard operations.

**Core Principle**: Build semantic understanding of codebase through automated analysis and persistent indexing, without requiring IDE-specific hooks.

---

## What is Codebase Intelligence?

**Purpose**: Enable AI assistants to understand your codebase structure, patterns, and conventions without manually exploring every file.

**Benefits**:
1. **Faster context loading** - AI reads summary instead of scanning all files
2. **Pattern detection** - Automatically identifies naming conventions, directory purposes
3. **Dependency awareness** - Knows what imports what, what depends on what
4. **Convention consistency** - AI follows detected patterns automatically
5. **Hotspot identification** - Finds frequently changed or highly connected files

**Original GSD Implementation** (Claude Code-specific):
- PostToolUse hook indexes files automatically after each edit
- Stores in `.planning/intel/` directory
- Injects summary into context at session start
- Requires IDE hooks (not universal)

**Universal Implementation** (This Protocol):
- Manual or scheduled indexing via scripts
- Stores in `.gsd/intel/` directory
- AI reads summary when needed
- Works in any environment

---

## Directory Structure

```
.gsd/intel/
├── index.json           # Complete exports/imports index
├── conventions.json     # Detected naming patterns and conventions
├── graph.json          # Dependency graph (who imports who)
├── summary.md          # Human-readable summary for AI context
├── hotspots.json       # Frequently changed or highly connected files
└── metadata.json       # Indexing metadata (last update, file count, etc.)
```

---

## File Formats

### 1. index.json - Exports and Imports Index

**Purpose**: Track what each file exports and what it imports.

**Format**:
```json
{
  "files": {
    "src/components/Button.tsx": {
      "path": "src/components/Button.tsx",
      "language": "typescript",
      "lastModified": "2026-01-21T10:30:00Z",
      "exports": [
        {
          "name": "Button",
          "type": "component",
          "kind": "default",
          "line": 15
        },
        {
          "name": "ButtonProps",
          "type": "interface",
          "kind": "named",
          "line": 5
        }
      ],
      "imports": [
        {
          "name": "React",
          "from": "react",
          "kind": "default",
          "line": 1
        },
        {
          "name": "cn",
          "from": "@/lib/utils",
          "kind": "named",
          "line": 2
        }
      ]
    },
    "src/lib/utils.ts": {
      "path": "src/lib/utils.ts",
      "language": "typescript",
      "lastModified": "2026-01-20T15:20:00Z",
      "exports": [
        {
          "name": "cn",
          "type": "function",
          "kind": "named",
          "line": 10
        },
        {
          "name": "formatDate",
          "type": "function",
          "kind": "named",
          "line": 20
        }
      ],
      "imports": [
        {
          "name": "clsx",
          "from": "clsx",
          "kind": "default",
          "line": 1
        }
      ]
    }
  },
  "totalFiles": 2,
  "lastIndexed": "2026-01-21T10:35:00Z"
}
```

**Key Fields**:
- `path`: Relative file path from project root
- `language`: Detected language (typescript, javascript, python, etc.)
- `lastModified`: File modification timestamp
- `exports`: What this file provides to others
- `imports`: What this file uses from others
- `type`: component, function, class, interface, type, constant, etc.
- `kind`: default, named, namespace
- `line`: Line number where defined

### 2. conventions.json - Detected Patterns

**Purpose**: Identify and document codebase conventions automatically.

**Format**:
```json
{
  "naming": {
    "components": {
      "pattern": "PascalCase",
      "examples": ["Button", "UserProfile", "DataTable"],
      "confidence": 0.95
    },
    "utilities": {
      "pattern": "camelCase",
      "examples": ["formatDate", "cn", "parseQuery"],
      "confidence": 0.98
    },
    "constants": {
      "pattern": "UPPER_SNAKE_CASE",
      "examples": ["API_URL", "MAX_RETRIES", "DEFAULT_TIMEOUT"],
      "confidence": 0.90
    },
    "types": {
      "pattern": "PascalCase",
      "suffix": "Props|Type|Config",
      "examples": ["ButtonProps", "UserType", "ApiConfig"],
      "confidence": 0.92
    }
  },
  "directories": {
    "src/components": {
      "purpose": "React components",
      "pattern": "One component per file",
      "fileNaming": "PascalCase.tsx",
      "confidence": 0.95
    },
    "src/lib": {
      "purpose": "Shared utilities and helpers",
      "pattern": "Utility functions",
      "fileNaming": "camelCase.ts",
      "confidence": 0.90
    },
    "src/hooks": {
      "purpose": "React hooks",
      "pattern": "Custom hooks with 'use' prefix",
      "fileNaming": "useCamelCase.ts",
      "confidence": 0.98
    }
  },
  "fileSuffixes": {
    ".test.ts": "Test files",
    ".spec.ts": "Specification files",
    ".stories.tsx": "Storybook stories",
    ".d.ts": "TypeScript declarations"
  },
  "importPatterns": {
    "@/": "Path alias for src/",
    "~/": "Path alias for root/",
    "../": "Relative imports (discouraged)"
  }
}
```

**Key Fields**:
- `pattern`: Detected naming pattern (PascalCase, camelCase, etc.)
- `examples`: Real examples from codebase
- `confidence`: 0.0-1.0 score (how consistent is this pattern)
- `purpose`: What this directory/pattern is for
- `suffix`: Common suffixes (Props, Type, Config, etc.)

### 3. graph.json - Dependency Graph

**Purpose**: Map relationships between files (who imports who).

**Format**:
```json
{
  "nodes": {
    "src/components/Button.tsx": {
      "id": "src/components/Button.tsx",
      "type": "component",
      "exports": ["Button", "ButtonProps"],
      "importedBy": [
        "src/components/Form.tsx",
        "src/pages/Home.tsx"
      ],
      "imports": [
        "src/lib/utils.ts"
      ],
      "depth": 2,
      "centrality": 0.75
    },
    "src/lib/utils.ts": {
      "id": "src/lib/utils.ts",
      "type": "utility",
      "exports": ["cn", "formatDate"],
      "importedBy": [
        "src/components/Button.tsx",
        "src/components/Card.tsx",
        "src/components/Input.tsx"
      ],
      "imports": [],
      "depth": 1,
      "centrality": 0.95
    }
  },
  "edges": [
    {
      "from": "src/components/Button.tsx",
      "to": "src/lib/utils.ts",
      "imports": ["cn"]
    },
    {
      "from": "src/components/Form.tsx",
      "to": "src/components/Button.tsx",
      "imports": ["Button"]
    }
  ],
  "clusters": [
    {
      "name": "UI Components",
      "files": [
        "src/components/Button.tsx",
        "src/components/Card.tsx",
        "src/components/Input.tsx"
      ]
    },
    {
      "name": "Utilities",
      "files": [
        "src/lib/utils.ts",
        "src/lib/helpers.ts"
      ]
    }
  ]
}
```

**Key Fields**:
- `nodes`: All files in the codebase
- `edges`: Import relationships (directed graph)
- `importedBy`: Files that import this file (dependents)
- `imports`: Files this file imports (dependencies)
- `depth`: Distance from leaf nodes (files with no dependencies)
- `centrality`: How "central" this file is (0.0-1.0, higher = more connected)
- `clusters`: Groups of related files

### 4. summary.md - AI Context Summary

**Purpose**: Human-readable summary that AI reads to understand codebase.

**Format**:
```markdown
# Codebase Intelligence Summary

**Last Updated**: 2026-01-21 10:35:00 UTC  
**Total Files**: 47 files indexed  
**Languages**: TypeScript (40), JavaScript (5), CSS (2)

## Project Structure

### Core Directories
- `src/components/` - React components (23 files)
  - Pattern: One component per file, PascalCase naming
  - Example: Button.tsx, UserProfile.tsx, DataTable.tsx
  
- `src/lib/` - Shared utilities (8 files)
  - Pattern: Utility functions, camelCase naming
  - Example: utils.ts, helpers.ts, api.ts
  
- `src/hooks/` - Custom React hooks (6 files)
  - Pattern: Hooks with 'use' prefix, camelCase
  - Example: useAuth.ts, useLocalStorage.ts, useDebounce.ts

- `src/pages/` - Page components (10 files)
  - Pattern: Route-based naming, PascalCase
  - Example: Home.tsx, Dashboard.tsx, Settings.tsx

## Naming Conventions

### Components
- **Pattern**: PascalCase
- **Confidence**: 95%
- **Examples**: Button, UserProfile, DataTable

### Utilities
- **Pattern**: camelCase
- **Confidence**: 98%
- **Examples**: formatDate, cn, parseQuery

### Types/Interfaces
- **Pattern**: PascalCase with suffix
- **Suffixes**: Props, Type, Config, Options
- **Examples**: ButtonProps, UserType, ApiConfig

### Constants
- **Pattern**: UPPER_SNAKE_CASE
- **Confidence**: 90%
- **Examples**: API_URL, MAX_RETRIES, DEFAULT_TIMEOUT

## Import Patterns

### Path Aliases
- `@/` → `src/` (primary pattern, 95% of imports)
- `~/` → root (rarely used)
- Relative imports (`../`) discouraged

### Common Imports
- `@/lib/utils` - Utility functions (imported by 23 files)
- `react` - React library (imported by 33 files)
- `@/components/ui/*` - UI components (imported by 18 files)

## Key Files (Hotspots)

### High Centrality (Most Connected)
1. `src/lib/utils.ts` - Imported by 23 files
2. `src/components/ui/Button.tsx` - Imported by 15 files
3. `src/lib/api.ts` - Imported by 12 files

### Frequently Changed
1. `src/pages/Dashboard.tsx` - 45 commits
2. `src/lib/api.ts` - 32 commits
3. `src/components/UserProfile.tsx` - 28 commits

## Dependency Clusters

### UI Components Cluster
- Button, Card, Input, Select, Dialog
- All import from `@/lib/utils`
- Shared styling patterns

### API Layer Cluster
- api.ts, auth.ts, fetch.ts
- Handle all external requests
- Shared error handling

### Page Components Cluster
- Home, Dashboard, Settings, Profile
- All use UI components
- All use API layer

## Recommendations for AI

1. **Follow PascalCase for components** - 95% consistency
2. **Use `@/` path alias** - Primary import pattern
3. **Utility functions in `src/lib/`** - Established pattern
4. **One component per file** - Strict convention
5. **Props interfaces with suffix** - ButtonProps, not IButtonProps
6. **Avoid relative imports** - Use path aliases instead

## Quick Reference

**To add a new component**:
1. Create `src/components/ComponentName.tsx`
2. Export default component (PascalCase)
3. Export props interface as `ComponentNameProps`
4. Import utilities from `@/lib/utils`

**To add a new utility**:
1. Create or add to `src/lib/filename.ts`
2. Export named function (camelCase)
3. Add JSDoc comments
4. Export types if needed

**To add a new page**:
1. Create `src/pages/PageName.tsx`
2. Use existing UI components
3. Use API layer for data
4. Follow routing conventions
```

### 5. hotspots.json - High-Activity Files

**Purpose**: Identify files that change frequently or are highly connected.

**Format**:
```json
{
  "byChanges": [
    {
      "path": "src/pages/Dashboard.tsx",
      "commits": 45,
      "lastChanged": "2026-01-21T09:00:00Z",
      "authors": ["user1", "user2"],
      "risk": "high"
    },
    {
      "path": "src/lib/api.ts",
      "commits": 32,
      "lastChanged": "2026-01-20T14:30:00Z",
      "authors": ["user1"],
      "risk": "medium"
    }
  ],
  "byCentrality": [
    {
      "path": "src/lib/utils.ts",
      "importedBy": 23,
      "centrality": 0.95,
      "risk": "critical"
    },
    {
      "path": "src/components/ui/Button.tsx",
      "importedBy": 15,
      "centrality": 0.75,
      "risk": "high"
    }
  ],
  "byComplexity": [
    {
      "path": "src/lib/api.ts",
      "lines": 450,
      "functions": 25,
      "complexity": "high"
    }
  ]
}
```

**Key Fields**:
- `commits`: Number of git commits touching this file
- `importedBy`: Number of files importing this file
- `centrality`: Graph centrality score (0.0-1.0)
- `risk`: Impact of changes (critical, high, medium, low)
- `complexity`: Code complexity estimate

### 6. metadata.json - Indexing Metadata

**Purpose**: Track indexing status and statistics.

**Format**:
```json
{
  "version": "1.0.0",
  "lastIndexed": "2026-01-21T10:35:00Z",
  "indexedBy": "scripts/index-codebase.sh",
  "duration": "2.3s",
  "statistics": {
    "totalFiles": 47,
    "totalExports": 156,
    "totalImports": 234,
    "languages": {
      "typescript": 40,
      "javascript": 5,
      "css": 2
    },
    "directories": {
      "src/components": 23,
      "src/lib": 8,
      "src/hooks": 6,
      "src/pages": 10
    }
  },
  "errors": [],
  "warnings": [
    "Circular dependency detected: src/lib/a.ts <-> src/lib/b.ts"
  ]
}
```

---

## Implementation: Indexing Scripts

### scripts/index-codebase.sh (Bash)

**Purpose**: Scan codebase and generate intelligence files.

**Usage**:
```bash
# Full index
./scripts/index-codebase.sh

# Incremental (only changed files)
./scripts/index-codebase.sh --incremental

# Specific directory
./scripts/index-codebase.sh --dir src/components

# Verbose output
./scripts/index-codebase.sh --verbose
```

**Implementation Strategy**:
```bash
#!/bin/bash
# scripts/index-codebase.sh

set -e

# Configuration
INTEL_DIR=".gsd/intel"
SRC_DIR="src"

# Initialize
mkdir -p "$INTEL_DIR"

# Step 1: Scan files and extract exports/imports
echo "Scanning codebase..."
find "$SRC_DIR" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | while read file; do
  # Extract exports using regex
  # Extract imports using regex
  # Build index.json incrementally
done

# Step 2: Detect conventions
echo "Detecting conventions..."
# Analyze naming patterns
# Identify directory purposes
# Build conventions.json

# Step 3: Build dependency graph
echo "Building dependency graph..."
# Map import relationships
# Calculate centrality
# Identify clusters
# Build graph.json

# Step 4: Identify hotspots
echo "Identifying hotspots..."
# Git log analysis for change frequency
# Graph analysis for centrality
# Build hotspots.json

# Step 5: Generate summary
echo "Generating summary..."
# Create human-readable summary.md
# Include key patterns and recommendations

# Step 6: Save metadata
echo "Saving metadata..."
# Record indexing stats
# Build metadata.json

echo "Indexing complete! Files created in $INTEL_DIR/"
```

### scripts/index-codebase.ps1 (PowerShell)

**Purpose**: Same functionality for Windows.

**Usage**:
```powershell
# Full index
./scripts/index-codebase.ps1

# Incremental
./scripts/index-codebase.ps1 -Incremental

# Specific directory
./scripts/index-codebase.ps1 -Directory src/components

# Verbose
./scripts/index-codebase.ps1 -Verbose
```

---

## Integration with GSD Workflows

### 1. Initial Setup (New Project)

**Workflow**: `/new-project`

**Step**: After project structure created
```markdown
5. Index codebase for intelligence
   - Run: `./scripts/index-codebase.sh`
   - Creates: `.gsd/intel/` directory
   - AI can now read `summary.md` for context
```

### 2. Brownfield Adoption (Existing Project)

**Workflow**: `/map-codebase`

**Enhanced with intelligence**:
```markdown
1. Run codebase indexing
   - Execute: `./scripts/index-codebase.sh`
   - Generates intelligence files

2. AI reads intelligence summary
   - Load: `.gsd/intel/summary.md`
   - Understand: Structure, patterns, conventions

3. Create architecture documentation
   - Use intelligence data
   - Document detected patterns
   - Identify key files and clusters
```

### 3. Before Planning Phase

**Workflow**: `/plan-phase`

**Step**: Load codebase context
```markdown
0. Load codebase intelligence
   - Read: `.gsd/intel/summary.md`
   - Understand: Current structure and patterns
   - Follow: Detected conventions
```

### 4. During Execution

**Workflow**: `/execute-phase`

**Step**: Maintain consistency
```markdown
- AI references `.gsd/intel/summary.md` for conventions
- Follows detected naming patterns
- Uses established import patterns
- Maintains consistency with existing code
```

### 5. After Significant Changes

**Workflow**: Manual or automated

**Step**: Re-index
```markdown
After completing phase with many file changes:
1. Re-run indexing: `./scripts/index-codebase.sh --incremental`
2. Updates intelligence with new patterns
3. AI has fresh context for next phase
```

---

## Automation Options

### Option 1: Git Hooks (Recommended)

**File**: `.git/hooks/post-commit`

```bash
#!/bin/bash
# Auto-index after each commit

echo "Updating codebase intelligence..."
./scripts/index-codebase.sh --incremental --quiet

# Only commit if intelligence changed
if git diff --quiet .gsd/intel/; then
  echo "No intelligence changes"
else
  git add .gsd/intel/
  git commit --amend --no-edit
  echo "Intelligence updated"
fi
```

**Pros**:
- Automatic, no manual intervention
- Always up-to-date
- Works in any environment

**Cons**:
- Adds time to each commit
- May slow down workflow

### Option 2: Scheduled Indexing

**Cron job** (Linux/Mac):
```bash
# Run every hour
0 * * * * cd /path/to/project && ./scripts/index-codebase.sh --incremental
```

**Task Scheduler** (Windows):
```powershell
# Create scheduled task
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\path\to\project\scripts\index-codebase.ps1 -Incremental"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1)
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "GSD-Index-Codebase"
```

### Option 3: Manual Indexing

**When to run**:
- After completing a phase
- Before starting new milestone
- When adopting GSD in existing project
- When structure changes significantly

**Command**:
```bash
./scripts/index-codebase.sh
```

---

## Query Operations

### Query 1: Find Dependents

**Question**: "What files import Button.tsx?"

**Answer**: Read `.gsd/intel/graph.json`
```json
{
  "nodes": {
    "src/components/Button.tsx": {
      "importedBy": [
        "src/components/Form.tsx",
        "src/pages/Home.tsx",
        "src/pages/Dashboard.tsx"
      ]
    }
  }
}
```

### Query 2: Find Hotspots

**Question**: "What files change most frequently?"

**Answer**: Read `.gsd/intel/hotspots.json`
```json
{
  "byChanges": [
    {
      "path": "src/pages/Dashboard.tsx",
      "commits": 45,
      "risk": "high"
    }
  ]
}
```

### Query 3: Find Conventions

**Question**: "How should I name a new component?"

**Answer**: Read `.gsd/intel/summary.md`
```markdown
## Naming Conventions

### Components
- **Pattern**: PascalCase
- **Confidence**: 95%
- **Examples**: Button, UserProfile, DataTable
```

---

## Success Criteria

This protocol succeeds when:

1. **AI understands codebase** without scanning all files
2. **Conventions are detected** automatically and followed consistently
3. **Dependencies are visible** (who imports who)
4. **Hotspots are identified** (high-risk files)
5. **Works universally** (any environment, any AI)
6. **Stays up-to-date** (manual or automated indexing)
7. **Improves over time** (learns as codebase evolves)

---

## Next Steps

1. **Implement indexing scripts** (bash + PowerShell)
2. **Test on real codebases** (TypeScript, JavaScript, Python)
3. **Integrate with workflows** (/map, /plan, /execute)
4. **Add automation** (git hooks or scheduled)
5. **Extend to more languages** (Python, Go, Rust, etc.)

---

## See Also

- `.gsd/protocols/parallel.md` - Parallel processing patterns
- `.gsd/workflows/map.md` - Codebase mapping workflow
- `.gsd/workflows/plan.md` - Planning with intelligence
- `scripts/index-codebase.sh` - Indexing implementation (to be created)
