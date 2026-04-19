# GSD Consolidated Validation Script
# Universal validation that works in any environment with any AI assistant

param(
    [switch]$All,
    [switch]$Code,
    [switch]$Workflows,
    [switch]$Skills,
    [switch]$Templates,
    [switch]$DryRun,
    [switch]$Help
)

# Colors for output (with fallback for environments without color support)
$Red = if ($Host.UI.SupportsVirtualTerminal) { "`e[31m" } else { "" }
$Green = if ($Host.UI.SupportsVirtualTerminal) { "`e[32m" } else { "" }
$Yellow = if ($Host.UI.SupportsVirtualTerminal) { "`e[33m" } else { "" }
$Blue = if ($Host.UI.SupportsVirtualTerminal) { "`e[34m" } else { "" }
$Reset = if ($Host.UI.SupportsVirtualTerminal) { "`e[0m" } else { "" }

# Global error counter
$script:TotalErrors = 0

function Show-Help {
    Write-Host "GSD Validation Script"
    Write-Host ""
    Write-Host "Usage: .\validate.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -All           Validate everything"
    Write-Host "  -Code          Validate code (JS, Python, etc.)"
    Write-Host "  -Workflows     Validate GSD workflows"
    Write-Host "  -Skills        Validate GSD skills"
    Write-Host "  -Templates     Validate GSD templates"
    Write-Host "  -DryRun        Show what would be validated without running"
    Write-Host "  -Help          Show this help"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\validate.ps1 -All                    # Validate everything"
    Write-Host "  .\validate.ps1 -Code -Workflows        # Validate code and workflows only"
    Write-Host "  .\validate.ps1 -DryRun -All            # Show what would be validated"
}

