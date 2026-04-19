# Universal Validation Script - Works in any environment with any AI assistant
# Part of GSD Universal Protocol

param(
    [switch]$DryRun
)

# Global exit code
$script:ExitCode = 0

# Colors for output (with fallback for environments without color support)
$Red = if ($Host.UI.SupportsVirtualTerminal) { "`e[31m" } else { "" }
$Green = if ($Host.UI.SupportsVirtualTerminal) { "`e[32m" } else { "" }
$Yellow = if ($Host.UI.SupportsVirtualTerminal) { "`e[33m" } else { "" }
$Blue = if ($Host.UI.SupportsVirtualTerminal) { "`e[34m" } else { "" }
$Reset = if ($Host.UI.SupportsVirtualTerminal) { "`e[0m" } else { "" }

if ($DryRun) {
    Write-Host "${Blue}=== DRY RUN MODE ===${Reset}"
}

Write-Host "${Blue}=== GSD Universal Validation ===${Reset}"
Write-Host "Environment: $($PSVersionTable.OS)"
Write-Host "PowerShell: $($PSVersionTable.PSVersion)"
Write-Host "Working Directory: $(Get-Location)"
Write-Host ""

# Tool availability detection
Write-Host "${Blue}=== Tool Availability Check ===${Reset}"
$HasNode = $false
$HasPython = $false
$HasEslint = $false
$HasPylint = $false
$HasTsc = $false
$HasMarkdownlint = $false

if (Get-Command node -ErrorAction SilentlyContinue) {
    $HasNode = $true
    $nodeVersion = node --version
    Write-Host "${Green}✓${Reset} Node.js available ($nodeVersion)"
} else {
    Write-Host "${Yellow}✗${Reset} Node.js not found"
}

if (Get-Command python -ErrorAction SilentlyContinue) {
    $HasPython = $true
    $pythonVersion = python --version 2>&1
    Write-Host "${Green}✓${Reset} Python available ($pythonVersion)"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $HasPython = $true
    $pythonVersion = python3 --version
    Write-Host "${Green}✓${Reset} Python3 available ($pythonVersion)"
    Set-Alias python python3
} else {
    Write-Host "${Yellow}✗${Reset} Python not found"
}

try {
    $eslintVersion = npx eslint --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        $HasEslint = $true
        Write-Host "${Green}✓${Reset} ESLint available ($eslintVersion)"
    } else {
        Write-Host "${Yellow}✗${Reset} ESLint not found"
    }
} catch {
    Write-Host "${Yellow}✗${Reset} ESLint not found"
}

if (Get-Command pylint -ErrorAction SilentlyContinue) {
    $HasPylint = $true
    $pylintVersion = (pylint --version | Select-Object -First 1)
    Write-Host "${Green}✓${Reset} PyLint available ($pylintVersion)"
} else {
    Write-Host "${Yellow}✗${Reset} PyLint not found"
}

try {
    $tscVersion = npx tsc --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        $HasTsc = $true
        Write-Host "${Green}✓${Reset} TypeScript available ($tscVersion)"
    } else {
        Write-Host "${Yellow}✗${Reset} TypeScript not found"
    }
} catch {
    Write-Host "${Yellow}✗${Reset} TypeScript not found"
}

if (Get-Command markdownlint -ErrorAction SilentlyContinue) {
    $HasMarkdownlint = $true
    Write-Host "${Green}✓${Reset} MarkdownLint available"
} else {
    Write-Host "${Yellow}✗${Reset} MarkdownLint not found"
}

Write-Host ""

# JavaScript/TypeScript validation
$jsFiles = Get-ChildItem -Recurse -Include *.js,*.jsx,*.ts,*.tsx | Where-Object { $_.FullName -notmatch "node_modules" } | Select-Object -First 20
if ($jsFiles) {
    Write-Host "${Blue}=== JavaScript/TypeScript Validation ===${Reset}"
    
    if ($HasEslint) {
        Write-Host "Running ESLint..."
        if (-not $DryRun) {
            try {
                npx eslint . --ext .js,.jsx,.ts,.tsx --ignore-path .gitignore 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "${Green}✓${Reset} ESLint validation passed"
                } else {
                    Write-Host "${Red}✗${Reset} ESLint validation failed"
                    $script:ExitCode = 1
                }
            } catch {
                Write-Host "${Red}✗${Reset} ESLint validation failed"
                $script:ExitCode = 1
            }
        } else {
            Write-Host "Would run: npx eslint . --ext .js,.jsx,.ts,.tsx"
        }
    } elseif ($HasNode) {
        Write-Host "ESLint not available, using basic Node.js syntax check..."
        if (-not $DryRun) {
            foreach ($file in $jsFiles) {
                try {
                    node -c $file.FullName 2>$null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "${Green}✓${Reset} $($file.Name)"
                    } else {
                        Write-Host "${Red}✗${Reset} $($file.Name) - syntax error"
                        $script:ExitCode = 1
                    }
                } catch {
                    Write-Host "${Red}✗${Reset} $($file.Name) - syntax error"
                    $script:ExitCode = 1
                }
            }
        } else {
            Write-Host "Would check syntax for JS/TS files using Node.js"
        }
    } else {
        Write-Host "${Yellow}⚠${Reset} No JavaScript validation tools available"
        Write-Host "Manual verification required:"
        Write-Host "  - Check balanced braces, brackets, parentheses"
        Write-Host "  - Verify semicolons and commas"
        Write-Host "  - Confirm import/export syntax"
    }
    Write-Host ""
}

