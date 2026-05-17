# memory-recent.ps1 - Show recent memory entries

param(
    [ValidateSet("journal", "decision", "pattern", "learning")]
    [string]$Type,
    
    [int]$Limit = 5,
    [switch]$Full,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

# Configuration
$MEMORY_DIR = ".gsd/memory"

# Usage
function Show-Help {
    Write-Host @"
Show recent memory entries

USAGE:
    .\memory-recent.ps1 [OPTIONS]

OPTIONS:
    -Type TYPE          Filter by type (journal, decision, pattern, learning)
    -Limit N            Number of entries (default: 5)
    -Full               Show full content (default: summary only)
    -Help               Show this help

EXAMPLES:
    # Last 5 entries
    .\memory-recent.ps1

    # Last 10 journal entries
    .\memory-recent.ps1 -Type journal -Limit 10

    # Last 3 entries with full content
    .\memory-recent.ps1 -Limit 3 -Full

"@
}

# Show entry summary
function Show-EntrySummary {
    param([string]$FilePath)
    
    $filename = Split-Path $FilePath -Leaf
    $dirname = Split-Path (Split-Path $FilePath -Parent) -Leaf
    
    Write-Host $filename -ForegroundColor Green
    Write-Host $dirname -ForegroundColor Cyan
    
    # Show first few lines
    Get-Content $FilePath | Select-Object -First 5 | Select-Object -Last 3 | ForEach-Object {
        Write-Host $_
    }
    Write-Host ""
}

# Show full entry
function Show-EntryFull {
    param([string]$FilePath)
    
    $filename = Split-Path $FilePath -Leaf
    $dirname = Split-Path (Split-Path $FilePath -Parent) -Leaf
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host $filename -ForegroundColor Green
    Write-Host $dirname -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host ""
    Get-Content $FilePath | ForEach-Object { Write-Host $_ }
    Write-Host ""
}

# Main
if ($Help) {
    Show-Help
    exit 0
}

# Determine search directory
$searchDir = $MEMORY_DIR
if ($Type) {
    $searchDir = Join-Path $MEMORY_DIR $Type
}

if (-not (Test-Path $searchDir)) {
    Write-Host "No entries found"
    exit 0
}

Write-Host "Recent memory entries:" -ForegroundColor Blue
Write-Host ""

# Find and sort files by modification time
$files = Get-ChildItem -Path $searchDir -Filter "*.md" -Recurse |
    Where-Object { $_.DirectoryName -notmatch "templates" } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First $Limit

if ($files.Count -eq 0) {
    Write-Host "No entries found"
    exit 0
}

# Show entries
foreach ($file in $files) {
    if ($Full) {
        Show-EntryFull -FilePath $file.FullName
    }
    else {
        Show-EntrySummary -FilePath $file.FullName
    }
}
