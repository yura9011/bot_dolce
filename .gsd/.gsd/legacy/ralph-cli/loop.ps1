# loop.ps1 - Ralph Loop autonomous execution engine (PowerShell)
# Based on Geoffrey Huntley's Ralph Loop implementation
# https://github.com/ghuntley/how-to-ralph-wiggum

param(
    [string]$Mode = "build",
    [int]$Iterations = 50,
    [int]$Sleep = 2,
    [string]$CLI = "kiro",  # Default to Kiro, can be changed to claude, openai, etc.
    [switch]$Verbose,
    [switch]$Help,
    [switch]$DryRun
)

# Error handling
$ErrorActionPreference = "Stop"

# Usage function
function Show-Help {
    Write-Host @"
Ralph Loop - Autonomous Execution Engine

USAGE:
    .\loop.ps1 [OPTIONS] [MODE]

MODES:
    build    Execute PROMPT_build.md (default)
    plan     Execute PROMPT_plan.md

OPTIONS:
    -Mode MODE              Execution mode (build|plan)
    -Iterations NUM         Maximum iterations (default: 50)
    -Sleep NUM              Sleep duration between iterations (default: 2)
    -CLI COMMAND            AI CLI command (default: kiro)
    -Verbose                Verbose output
    -Help                   Show this help message
    -DryRun                 Validate setup without executing

EXAMPLES:
    .\loop.ps1                           # Build mode, default settings (kiro)
    .\loop.ps1 -Mode plan                # Planning mode
    .\loop.ps1 -Iterations 10 -Mode build   # Build mode, max 10 iterations
    .\loop.ps1 -CLI claude -Mode build   # Use Claude CLI instead of Kiro
    .\loop.ps1 -DryRun                   # Validate setup

The Ralph Loop executes AI prompts autonomously until completion.
Each iteration starts with fresh context for optimal performance.

"@
}

# Logging functions
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

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Validation function
function Test-RalphSetup {
    $errors = 0
    
    Write-Info "Validating Ralph Loop setup..."
    
    # Check required files
    $promptFile = "PROMPT_$Mode.md"
    if (-not (Test-Path $promptFile)) {
        Write-Error "Missing prompt file: $promptFile"
        $errors++
    }
    
    if (-not (Test-Path "AGENTS.md")) {
        Write-Error "Missing AGENTS.md operational manual"
        $errors++
    }
    
    if (-not (Test-Path "IMPLEMENTATION_PLAN.md")) {
        Write-Error "Missing IMPLEMENTATION_PLAN.md task tracker"
        $errors++
    }
    
    if (-not (Test-Path "specs" -PathType Container)) {
        Write-Error "Missing specs/ directory"
        $errors++
    }
    
    # Check validation scripts
    if (-not (Test-Path "scripts/validate-all.ps1")) {
        Write-Error "Missing GSD validation script: scripts/validate-all.ps1"
        $errors++
    }
    else {
        Write-Info "Found GSD validation script: scripts/validate-all.ps1"
    }
    
    # Check AI CLI
    try {
        Get-Command $CLI -ErrorAction Stop | Out-Null
    }
    catch {
        Write-Error "AI CLI not found: $CLI"
        Write-Info "Install AI CLI (claude, kiro, openai, etc.) or specify different CLI with -CLI option"
        $errors++
    }
    
    # Check git
    try {
        Get-Command git -ErrorAction Stop | Out-Null
    }
    catch {
        Write-Error "Git not found - required for Ralph Loop"
        $errors++
    }
    
    if ($errors -eq 0) {
        Write-Success "Ralph Loop setup validation passed"
        return $true
    }
    else {
        Write-Error "Ralph Loop setup validation failed with $errors errors"
        return $false
    }
}

# Run validation
function Invoke-Validation {
    Write-Info "Running GSD validation (backpressure)..."
    
    if (Test-Path "scripts/validate-all.ps1") {
        try {
            & "scripts/validate-all.ps1"
            Write-Success "Validation passed"
            return $true
        }
        catch {
            Write-Error "Validation failed: $($_.Exception.Message)"
            return $false
        }
    }
    else {
        Write-Warning "Validation script not found, skipping"
        return $true
    }
}

# Main execution loop
function Start-RalphLoop {
    $promptFile = "PROMPT_$Mode.md"
    
    Write-Info "Starting Ralph Loop in $Mode mode"
    Write-Info "Prompt file: $promptFile"
    Write-Info "Max iterations: $Iterations"
    Write-Info "AI CLI: $CLI"
    
    for ($iteration = 1; $iteration -le $Iterations; $iteration++) {
        Write-Host ""
        Write-Info "--- Iteration $iteration/$Iterations ---"
        
        # Execute AI with prompt
        Write-Info "Executing AI iteration..."
        try {
            if ($Verbose) {
                Get-Content $promptFile | & $CLI -p --dangerously-skip-permissions
            }
            else {
                Get-Content $promptFile | & $CLI -p --dangerously-skip-permissions | Out-Null
            }
            
            Write-Success "AI iteration completed"
            
            # Run validation (backpressure)
            if (Invoke-Validation) {
                Write-Success "Iteration $iteration validated successfully"
                
                # Auto git push
                try {
                    $currentBranch = git branch --show-current
                    git push origin $currentBranch
                    Write-Success "Changes pushed to remote"
                }
                catch {
                    Write-Warning "Failed to push changes (continuing anyway)"
                }
            }
            else {
                Write-Warning "Validation failed, continuing to next iteration"
            }
        }
        catch {
            Write-Error "AI execution failed: $($_.Exception.Message)"
            Write-Info "Continuing to next iteration..."
        }
        
        # Sleep between iterations
        if ($iteration -lt $Iterations) {
            Write-Info "Sleeping for $Sleep seconds before next iteration..."
            Start-Sleep -Seconds $Sleep
        }
    }
    
    Write-Info "Ralph Loop completed after $Iterations iterations"
}

# Handle help
if ($Help) {
    Show-Help
    exit 0
}

# Validate mode parameter
if ($Mode -notin @("build", "plan")) {
    Write-Error "Invalid mode: $Mode. Must be 'build' or 'plan'"
    Show-Help
    exit 1
}

# Handle dry run
if ($DryRun) {
    if (Test-RalphSetup) {
        exit 0
    }
    else {
        exit 1
    }
}

# Validate setup before starting
if (-not (Test-RalphSetup)) {
    exit 1
}

# Run the Ralph Loop
Start-RalphLoop

Write-Success "Ralph Loop execution complete"