# Common Shell Patterns for GSD Universal

## Overview

This document contains reusable shell patterns used across GSD protocols. Reference these patterns instead of duplicating code.

## Tool Detection Patterns

### Bash Tool Detection
```bash
# Check if command exists
command -v tool_name >/dev/null 2>&1 && HAS_TOOL=1

# Multiple tool detection
check_tools() {
    command -v node >/dev/null 2>&1 && HAS_NODE=1
    command -v python >/dev/null 2>&1 && HAS_PYTHON=1
    command -v eslint >/dev/null 2>&1 && HAS_ESLINT=1
    command -v pylint >/dev/null 2>&1 && HAS_PYLINT=1
}

# Display tool availability
display_tools() {
    echo "=== Tool Availability ==="
    command -v node >/dev/null 2>&1 && echo "✓ Node.js" || echo "✗ Node.js"
    command -v python >/dev/null 2>&1 && echo "✓ Python" || echo "✗ Python"
    echo "========================="
}
```

### PowerShell Tool Detection
```powershell
# Check if command exists
$hasTool = Get-Command tool_name -ErrorAction SilentlyContinue

# Multiple tool detection
function Test-Tools {
    $script:hasNode = Get-Command node -ErrorAction SilentlyContinue
    $script:hasPython = Get-Command python -ErrorAction SilentlyContinue
    $script:hasEslint = Get-Command eslint -ErrorAction SilentlyContinue
    $script:hasPylint = Get-Command pylint -ErrorAction SilentlyContinue
}

# Display tool availability
function Show-Tools {
    Write-Host "=== Tool Availability ==="
    if (Get-Command node -ErrorAction SilentlyContinue) { 
        Write-Host "✓ Node.js" 
    } else { 
        Write-Host "✗ Node.js" 
    }
    if (Get-Command python -ErrorAction SilentlyContinue) { 
        Write-Host "✓ Python" 
    } else { 
        Write-Host "✗ Python" 
    }
    Write-Host "========================="
}
```

## File Operations

### Bash File Operations
```bash
# Create directory (cross-platform safe)
mkdir -p directory/path/

# Find files by extension
find . -name "*.js" -o -name "*.ts"

# Check if file exists
test -f file.txt && echo "exists" || echo "not found"

# Check if directory exists
test -d directory/ && echo "exists" || echo "not found"

# Iterate over files
find . -name "*.py" | while read file; do
    echo "Processing: $file"
    python -m py_compile "$file"
done

# Create temporary directory
TEMP_DIR="${TMPDIR:-/tmp}/gsd-$$"
mkdir -p "$TEMP_DIR"
trap "rm -rf '$TEMP_DIR'" EXIT
```

### PowerShell File Operations
```powershell
# Create directory (cross-platform safe)
New-Item -ItemType Directory -Path directory/path/ -Force | Out-Null

# Find files by extension
Get-ChildItem -Recurse -Include *.js,*.ts

# Check if file exists
Test-Path file.txt

# Check if directory exists
Test-Path directory/ -PathType Container

# Iterate over files
$files = Get-ChildItem -Recurse -Include *.py
foreach ($file in $files) {
    Write-Host "Processing: $($file.FullName)"
    python -m py_compile $file.FullName
}

# Create temporary directory
$tempDir = Join-Path $env:TEMP "gsd-$PID"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
```

## Validation Patterns

### JavaScript/TypeScript Validation
```bash
# Bash
validate_js_ts() {
    local exit_code=0
    
    if find . -name "*.js" -o -name "*.ts" | grep -q .; then
        if command -v eslint >/dev/null 2>&1; then
            echo "Running ESLint..."
            npx eslint . --ext .js,.jsx,.ts,.tsx || exit_code=1
        else
            echo "ESLint not available, using basic syntax check..."
            find . -name "*.js" -exec node -c {} \; || exit_code=1
        fi
    fi
    
    return $exit_code
}
```

```powershell
# PowerShell
function Test-JavaScript {
    $exitCode = 0
    
    $jsFiles = Get-ChildItem -Recurse -Include *.js,*.ts,*.jsx,*.tsx
    if ($jsFiles) {
        if (Get-Command eslint -ErrorAction SilentlyContinue) {
            Write-Host "Running ESLint..."
            npx eslint . --ext .js,.jsx,.ts,.tsx
            if ($LASTEXITCODE -ne 0) { $exitCode = 1 }
        } else {
            Write-Host "ESLint not available, using basic syntax check..."
            foreach ($file in $jsFiles) {
                node -c $file.FullName
                if ($LASTEXITCODE -ne 0) { $exitCode = 1 }
            }
        }
    }
    
    return $exitCode
}
```

### Python Validation
```bash
# Bash
validate_python() {
    local exit_code=0
    
    if find . -name "*.py" | grep -q .; then
        if command -v pylint >/dev/null 2>&1; then
            echo "Running PyLint..."
            pylint *.py || exit_code=1
        else
            echo "PyLint not available, using basic syntax check..."
            find . -name "*.py" -exec python -m py_compile {} \; || exit_code=1
        fi
    fi
    
    return $exit_code
}
```

