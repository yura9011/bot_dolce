#!/usr/bin/env pwsh
# memory-index-external-simple.ps1 - Simple file-based index (no SQLite required)

param(
    [switch]$Stats,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host @"
Index External Knowledge Base (Simple Version - No SQLite)

USAGE:
    memory-index-external-simple.ps1 [OPTIONS]

OPTIONS:
    -Stats      Show index statistics only
    -Help       Show this help

DESCRIPTION:
    Creates a simple JSON index of external directories.
    No SQLite required - uses PowerShell native features.

EXAMPLES:
    .\memory-index-external-simple.ps1        # Create index
    .\memory-index-external-simple.ps1 -Stats # Show statistics

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

# Load configuration
function Get-MemoryConfig {
    $configPath = ".gsd/memory/config.json"
    
    if (-not (Test-Path $configPath)) {
        Write-Warning "Configuration file not found: $configPath"
        return $null
    }
    
    try {
        $config = Get-Content $configPath -Raw | ConvertFrom-Json
        return $config
    }
    catch {
        Write-Warning "Failed to parse configuration: $_"
        return $null
    }
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

# Create index
function New-Index {
    param([object]$Config)
    
    Write-Info "Starting external knowledge base indexing..."
    Write-Host ""
    
    # Get files
    $files = Get-FilesToIndex -Sources $Config.external_sources -Patterns $Config.file_patterns -Excludes $Config.exclude_patterns
    
    if ($files.Count -eq 0) {
        Write-Warning "No files found to index"
        return
    }
    
    Write-Info "Found $($files.Count) files to index"
    Write-Host ""
    
    # Create index
    $index = @{
        created = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        sources = $Config.external_sources
        total_files = $files.Count
        files = @()
    }
    
    $startTime = Get-Date
    $indexed = 0
    
    Write-Host "Indexing files..." -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($file in $files) {
        $indexed++
        
        # Progress
        if ($indexed % 100 -eq 0) {
            $percent = [math]::Round(($indexed / $files.Count) * 100, 1)
            $elapsed = (Get-Date) - $startTime
            $rate = $indexed / $elapsed.TotalSeconds
            $remaining = ($files.Count - $indexed) / $rate
            
            Write-Host "`r[$indexed/$($files.Count)] $percent% - $([math]::Round($rate, 1)) files/sec - ETA: $([math]::Round($remaining, 0))s" -NoNewline
        }
        
        # Determine source
        $source = $Config.external_sources | Where-Object { $file.FullName -like "$_*" } | Select-Object -First 1
        
        # Add to index (metadata only, not full content for performance)
        $index.files += @{
            path = $file.FullName
            name = $file.Name
            size = $file.Length
            modified = $file.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
            source = $source
        }
    }
    
    Write-Host ""
    Write-Host ""
    
    # Save index
    $indexDir = ".gsd/memory/.index"
    if (-not (Test-Path $indexDir)) {
        New-Item -ItemType Directory -Path $indexDir -Force | Out-Null
    }
    
    $indexPath = Join-Path $indexDir "external-simple.json"
    $index | ConvertTo-Json -Depth 10 | Set-Content $indexPath -Encoding UTF8
    
    # Show results
    $elapsed = (Get-Date) - $startTime
    
    Write-Success "Indexing complete!"
    Write-Host ""
    Write-Host "Results:" -ForegroundColor Cyan
    Write-Host "  Indexed: $indexed files" -ForegroundColor Green
    Write-Host "  Time: $([math]::Round($elapsed.TotalSeconds, 1)) seconds" -ForegroundColor Cyan
    Write-Host "  Rate: $([math]::Round($indexed / $elapsed.TotalSeconds, 1)) files/sec" -ForegroundColor Cyan
    Write-Host "  Index: $indexPath" -ForegroundColor Cyan
    Write-Host ""
    
    Show-Stats -IndexPath $indexPath
}

# Show statistics
function Show-Stats {
    param([string]$IndexPath)
    
    if (-not $IndexPath) {
        $IndexPath = ".gsd/memory/.index/external-simple.json"
    }
    
    if (-not (Test-Path $IndexPath)) {
        Write-Warning "Index not found: $IndexPath"
        return
    }
    
    $index = Get-Content $IndexPath -Raw | ConvertFrom-Json
    
    Write-Host ""
    Write-Host "=== Index Statistics ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Created: $($index.created)" -ForegroundColor Green
    Write-Host "Total files: $($index.total_files)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Sources:" -ForegroundColor Yellow
    $index.sources | ForEach-Object {
        $source = $_
        $count = ($index.files | Where-Object { $_.source -eq $source }).Count
        Write-Host "  $source : $count files"
    }
    Write-Host ""
    
    # Index size
    $indexSize = (Get-Item $IndexPath).Length / 1MB
    Write-Host "Index size: $([math]::Round($indexSize, 2)) MB" -ForegroundColor Cyan
    Write-Host ""
}

# Main
if ($Help) {
    Show-Help
    exit 0
}

# Load config
$config = Get-MemoryConfig

if (-not $config) {
    Write-Warning "Using default configuration"
    $config = @{
        external_sources = @("D:/tareas/Obsidian Vault")
        file_patterns = @("*.md", "*.txt")
        exclude_patterns = @("**/node_modules/**", "**/.git/**", "**/.obsidian/**")
    }
}

# Handle stats
if ($Stats) {
    Show-Stats
    exit 0
}

# Create index
New-Index -Config $config

Write-Success "External knowledge base indexed successfully"
Write-Info "Use Select-String to search: Get-ChildItem -Recurse | Select-String 'query'"