function Test-Code {
    Write-Host "${Blue}=== Code Validation ===${Reset}"
    
    if ($DryRun) {
        Write-Host "Would validate: JavaScript, TypeScript, Python, Markdown, Shell scripts"
        return
    }
    
    $codeErrors = 0
    
    Write-Host "Checking for validation tools..."
    
    # Tool availability detection
    $hasNode = Get-Command node -ErrorAction SilentlyContinue
    $hasPython = Get-Command python -ErrorAction SilentlyContinue
    $hasEslint = $false
    $hasPylint = Get-Command pylint -ErrorAction SilentlyContinue
    
    Write-Host "  - Node.js: $(if ($hasNode) { '✓ Found' } else { '✗ Not found' })"
    Write-Host "  - Python: $(if ($hasPython) { '✓ Found' } else { '✗ Not found' })"
    
    try {
        $null = npx eslint --version 2>$null
        if ($LASTEXITCODE -eq 0) { 
            $hasEslint = $true
            Write-Host "  - ESLint: ✓ Found"
        } else {
            Write-Host "  - ESLint: ✗ Not found"
        }
    } catch { 
        Write-Host "  - ESLint: ✗ Not found"
    }
    
    Write-Host ""
    
    # JavaScript/TypeScript validation
    Write-Host "Scanning for JavaScript/TypeScript files..."
    $jsFiles = Get-ChildItem -Recurse -Include *.js,*.jsx,*.ts,*.tsx | Where-Object { $_.FullName -notmatch "node_modules" } | Select-Object -First 20
    if ($jsFiles) {
        Write-Host "Found $($jsFiles.Count) JS/TS files to validate..."
        if ($hasEslint) {
            Write-Host "Running ESLint validation..."
            try {
                npx eslint . --ext .js,.jsx,.ts,.tsx --ignore-path .gitignore 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "${Green}✓${Reset} ESLint validation passed"
                } else {
                    Write-Host "${Red}✗${Reset} ESLint validation failed"
                    $codeErrors++
                }
            } catch {
                Write-Host "${Red}✗${Reset} ESLint validation failed"
                $codeErrors++
            }
        } elseif ($hasNode) {
            Write-Host "ESLint not available, using basic Node.js syntax check..."
            $current = 0
            foreach ($file in $jsFiles) {
                $current++
                Write-Host "  [$current/$($jsFiles.Count)] Checking $($file.Name)..."
                try {
                    node -c $file.FullName 2>$null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "    ${Green}✓${Reset} OK"
                    } else {
                        Write-Host "    ${Red}✗${Reset} Syntax error"
                        $codeErrors++
                    }
                } catch {
                    Write-Host "    ${Red}✗${Reset} Syntax error"
                    $codeErrors++
                }
            }
        } else {
            Write-Host "${Yellow}⚠${Reset} No JavaScript validation tools available (skipping)"
        }
    } else {
        Write-Host "No JavaScript/TypeScript files found (skipping)"
    }
    Write-Host ""
    
    # Python validation
    Write-Host "Scanning for Python files..."
    $pyFiles = Get-ChildItem -Recurse -Include *.py | Where-Object { $_.FullName -notmatch "__pycache__" } | Select-Object -First 20
    if ($pyFiles) {
        Write-Host "Found $($pyFiles.Count) Python files to validate..."
        
        # Always use basic Python syntax check (fast and reliable)
        if ($hasPython) {
            Write-Host "Running Python syntax validation..."
            $current = 0
            foreach ($file in $pyFiles) {
                $current++
                Write-Host "  [$current/$($pyFiles.Count)] Checking $($file.Name)..."
                try {
                    $output = python -m py_compile $file.FullName 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "    ${Green}✓${Reset} OK"
                    } else {
                        Write-Host "    ${Red}✗${Reset} Syntax error"
                        if ($output) {
                            Write-Host "    $output"
                        }
                        $codeErrors++
                    }
                } catch {
                    Write-Host "    ${Red}✗${Reset} Syntax error: $($_.Exception.Message)"
                    $codeErrors++
                }
            }
            
            # Suggest PyLint for deeper analysis
            if ($hasPylint) {
                Write-Host ""
                Write-Host "${Blue}ℹ${Reset} PyLint is available. Run 'pylint <file>' manually for detailed code quality checks."
            }
        } else {
            Write-Host "${Yellow}⚠${Reset} Python not found (skipping)"
        }
    } else {
        Write-Host "No Python files found (skipping)"
    }
    Write-Host ""
    
    # PowerShell script validation
    Write-Host "Scanning for PowerShell scripts..."
    $ps1Files = Get-ChildItem -Recurse -Include *.ps1 | Select-Object -First 10
    if ($ps1Files) {
        Write-Host "Found $($ps1Files.Count) PowerShell scripts to validate..."
        $current = 0
        foreach ($file in $ps1Files) {
            $current++
            Write-Host "  [$current/$($ps1Files.Count)] Checking $($file.Name)..."
            try {
                $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $file.FullName -Raw), [ref]$null)
                Write-Host "    ${Green}✓${Reset} OK"
            } catch {
                Write-Host "    ${Red}✗${Reset} Syntax error"
                $codeErrors++
            }
        }
    } else {
        Write-Host "No PowerShell scripts found (skipping)"
    }
    Write-Host ""
    
    $script:TotalErrors += $codeErrors
    Write-Host ""
}
function Test-Workflows {
    Write-Host "${Blue}=== Workflow Validation ===${Reset}"
    
    if ($DryRun) {
        Write-Host "Would validate: .gsd/workflows/*.md files"
        return
    }
    
    $workflowErrors = 0
    $workflowsChecked = 0
    
    if (-not (Test-Path ".gsd/workflows")) {
        Write-Host "${Yellow}⚠${Reset} No .gsd/workflows directory found (skipping)"
        return
    }
    
    Write-Host "Scanning for workflow files..."
    $workflowFiles = Get-ChildItem ".gsd/workflows/*.md"
    Write-Host "Found $($workflowFiles.Count) workflow files to validate..."
    
    $current = 0
    foreach ($file in $workflowFiles) {
        $current++
        $workflowsChecked++
        $filename = $file.Name
        Write-Host "  [$current/$($workflowFiles.Count)] Checking $filename..."
        $hasErrors = $false
        
        # Check for frontmatter
        $firstLine = Get-Content $file.FullName -First 1
        if ($firstLine -notmatch "^---") {
            Write-Host "    ${Red}✗${Reset} Missing frontmatter"
            $workflowErrors++
            $hasErrors = $true
        }
        
        # Check for description
        $content = Get-Content $file.FullName -Raw
        if ($content -notmatch "description:") {
            Write-Host "    ${Red}✗${Reset} Missing description in frontmatter"
            $workflowErrors++
            $hasErrors = $true
        }
        
        if (-not $hasErrors) {
            Write-Host "    ${Green}✓${Reset} OK"
        }
    }
    
    Write-Host ""
    Write-Host "Summary: $workflowsChecked workflows checked, $workflowErrors errors"
    $script:TotalErrors += $workflowErrors
    Write-Host ""
}

