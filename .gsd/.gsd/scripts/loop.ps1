# ralph.ps1 - Universal Ralph Loop coordinator (PowerShell)
# Works with ANY AI assistant (no CLI dependencies)

param(
    [string]$Mode = "build",
    [int]$Iterations = 50,
    [switch]$Manual,
    [switch]$DryRun,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

# Usage
function Show-Help {
    Write-Host @"
Universal Ralph Loop - AI Coordination Protocol

USAGE:
    .\ralph.ps1 [OPTIONS]

OPTIONS:
    -Mode MODE          Execution mode (build|plan) [default: build]
    -Iterations NUM     Maximum iterations [default: 50]
    -Manual             Manual mode (just show prompts, no automation)
    -DryRun             Validate setup without executing
    -Help               Show this help

EXAMPLES:
    .\ralph.ps1                      # Build mode, interactive
    .\ralph.ps1 -Mode plan           # Planning mode
    .\ralph.ps1 -Manual              # Manual mode (no automation)
    .\ralph.ps1 -DryRun              # Validate setup

UNIVERSAL PROTOCOL:
Ralph works with ANY AI assistant:
- ChatGPT web interface
- Claude web interface
- Kiro IDE
- VS Code + Copilot
- Terminal + any AI

See .gsd/protocols/ralph-loop.md for complete protocol.

"@
}

# Logging
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Detect file structure (v1 or v2)
function Get-FileStructure {
    if (Test-Path ".gsd/config/AGENTS.md") {
        return "v2"
    }
    return "v1"
}

# Get file path based on structure version
function Get-FilePath {
    param([string]$File)
    
    $structure = Get-FileStructure
    
    switch -Regex ($File) {
        "AGENTS\.md" {
            if ($structure -eq "v2") { return ".gsd/config/AGENTS.md" }
            return "AGENTS.md"
        }
        "PROMPT_(build|plan)\.md" {
            if ($structure -eq "v2") { return ".gsd/config/$File" }
            return $File
        }
        "IMPLEMENTATION_PLAN\.md|JOURNAL\.md|STATE\.md" {
            if ($structure -eq "v2") { return ".gsd/state/$File" }
            return $File
        }
        "specs" {
            if ($structure -eq "v2") { return ".gsd/specs" }
            return "specs"
        }
        default {
            return $File
        }
    }
}

# Validate setup
function Test-RalphSetup {
    $errors = 0
    $structure = Get-FileStructure
    
    Write-Info "Validating Ralph Loop setup... (structure: $structure)"
    
    # Check required files
    $promptFile = Get-FilePath "PROMPT_$Mode.md"
    if (-not (Test-Path $promptFile)) {
        Write-ErrorMsg "Missing prompt file: $promptFile"
        $errors++
    }
    
    $implPlan = Get-FilePath "IMPLEMENTATION_PLAN.md"
    if (-not (Test-Path $implPlan)) {
        Write-ErrorMsg "Missing IMPLEMENTATION_PLAN.md"
        $errors++
    }
    
    $agentsFile = Get-FilePath "AGENTS.md"
    if (-not (Test-Path $agentsFile)) {
        Write-ErrorMsg "Missing AGENTS.md"
        $errors++
    }
    
    $specsDir = Get-FilePath "specs"
    if (-not (Test-Path $specsDir -PathType Container)) {
        Write-ErrorMsg "Missing specs/ directory"
        $errors++
    }
    
    # Check git
    try {
        Get-Command git -ErrorAction Stop | Out-Null
    }
    catch {
        Write-ErrorMsg "Git not found - required for Ralph Loop"
        $errors++
    }
    
    # Check validation scripts (optional)
    if ((Test-Path ".gsd/scripts/validate.ps1") -or (Test-Path "scripts/validate.ps1")) {
        Write-Info "Found validation script"
    }
    else {
        Write-Warning "Validation script not found (optional)"
    }
    
    if ($errors -eq 0) {
        Write-Success "Ralph Loop setup validation passed"
        return $true
    }
    else {
        Write-ErrorMsg "Ralph Loop setup validation failed with $errors errors"
        return $false
    }
}

# Show prompt to user
function Show-Prompt {
    param(
        [string]$PromptFile,
        [int]$Iteration
    )
    
    Clear-Host
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host " RALPH LOOP - Iteration $Iteration/$Iterations"
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host ""
    Write-Host "Mode: $Mode"
    Write-Host "Prompt file: $PromptFile"
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host ""
    Get-Content $PromptFile | Write-Host
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Wait for user to execute AI
function Wait-ForUser {
    Write-Host ""
    Write-Host "INSTRUCTIONS:"
    Write-Host "1. Copy the prompt above to your AI assistant"
    Write-Host "2. Execute the prompt with your AI (ChatGPT, Claude, Kiro, etc.)"
    Write-Host "3. Let the AI complete its work"
    Write-Host "4. Press ENTER when done to continue..."
    Write-Host ""
    Read-Host
}

# Run validation
function Invoke-Validation {
    Write-Info "Running validation (backpressure)..."
    
    $validateScript = $null
    if (Test-Path ".gsd/scripts/validate.ps1") {
        $validateScript = ".gsd/scripts/validate.ps1"
    }
    elseif (Test-Path "scripts/validate.ps1") {
        $validateScript = "scripts/validate.ps1"
    }
    
    if ($validateScript) {
        try {
            & $validateScript -All
            Write-Success "Validation passed"
            return $true
        }
        catch {
            Write-ErrorMsg "Validation failed"
            return $false
        }
    }
    else {
        Write-Warning "Validation script not found, skipping"
        return $true
    }
}

# Check for git changes
function Test-GitChanges {
    $status = git status --porcelain
    return ($status.Length -gt 0)
}

# Load memory context
function Load-MemoryContext {
    $memoryScript = $null
    
    if (Test-Path ".gsd/scripts/memory-recent.ps1") {
        $memoryScript = ".gsd/scripts/memory-recent.ps1"
    }
    elseif (Test-Path "scripts/memory-recent.ps1") {
        $memoryScript = "scripts/memory-recent.ps1"
    }
    
    if ($memoryScript) {
        Write-Info "Loading recent memory context..."
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        Write-Host " RECENT MEMORY CONTEXT"
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        Write-Host ""
        & $memoryScript -Limit 3
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        Write-Host ""
    }
}

# Prompt for journal entry
function Invoke-JournalPrompt {
    $memoryScript = $null
    
    if (Test-Path ".gsd/scripts/memory-add.ps1") {
        $memoryScript = ".gsd/scripts/memory-add.ps1"
    }
    elseif (Test-Path "scripts/memory-add.ps1") {
        $memoryScript = "scripts/memory-add.ps1"
    }
    
    if ($memoryScript) {
        Write-Host ""
        Write-Info "Would you like to document this session? (y/n)"
        $response = Read-Host
        
        if ($response -eq "y") {
            Write-Info "Opening journal template..."
            & $memoryScript journal -Template
            Write-Success "Journal entry created"
        }
        else {
            Write-Info "Skipping journal entry"
        }
    }
}

# Prompt for commit
function Invoke-CommitPrompt {
    param([int]$Iteration)
    
    Write-Host ""
    Write-Info "Changes detected in git"
    $response = Read-Host "Do you want to commit these changes? (y/n)"
    
    if ($response -eq "y") {
        Write-Info "Creating commit..."
        git add -A
        
        $commitMsg = Read-Host "Enter commit message (or press ENTER for default)"
        
        if ([string]::IsNullOrWhiteSpace($commitMsg)) {
            $commitMsg = "feat(ralph): iteration $Iteration complete"
        }
        
        git commit -m $commitMsg
        
        $pushResponse = Read-Host "Push to remote? (y/n)"
        
        if ($pushResponse -eq "y") {
            git push
            Write-Success "Changes pushed to remote"
        }
        
        Write-Success "Changes committed"
    }
    else {
        Write-Info "Skipping commit"
    }
}

# Main Ralph Loop
function Start-RalphLoop {
    $promptFile = Get-FilePath "PROMPT_$Mode.md"
    
    Write-Info "Starting Universal Ralph Loop"
    Write-Info "Mode: $Mode"
    Write-Info "Max iterations: $Iterations"
    Write-Info "Manual mode: $Manual"
    Write-Host ""
    
    # Load recent memory context
    Load-MemoryContext
    
    # Create session log directory
    New-Item -ItemType Directory -Path ".ralph" -Force | Out-Null
    $sessionLog = ".ralph/session-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
    Write-Info "Session log: $sessionLog"
    Write-Host ""
    
    for ($iteration = 1; $iteration -le $Iterations; $iteration++) {
        # Log iteration start
        "=== Iteration $iteration started at $(Get-Date) ===" | Out-File $sessionLog -Append
        
        # Show prompt
        Show-Prompt -PromptFile $promptFile -Iteration $iteration
        
        # Wait for user to execute AI
        Wait-ForUser
        
        # Run validation
        if (Invoke-Validation) {
            "Validation: PASS" | Out-File $sessionLog -Append
        }
        else {
            "Validation: FAIL" | Out-File $sessionLog -Append
            Write-Warning "Validation failed, but continuing..."
        }
        
        # Check for git changes
        if (Test-GitChanges) {
            Invoke-CommitPrompt -Iteration $iteration
        }
        else {
            Write-Info "No changes detected"
        }
        
        # Prompt for journal entry
        Invoke-JournalPrompt
        
        # Ask to continue
        Write-Host ""
        $response = Read-Host "Continue to next iteration? (y/n)"
        
        if ($response -ne "y") {
            Write-Info "Stopping Ralph Loop at iteration $iteration"
            break
        }
        
        Write-Host ""
    }
    
    Write-Success "Ralph Loop completed"
    Write-Info "Session log: $sessionLog"
}

# Handle help
if ($Help) {
    Show-Help
    exit 0
}

# Validate mode
if ($Mode -notin @("build", "plan")) {
    Write-ErrorMsg "Invalid mode: $Mode. Must be 'build' or 'plan'"
    Show-Help
    exit 1
}

# Validate setup
if (-not (Test-RalphSetup)) {
    exit 1
}

# Handle dry-run
if ($DryRun) {
    Write-Success "Dry-run complete - setup is valid"
    exit 0
}

# Run Ralph Loop
Start-RalphLoop

Write-Success "Universal Ralph Loop execution complete"