# Python validation
$pyFiles = Get-ChildItem -Recurse -Include *.py | Where-Object { $_.FullName -notmatch "__pycache__" } | Select-Object -First 20
if ($pyFiles) {
    Write-Host "${Blue}=== Python Validation ===${Reset}"
    
    if ($HasPylint) {
        Write-Host "Running PyLint..."
        if (-not $DryRun) {
            try {
                $pyFilePaths = $pyFiles | ForEach-Object { $_.FullName }
                pylint @pyFilePaths 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "${Green}✓${Reset} PyLint validation passed"
                } else {
                    Write-Host "${Red}✗${Reset} PyLint validation failed"
                    $script:ExitCode = 1
                }
            } catch {
                Write-Host "${Red}✗${Reset} PyLint validation failed"
                $script:ExitCode = 1
            }
        } else {
            Write-Host "Would run: pylint on Python files"
        }
    } elseif ($HasPython) {
        Write-Host "PyLint not available, using basic Python syntax check..."
        if (-not $DryRun) {
            foreach ($file in $pyFiles) {
                try {
                    python -m py_compile $file.FullName 2>$null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "${Green}✓${Reset} $($file.Name)"
                    } else {
                        Write-Host "${Red}✗${Reset} $($file.Name) - syntax error"
                        $script:ExitCode = 1
                    }
                } catch {
                    Write-Host "${Red}✗${Reset} $($file.Name) - syntax error"
                    $script:ExitCode = 1
                }
            }
        } else {
            Write-Host "Would check syntax for Python files"
        }
    } else {
        Write-Host "${Yellow}⚠${Reset} No Python validation tools available"
        Write-Host "Manual verification required:"
        Write-Host "  - Check indentation consistency"
        Write-Host "  - Verify colon placement after if/for/def/class"
        Write-Host "  - Confirm parentheses matching"
    }
    Write-Host ""
}

# Markdown validation
$mdFiles = Get-ChildItem -Recurse -Include *.md | Select-Object -First 20
if ($mdFiles) {
    Write-Host "${Blue}=== Markdown Validation ===${Reset}"
    
    if ($HasMarkdownlint) {
        Write-Host "Running MarkdownLint..."
        if (-not $DryRun) {
            try {
                $mdFilePaths = $mdFiles | ForEach-Object { $_.FullName }
                markdownlint @mdFilePaths 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "${Green}✓${Reset} MarkdownLint validation passed"
                } else {
                    Write-Host "${Red}✗${Reset} MarkdownLint validation failed"
                    $script:ExitCode = 1
                }
            } catch {
                Write-Host "${Red}✗${Reset} MarkdownLint validation failed"
                $script:ExitCode = 1
            }
        } else {
            Write-Host "Would run: markdownlint on Markdown files"
        }
    } else {
        Write-Host "MarkdownLint not available, using basic validation..."
        if (-not $DryRun) {
            foreach ($file in $mdFiles) {
                if (Test-Path $file.FullName -PathType Leaf) {
                    Write-Host "${Green}✓${Reset} $($file.Name) - readable"
                } else {
                    Write-Host "${Red}✗${Reset} $($file.Name) - not readable"
                    $script:ExitCode = 1
                }
            }
        } else {
            Write-Host "Would check basic Markdown file readability"
        }
        Write-Host "${Yellow}💡${Reset} Manual verification recommended:"
        Write-Host "  - Check link syntax [text](url)"
        Write-Host "  - Verify header hierarchy (# ## ###)"
        Write-Host "  - Confirm code block formatting"
    }
    Write-Host ""
}

# PowerShell script validation
$ps1Files = Get-ChildItem -Recurse -Include *.ps1 | Select-Object -First 10
if ($ps1Files) {
    Write-Host "${Blue}=== PowerShell Script Validation ===${Reset}"
    
    if (-not $DryRun) {
        foreach ($file in $ps1Files) {
            try {
                $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $file.FullName -Raw), [ref]$null)
                Write-Host "${Green}✓${Reset} $($file.Name)"
            } catch {
                Write-Host "${Red}✗${Reset} $($file.Name) - syntax error"
                $script:ExitCode = 1
            }
        }
    } else {
        Write-Host "Would check syntax for PowerShell scripts"
    }
    Write-Host ""
}

# Summary
Write-Host "${Blue}=== Validation Summary ===${Reset}"
if ($DryRun) {
    Write-Host "${Blue}ℹ${Reset} Dry run completed - no actual validation performed"
    Write-Host "Universal validation script is ready to use"
} elseif ($script:ExitCode -eq 0) {
    Write-Host "${Green}✓${Reset} All validations passed"
    Write-Host "Code quality verification complete"
} else {
    Write-Host "${Red}✗${Reset} Validation failed with $($script:ExitCode) error(s)"
    Write-Host "Please fix issues and re-run validation"
}

Write-Host ""
Write-Host "${Blue}💡 Tip:${Reset} Install additional tools for enhanced validation:"
Write-Host "  npm install -g eslint @typescript-eslint/parser"
Write-Host "  pip install pylint"
Write-Host "  npm install -g markdownlint-cli"

exit $script:ExitCode