function Test-Skills {
    Write-Host "${Blue}=== Skills Validation ===${Reset}"
    
    if ($DryRun) {
        Write-Host "Would validate: .agent/skills/*/SKILL.md files"
        return
    }
    
    $skillErrors = 0
    $skillsChecked = 0
    
    if (-not (Test-Path ".agent/skills")) {
        Write-Host "${Yellow}⚠${Reset} No .agent/skills directory found"
        return
    }
    
    $skillDirs = Get-ChildItem ".agent/skills" -Directory
    foreach ($skillDir in $skillDirs) {
        $skillsChecked++
        $skillName = $skillDir.Name
        $skillFile = Join-Path $skillDir.FullName "SKILL.md"
        $hasErrors = $false
        
        # Check SKILL.md exists
        if (-not (Test-Path $skillFile)) {
            Write-Host "${Red}✗${Reset} $skillName`: Missing SKILL.md"
            $skillErrors++
            continue
        }
        
        # Check for frontmatter
        $firstLine = Get-Content $skillFile -First 1
        if ($firstLine -notmatch "^---") {
            Write-Host "${Red}✗${Reset} $skillName`: Missing frontmatter"
            $skillErrors++
            $hasErrors = $true
        }
        
        if (-not $hasErrors) {
            Write-Host "${Green}✓${Reset} $skillName"
        }
    }
    
    Write-Host "Skills checked: $skillsChecked, Errors: $skillErrors"
    $script:TotalErrors += $skillErrors
    Write-Host ""
}

function Test-Templates {
    Write-Host "${Blue}=== Templates Validation ===${Reset}"
    
    if ($DryRun) {
        Write-Host "Would validate: .gsd/templates/*.md files"
        return
    }
    
    $templateErrors = 0
    $templatesChecked = 0
    
    if (-not (Test-Path ".gsd/templates")) {
        Write-Host "${Yellow}⚠${Reset} No .gsd/templates directory found"
        return
    }
    
    $templateFiles = Get-ChildItem ".gsd/templates/*.md"
    foreach ($file in $templateFiles) {
        $templatesChecked++
        $filename = $file.Name
        $hasErrors = $false
        
        # Check for title (# heading)
        $firstLine = Get-Content $file.FullName -First 1
        if ($firstLine -notmatch "^# ") {
            Write-Host "${Red}✗${Reset} $filename`: Missing title (# heading)"
            $templateErrors++
            $hasErrors = $true
        }
        
        if (-not $hasErrors) {
            Write-Host "${Green}✓${Reset} $filename"
        }
    }
    
    Write-Host "Templates checked: $templatesChecked, Errors: $templateErrors"
    $script:TotalErrors += $templateErrors
    Write-Host ""
}

# Main execution
if ($Help) {
    Show-Help
    exit 0
}

# If -All is specified, enable all validations
if ($All) {
    $Code = $true
    $Workflows = $true
    $Skills = $true
    $Templates = $true
}

# If no specific validation requested, default to -All
if (-not ($Code -or $Workflows -or $Skills -or $Templates)) {
    $All = $true
    $Code = $true
    $Workflows = $true
    $Skills = $true
    $Templates = $true
}

Write-Host "${Blue}=== GSD Consolidated Validation ===${Reset}"
Write-Host "Environment: $($PSVersionTable.OS)"
Write-Host "PowerShell: $($PSVersionTable.PSVersion)"
Write-Host "Working Directory: $(Get-Location)"

if ($DryRun) {
    Write-Host "${Blue}=== DRY RUN MODE ===${Reset}"
}

Write-Host ""

if ($Code) { Test-Code }
if ($Workflows) { Test-Workflows }
if ($Skills) { Test-Skills }
if ($Templates) { Test-Templates }

# Summary
Write-Host "${Blue}=== Validation Summary ===${Reset}"
if ($DryRun) {
    Write-Host "${Blue}ℹ${Reset} Dry run completed - no actual validation performed"
} elseif ($script:TotalErrors -eq 0) {
    Write-Host "${Green}✓${Reset} All validations passed"
} else {
    Write-Host "${Red}✗${Reset} Validation failed with $($script:TotalErrors) error(s)"
}

exit $script:TotalErrors