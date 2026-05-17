# memory-search.ps1 - Search agent memory

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Query,
    
    [ValidateSet("journal", "decision", "pattern", "learning")]
    [string]$Type,
    
    [string]$From,
    [string]$To,
    [int]$Limit = 10,
    [switch]$External,
    [switch]$All,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

# Configuration
$DB_PATH = ".gsd/memory/.index/memory.db"
$EXTERNAL_DB_PATH = ".gsd/memory/.index/external.db"
$MEMORY_DIR = ".gsd/memory"

# Usage
function Show-Help {
    Write-Host @"
Search agent memory

USAGE:
    .\memory-search.ps1 QUERY [OPTIONS]

OPTIONS:
    -Type TYPE          Filter by type (journal, decision, pattern, learning)
    -From DATE          Filter from date (YYYY-MM-DD)
    -To DATE            Filter to date (YYYY-MM-DD)
    -Limit N            Limit results (default: 10)
    -External           Search external knowledge base only
    -All                Search both GSD memory and external sources
    -Help               Show this help

EXAMPLES:
    # Search GSD memory (default)
    .\memory-search.ps1 "user communication"

    # Search external knowledge base
    .\memory-search.ps1 "obsidian notes" -External

    # Search everything
    .\memory-search.ps1 "project documentation" -All

    # Search journal only
    .\memory-search.ps1 "migration" -Type journal

    # Search date range
    .\memory-search.ps1 "bash" -From "2026-02-20" -To "2026-02-25"

    # Limit results
    .\memory-search.ps1 "decision" -Limit 5

"@
}

# Search external knowledge base
function Search-External {
    param(
        [string]$Query,
        [int]$Limit
    )
    
    if (-not (Test-Path $EXTERNAL_DB_PATH)) {
        Write-Host "External index not found. Run memory-index-external.ps1 first." -ForegroundColor Yellow
        return
    }
    
    $sql = @"
SELECT 
    filename,
    source,
    snippet(documents, 2, '<mark>', '</mark>', '...', 64) as snippet
FROM documents
WHERE content MATCH '$Query'
ORDER BY rank
LIMIT $Limit;
"@
    
    $results = $sql | sqlite3 $EXTERNAL_DB_PATH
    
    if ($results) {
        Write-Host "External Knowledge Base Results:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host $results
    } else {
        Write-Host "No results found in external sources" -ForegroundColor Yellow
    }
}

# Search with SQLite FTS5
function Search-WithSqlite {
    param(
        [string]$Query,
        [string]$Type,
        [string]$FromDate,
        [string]$ToDate,
        [int]$Limit
    )
    
    $whereClause = "content MATCH '$Query'"
    
    if ($Type) {
        $whereClause += " AND type = '$Type'"
    }
    
    if ($FromDate) {
        $whereClause += " AND date >= '$FromDate'"
    }
    
    if ($ToDate) {
        $whereClause += " AND date <= '$ToDate'"
    }
    
    $sql = @"
.mode column
.headers on
SELECT 
    type,
    date,
    filename,
    snippet(memory, 4, '<mark>', '</mark>', '...', 32) as snippet
FROM memory
WHERE $whereClause
ORDER BY rank
LIMIT $Limit;
"@
    
    $sql | sqlite3 $DB_PATH
}

# Search with Select-String (fallback)
function Search-WithSelectString {
    param(
        [string]$Query,
        [string]$Type,
        [int]$Limit
    )
    
    $searchDir = $MEMORY_DIR
    
    if ($Type) {
        $searchDir = Join-Path $MEMORY_DIR $Type
    }
    
    if (-not (Test-Path $searchDir)) {
        Write-Host "No results found"
        return
    }
    
    Write-Host "Results:" -ForegroundColor Cyan
    Write-Host ""
    
    Get-ChildItem -Path $searchDir -Filter "*.md" -Recurse | 
        Select-String -Pattern $Query -Context 2 |
        Select-Object -First $Limit |
        ForEach-Object {
            Write-Host "$($_.Filename):$($_.LineNumber)" -ForegroundColor Green
            Write-Host $_.Line
            Write-Host ""
        }
}

# Main
if ($Help) {
    Show-Help
    exit 0
}

# Check if SQLite is available
$hasSqlite = $null -ne (Get-Command sqlite3 -ErrorAction SilentlyContinue)

if (-not $hasSqlite) {
    Write-Host "SQLite not available, using Select-String..." -ForegroundColor Yellow
    Write-Host ""
    Search-WithSelectString -Query $Query -Type $Type -Limit $Limit
    exit 0
}

# Determine what to search
if ($External) {
    # External only
    Search-External -Query $Query -Limit $Limit
}
elseif ($All) {
    # Both GSD memory and external
    if (Test-Path $DB_PATH) {
        Write-Host "=== GSD Memory ===" -ForegroundColor Cyan
        Write-Host ""
        Search-WithSqlite -Query $Query -Type $Type -FromDate $From -ToDate $To -Limit $Limit
        Write-Host ""
        Write-Host ""
    }
    
    if (Test-Path $EXTERNAL_DB_PATH) {
        Write-Host "=== External Knowledge Base ===" -ForegroundColor Cyan
        Write-Host ""
        Search-External -Query $Query -Limit $Limit
    }
}
else {
    # GSD memory only (default)
    if (Test-Path $DB_PATH) {
        Write-Host "Searching GSD memory..." -ForegroundColor Blue
        Write-Host ""
        Search-WithSqlite -Query $Query -Type $Type -FromDate $From -ToDate $To -Limit $Limit
    } else {
        Write-Host "GSD memory index not found. Run memory-index.ps1 first." -ForegroundColor Yellow
    }
}
