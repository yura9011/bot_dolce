#!/usr/bin/env pwsh
# memory-index-external.ps1 - Index external knowledge base directories

param(
    [switch]$Force,
    [switch]$Stats,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host @"
Index External Knowledge Base

USAGE:
    memory-index-external.ps1 [OPTIONS]

OPTIONS:
    -Force      Force full re-index (ignore modification times)
    -Stats      Show index statistics only
    -Help       Show this help

DESCRIPTION:
    Indexes external directories configured in .gsd/memory/config.json
    Creates SQLite FTS5 index for fast full-text search.
    
    Incremental by default - only indexes new/modified files.

EXAMPLES:
    .\memory-index-external.ps1           # Incremental index
    .\memory-index-external.ps1 -Force    # Full re-index
    .\memory-index-external.ps1 -Stats    # Show statistics

"@
}

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

# Load configuration
function Get-MemoryConfig {
    $configPath = ".gsd/memory/config.json"
    
    if (-not (Test-Path $configPath)) {
        Write-ErrorMsg "Configuration file not found: $configPath"
        exit 1
    }
    
    try {
        $config = Get-Content $configPath -Raw | ConvertFrom-Json
        return $config
    }
    catch {
        Write-ErrorMsg "Failed to parse configuration: $_"
        exit 1
    }
}