```powershell
# PowerShell
function Test-Python {
    $exitCode = 0
    
    $pyFiles = Get-ChildItem -Recurse -Include *.py
    if ($pyFiles) {
        if (Get-Command pylint -ErrorAction SilentlyContinue) {
            Write-Host "Running PyLint..."
            pylint *.py
            if ($LASTEXITCODE -ne 0) { $exitCode = 1 }
        } else {
            Write-Host "PyLint not available, using basic syntax check..."
            foreach ($file in $pyFiles) {
                python -m py_compile $file.FullName
                if ($LASTEXITCODE -ne 0) { $exitCode = 1 }
            }
        }
    }
    
    return $exitCode
}
```

## Task Coordination Patterns

### Task Queue Initialization
```bash
# Bash
TASK_DIR=".gsd/tasks"

init_task_queue() {
    mkdir -p "$TASK_DIR"
    echo "# Task Queue" > "$TASK_DIR/queue.md"
    echo "# In Progress" > "$TASK_DIR/in-progress.md"
    echo "# Completed Tasks" > "$TASK_DIR/completed.md"
    echo "# Failed Tasks" > "$TASK_DIR/failed.md"
}
```

```powershell
# PowerShell
$TaskDir = ".gsd/tasks"

function Initialize-TaskQueue {
    New-Item -ItemType Directory -Path $TaskDir -Force | Out-Null
    "# Task Queue" | Out-File "$TaskDir/queue.md" -Encoding UTF8
    "# In Progress" | Out-File "$TaskDir/in-progress.md" -Encoding UTF8
    "# Completed Tasks" | Out-File "$TaskDir/completed.md" -Encoding UTF8
    "# Failed Tasks" | Out-File "$TaskDir/failed.md" -Encoding UTF8
}
```

### Add Task to Queue
```bash
# Bash
add_task() {
    local task_id="$1"
    local description="$2"
    local timestamp=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
    
    cat >> "$TASK_DIR/queue.md" << EOF

## Task: $task_id
- **Status**: queued
- **Created**: $timestamp
- **Description**: $description

EOF
}
```

```powershell
# PowerShell
function Add-Task {
    param(
        [string]$TaskId,
        [string]$Description
    )
    
    $timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss UTC")
    
    $taskBlock = @"

## Task: $TaskId
- **Status**: queued
- **Created**: $timestamp
- **Description**: $Description

"@
    
    Add-Content "$TaskDir/queue.md" $taskBlock -Encoding UTF8
}
```

## Error Handling Patterns

### Graceful Degradation Messages
```bash
# When tool unavailable
echo "⚠ Advanced tool not available"
echo "📋 Using fallback method"
echo "✓ Basic validation complete"
echo "💡 Install [tool] for enhanced functionality"

# When validation fails
echo "❌ Validation failed: $error_count issues found"
echo "📁 Files with issues: $file_list"
echo "🔧 Fix issues and re-run validation"
```

```powershell
# When tool unavailable
Write-Host "⚠ Advanced tool not available"
Write-Host "📋 Using fallback method"
Write-Host "✓ Basic validation complete"
Write-Host "💡 Install [tool] for enhanced functionality"

# When validation fails
Write-Host "❌ Validation failed: $errorCount issues found"
Write-Host "📁 Files with issues: $fileList"
Write-Host "🔧 Fix issues and re-run validation"
```

## Progress Tracking Patterns

### Progress Indicators
```bash
# Bash
show_progress() {
    echo "=== Task Execution Progress ==="
    echo "✓ Task 1: Completed"
    echo "⏳ Task 2: In progress"
    echo "⏸ Task 3: Queued"
    echo "❌ Task 4: Failed"
    echo ""
    echo "$completed/$total tasks processed, $remaining remaining"
}
```

```powershell
# PowerShell
function Show-Progress {
    Write-Host "=== Task Execution Progress ==="
    Write-Host "✓ Task 1: Completed"
    Write-Host "⏳ Task 2: In progress"
    Write-Host "⏸ Task 3: Queued"
    Write-Host "❌ Task 4: Failed"
    Write-Host ""
    Write-Host "$completed/$total tasks processed, $remaining remaining"
}
```

## Git Operations

### Cross-Platform Git Commands
```bash
# Bash
git status --porcelain
git add .
git commit -m "feat(phase-N): description"
git log --oneline --grep="feat(phase-"
```

```powershell
# PowerShell
git status --porcelain
git add .
git commit -m "feat(phase-N): description"
git log --oneline --grep="feat(phase-"
```

## Usage in Protocols

Instead of duplicating these patterns, protocols should reference this file:

```markdown
## Implementation

See `.gsd/examples/shell-patterns.md` for:
- Tool detection patterns
- File operation patterns
- Validation patterns
- Task coordination patterns
- Error handling patterns
```

This keeps protocols focused on their specific logic while maintaining DRY principles.
