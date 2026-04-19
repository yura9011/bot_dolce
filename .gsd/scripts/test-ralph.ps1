# test-ralph.ps1 - Ralph Loop System Validation Script (PowerShell)
# Tests the complete Ralph Loop system setup without executing AI

param(
    [switch]$Help,
    [switch]$DryRun,
    [switch]$Verbose
)

# Error handling
$ErrorActionPreference = "Stop"

# Test counters
$script:TestsPassed = 0
$script:TestsFailed = 0
$script:TestsTotal = 0

# Logging functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[PASS] $Message" -ForegroundColor Green
    $script:TestsPassed++
}

function Write-Fail {
    param([string]$Message)
    Write-Host "[FAIL] $Message" -ForegroundColor Red
    $script:TestsFailed++
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

# Usage function
function Show-Help {
    Write-Host @"
Ralph Loop System Test Suite

USAGE:
    .\test-ralph.ps1 [OPTIONS]

OPTIONS:
    -Help           Show this help message
    -DryRun         Run validation tests without AI CLI checks
    -Verbose        Show detailed test output

DESCRIPTION:
    Validates the complete Ralph Loop system setup including:
    - Required files and directory structure
    - Script functionality and cross-platform compatibility
    - Integration with GSD validation system
    - Error handling and configuration

"@
}

# Test function wrapper
function Invoke-Test {
    param(
        [string]$TestName,
        [scriptblock]$TestCommand
    )
    
    $script:TestsTotal++
    Write-Info "Testing: $TestName"
    
    try {
        $result = & $TestCommand
        if ($result) {
            Write-Success $TestName
            return $true
        }
        else {
            Write-Fail $TestName
            return $false
        }
    }
    catch {
        Write-Fail "$TestName - Error: $($_.Exception.Message)"
        return $false
    }
}

# Test functions
function Test-RequiredFiles {
    $requiredFiles = @("loop.sh", "loop.ps1", "AGENTS.md", "IMPLEMENTATION_PLAN.md", "PROMPT_build.md", "PROMPT_plan.md")
    $allExist = $true
    
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            Write-Fail "Missing required file: $file"
            $allExist = $false
        }
    }
    
    if (-not (Test-Path "specs" -PathType Container)) {
        Write-Fail "Missing specs/ directory"
        $allExist = $false
    }
    
    if (-not (Test-Path "specs/roadmap.md")) {
        Write-Fail "Missing specs/roadmap.md"
        $allExist = $false
    }
    
    return $allExist
}

function Test-LoopScriptsExecutable {
    try {
        # Test PowerShell script help
        $null = & ".\loop.ps1" -Help 2>$null
        return $true
    }
    catch {
        return $false
    }
}

function Test-BashScript {
    # Test bash script (if available)
    try {
        $bashAvailable = Get-Command bash -ErrorAction SilentlyContinue
        if ($bashAvailable) {
            $null = bash loop.sh --help 2>$null
            return $true
        }
        else {
            Write-Warning "Bash not available, skipping bash script test"
            return $true
        }
    }
    catch {
        return $false
    }
}

function Test-AgentsFileFormat {
    $lineCount = (Get-Content AGENTS.md | Measure-Object -Line).Lines
    
    if ($lineCount -le 60) {
        $content = Get-Content AGENTS.md -Raw
        if ($content -match "validate-all") {
            return $true
        }
        else {
            Write-Fail "AGENTS.md missing validation commands"
            return $false
        }
    }
    else {
        Write-Fail "AGENTS.md too long: $lineCount lines (max 60)"
        return $false
    }
}

function Test-ImplementationPlanFormat {
    $content = Get-Content IMPLEMENTATION_PLAN.md -Raw
    if (($content -match "Phase 1") -and ($content -match "- \[ \]")) {
        return $true
    }
    else {
        return $false
    }
}

function Test-PromptTemplates {
    # Test PROMPT_build.md structure
    $buildContent = Get-Content PROMPT_build.md -Raw
    $planContent = Get-Content PROMPT_plan.md -Raw
    
    if (($buildContent -match "0a\. Study") -and ($buildContent -match "999999999999")) {
        if (($planContent -match "IMPLEMENTATION_PLAN.md") -and ($planContent -match "specs")) {
            return $true
        }
        else {
            Write-Fail "PROMPT_plan.md missing required content"
            return $false
        }
    }
    else {
        Write-Fail "PROMPT_build.md missing required structure"
        return $false
    }
}

function Test-GsdValidationIntegration {
    $validationExists = (Test-Path "scripts/validate-all.sh") -or (Test-Path "scripts/validate-all.ps1")
    
    if ($validationExists) {
        # Check if loop scripts reference validation
        $loopShContent = Get-Content loop.sh -Raw
        $loopPs1Content = Get-Content loop.ps1 -Raw
        
        if (($loopShContent -match "validate-all") -and ($loopPs1Content -match "validate-all")) {
            return $true
        }
        else {
            Write-Fail "Loop scripts missing validation integration"
            return $false
        }
    }
    else {
        Write-Fail "GSD validation scripts not found"
        return $false
    }
}

function Test-GitRepository {
    try {
        $null = git status 2>$null
        return $true
    }
    catch {
        return $false
    }
}

# Main execution
function Main {
    # Handle help
    if ($Help) {
        Show-Help
        exit 0
    }
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host " RALPH LOOP SYSTEM VALIDATION"
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host ""
    
    # Run tests
    Invoke-Test "Required files exist" { Test-RequiredFiles }
    Invoke-Test "PowerShell script executable" { Test-LoopScriptsExecutable }
    Invoke-Test "Bash script functional" { Test-BashScript }
    Invoke-Test "AGENTS.md format valid" { Test-AgentsFileFormat }
    Invoke-Test "IMPLEMENTATION_PLAN.md format valid" { Test-ImplementationPlanFormat }
    Invoke-Test "Prompt templates valid" { Test-PromptTemplates }
    Invoke-Test "GSD validation integration" { Test-GsdValidationIntegration }
    Invoke-Test "Git repository valid" { Test-GitRepository }
    
    # Summary
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host " TEST RESULTS"
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    Write-Host ""
    Write-Host "Total Tests: $script:TestsTotal"
    Write-Host "Passed: $script:TestsPassed" -ForegroundColor Green
    Write-Host "Failed: $script:TestsFailed" -ForegroundColor Red
    Write-Host ""
    
    if ($script:TestsFailed -eq 0) {
        Write-Host "✅ Ralph Loop system validation PASSED" -ForegroundColor Green
        Write-Host "System is ready for autonomous execution!"
        exit 0
    }
    else {
        Write-Host "❌ Ralph Loop system validation FAILED" -ForegroundColor Red
        Write-Host "Fix the failed tests before running Ralph Loop."
        exit 1
    }
}

# Run main function
Main