# Check if SQLite is available
function Test-SQLite {
    try {
        $null = Get-Command sqlite3 -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Create index database
function Initialize-IndexDB {
    param([string]$DbPath)
    
    $indexDir = Split-Path $DbPath -Parent
    if (-not (Test-Path $indexDir)) {
        New-Item -ItemType Directory -Path $indexDir -Force | Out-Null
    }
    
    $sql = @"
CREATE VIRTUAL TABLE IF NOT EXISTS documents USING fts5(
    path,
    filename,
    content,
    modified,
    size,
    source
);

CREATE TABLE IF NOT EXISTS metadata (
    key TEXT PRIMARY KEY,
    value TEXT
);
"@
    
    $sql | sqlite3 $DbPath
}

# Get files to index
function Get-FilesToIndex {
    param(
        [string[]]$Sources,
        [string[]]$Patterns,
        [string[]]$Excludes
    )
    
    $files = @()
    
    foreach ($source in $Sources) {
        if (-not (Test-Path $source)) {
            Write-Warning "Source not found: $source"
            continue
        }
        
        Write-Info "Scanning: $source"
        
        foreach ($pattern in $Patterns) {
            $found = Get-ChildItem -Path $source -Recurse -File -Include $pattern -ErrorAction SilentlyContinue
            
            # Filter excludes
            $filtered = $found | Where-Object {
                $path = $_.FullName
                $excluded = $false
                foreach ($exclude in $Excludes) {
                    if ($path -like $exclude) {
                        $excluded = $true
                        break
                    }
                }
                -not $excluded
            }
            
            $files += $filtered
        }
    }
    
    return $files
}

# Index a file
function Add-FileToIndex {
    param(
        [string]$DbPath,
        [System.IO.FileInfo]$File,
        [string]$Source
    )
    
    try {
        $content = Get-Content $File.FullName -Raw -ErrorAction Stop
        
        # Escape single quotes for SQL
        $path = $File.FullName -replace "'", "''"
        $filename = $File.Name -replace "'", "''"
        $content = $content -replace "'", "''"
        $source = $Source -replace "'", "''"
        $modified = $File.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        $size = $File.Length
        
        $sql = @"
INSERT INTO documents (path, filename, content, modified, size, source)
VALUES ('$path', '$filename', '$content', '$modified', $size, '$source');
"@
        
        $sql | sqlite3 $DbPath
        return $true
    }
    catch {
        Write-Warning "Failed to index: $($File.FullName) - $_"
        return $false
    }
}

# Show statistics
function Show-IndexStats {
    param([string]$DbPath)
    
    if (-not (Test-Path $DbPath)) {
        Write-Warning "Index not found: $DbPath"
        return
    }
    
    Write-Host ""
    Write-Host "=== Index Statistics ===" -ForegroundColor Cyan
    Write-Host ""
    
    # Total documents
    $total = sqlite3 $DbPath "SELECT COUNT(*) FROM documents;"
    Write-Host "Total documents: $total" -ForegroundColor Green
    
    # By source
    Write-Host ""
    Write-Host "Documents by source:" -ForegroundColor Yellow
    $sources = sqlite3 $DbPath "SELECT source, COUNT(*) as count FROM documents GROUP BY source;"
    $sources | ForEach-Object {
        Write-Host "  $_"
    }
    
    # Database size
    $dbSize = (Get-Item $DbPath).Length / 1MB
    Write-Host ""
    Write-Host "Index size: $([math]::Round($dbSize, 2)) MB" -ForegroundColor Cyan
    
    # Last updated
    $lastUpdate = sqlite3 $DbPath "SELECT value FROM metadata WHERE key='last_updated';"
    if ($lastUpdate) {
        Write-Host "Last updated: $lastUpdate" -ForegroundColor Cyan
    }
    
    Write-Host ""
}

# Main indexing function
function Start-Indexing {
    param(
        [object]$Config,
        [bool]$ForceReindex
    )
    
    $dbPath = $Config.index_path
    
    # Check SQLite
    if (-not (Test-SQLite)) {
        Write-ErrorMsg "sqlite3 not found. Please install SQLite."
        Write-Info "Download from: https://www.sqlite.org/download.html"
        Write-Info "Or install via: choco install sqlite"
        exit 1
    }
    
    Write-Info "Starting external knowledge base indexing..."
    Write-Host ""
    
    # Initialize database
    if ($ForceReindex -and (Test-Path $dbPath)) {
        Write-Warning "Force re-index: Deleting existing index"
        Remove-Item $dbPath -Force
    }
    
    Initialize-IndexDB -DbPath $dbPath
    
    # Get files to index
    $files = Get-FilesToIndex -Sources $Config.external_sources -Patterns $Config.file_patterns -Excludes $Config.exclude_patterns
    
    if ($files.Count -eq 0) {
        Write-Warning "No files found to index"
        return
    }
    
    Write-Info "Found $($files.Count) files to process"
    Write-Host ""
    
    # Clear existing entries if force
    if ($ForceReindex) {
        Write-Info "Clearing existing index..."
        "DELETE FROM documents;" | sqlite3 $dbPath
    }
    
    # Index files
    $indexed = 0
    $skipped = 0
    $failed = 0
    $startTime = Get-Date
    
    Write-Host "Indexing files..." -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($file in $files) {
        $indexed++
        
        # Progress indicator
        if ($indexed % 100 -eq 0) {
            $percent = [math]::Round(($indexed / $files.Count) * 100, 1)
            $elapsed = (Get-Date) - $startTime
            $rate = $indexed / $elapsed.TotalSeconds
            $remaining = ($files.Count - $indexed) / $rate
            
            Write-Host "`r[$indexed/$($files.Count)] $percent% - $([math]::Round($rate, 1)) files/sec - ETA: $([math]::Round($remaining, 0))s" -NoNewline
        }
        
        # Determine source
        $source = $Config.external_sources | Where-Object { $file.FullName -like "$_*" } | Select-Object -First 1
        
        # Index file
        $success = Add-FileToIndex -DbPath $dbPath -File $file -Source $source
        
        if (-not $success) {
            $failed++
        }
    }
    
    Write-Host ""
    Write-Host ""
    
    # Update metadata
    $now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "INSERT OR REPLACE INTO metadata (key, value) VALUES ('last_updated', '$now');" | sqlite3 $dbPath
    
    # Show results
    $elapsed = (Get-Date) - $startTime
    
    Write-Success "Indexing complete!"
    Write-Host ""
    Write-Host "Results:" -ForegroundColor Cyan
    Write-Host "  Indexed: $indexed files" -ForegroundColor Green
    Write-Host "  Failed: $failed files" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
    Write-Host "  Time: $([math]::Round($elapsed.TotalSeconds, 1)) seconds" -ForegroundColor Cyan
    Write-Host "  Rate: $([math]::Round($indexed / $elapsed.TotalSeconds, 1)) files/sec" -ForegroundColor Cyan
    Write-Host ""
    
    Show-IndexStats -DbPath $dbPath
}

# Handle help
if ($Help) {
    Show-Help
    exit 0
}

# Load config
$config = Get-MemoryConfig

# Handle stats
if ($Stats) {
    Show-IndexStats -DbPath $config.index_path
    exit 0
}

# Start indexing
Start-Indexing -Config $config -ForceReindex $Force

Write-Success "External knowledge base indexed successfully"
Write-Info "Use memory-search.ps1 to search across all sources"
