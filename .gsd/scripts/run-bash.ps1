# Helper script to run bash scripts on Windows using Git Bash
# Usage: .\run-bash.ps1 <script-path> [arguments]

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$ScriptPath,
    
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
)

# Find Git Bash
$gitBashPaths = @(
    "C:\Program Files\Git\bin\bash.exe",
    "C:\Program Files (x86)\Git\bin\bash.exe",
    "$env:ProgramFiles\Git\bin\bash.exe",
    "${env:ProgramFiles(x86)}\Git\bin\bash.exe"
)

$bashExe = $null
foreach ($path in $gitBashPaths) {
    if (Test-Path $path) {
        $bashExe = $path
        break
    }
}

if (-not $bashExe) {
    Write-Error "Git Bash not found. Please install Git for Windows from https://git-scm.com/"
    exit 1
}

# Run the script with Git Bash
& $bashExe $ScriptPath @Arguments
exit $LASTEXITCODE