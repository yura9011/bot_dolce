# memory-index.ps1 - Index memory entries with SQLite FTS5

$ErrorActionPreference = "Stop"

# Configuration
$DB_PATH = ".gsd/memory/index.db"
$MEMORY_DIR = ".gsd/memory"

# Logging
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if sqlite3 is available
function Test-Sqlite {
    try {
        $null = Get-Command sqlite3 -ErrorAction Stop
        return $true
    }
    catch {
        Write-ErrorMsg "sqlite3 not found. Please install SQLite."
        Write-Info "Download from: https://www.sqlite.org/download.html"
        Write-Info "Or install via: choco install sqlite"
        return $false
    }
}

# Create database and table
function New-MemoryDatabase {
    Write-Info "Creating database: $DB_PATH"
    
    $sql = @"
-- Create FTS5 virtual table
CREATE VIRTUAL TABLE IF NOT EXISTS memory USING fts5(
    filename,
    type,
    date,
    tags,
    content,
    tokenize = 'porter unicode61'
);

-- Create metadata table
CREATE TABLE IF NOT EXISTS metadata (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- Store last index time
INSERT OR REPLACE INTO metadata (key, value) 
VALUES ('last_indexed', datetime('now'));
"@
    
    $sql | sqlite3 $DB_PATH
    
    Write-Success "Database created"
}

# Extract metadata from markdown file
function Get-FileMetadata {
    param([string]$FilePath)
    
    $type = ""
    $date = ""
    $tags = ""
    
    # Determine type from directory
    if ($FilePath -match "\\journal\\") {
        $type = "journal"
    }
    elseif ($FilePath -match "\\decisions\\") {
        $type = "decision"
    }
    elseif ($FilePath -match "\\patterns\\") {
        $type = "pattern"
    }
    elseif ($FilePath -match "\\learnings\\") {
        $type = "learning"
    }
    
    # Extract date from filename (YYYY-MM-DD format)
    $filename = Split-Path $FilePath -Leaf
    if ($filename -match "^(\d{4}-\d{2}-\d{2})") {
        $date = $Matches[1]
    }
    
    # Extract tags from content
    $content = Get-Content $FilePath -Raw
    if ($content -match '`([^`]+)`[^`]*$') {
        $tags = $Matches[1]
    }
    
    return @{
        Type = $type
        Date = $date
        Tags = $tags
    }
}

# Index a single file
function Add-FileToIndex {
    param([string]$FilePath)
    
    # Skip if not a markdown file
    if ($FilePath -notmatch '\.md$') {
        return
    }
    
    # Skip templates
    if ($FilePath -match "\\templates\\") {
        return
    }
    
    # Extract metadata
    $metadata = Get-FileMetadata -FilePath $FilePath
    
    # Read content
    $content = Get-Content $FilePath -Raw
    
    # Escape single quotes for SQL
    $content = $content -replace "'", "''"
    $tags = $metadata.Tags -replace "'", "''"
    $filePath = $FilePath -replace "'", "''"
    
    # Insert into database
    $sql = @"
INSERT INTO memory (filename, type, date, tags, content)
VALUES ('$filePath', '$($metadata.Type)', '$($metadata.Date)', '$tags', '$content');
"@
    
    $sql | sqlite3 $DB_PATH
}

# Index all files
function Update-MemoryIndex {
    Write-Info "Indexing memory files..."
    
    # Clear existing index
    "DELETE FROM memory;" | sqlite3 $DB_PATH
    
    $count = 0
    
    # Index journal entries
    if (Test-Path "$MEMORY_DIR/journal") {
        Get-ChildItem "$MEMORY_DIR/journal/*.md" -ErrorAction SilentlyContinue | ForEach-Object {
            Add-FileToIndex -FilePath $_.FullName
            $count++
        }
    }
    
    # Index decisions
    if (Test-Path "$MEMORY_DIR/decisions") {
        Get-ChildItem "$MEMORY_DIR/decisions/*.md" -ErrorAction SilentlyContinue | ForEach-Object {
            Add-FileToIndex -FilePath $_.FullName
            $count++
        }
    }
    
    # Index patterns
    if (Test-Path "$MEMORY_DIR/patterns") {
        Get-ChildItem "$MEMORY_DIR/patterns/*.md" -ErrorAction SilentlyContinue | ForEach-Object {
            Add-FileToIndex -FilePath $_.FullName
            $count++
        }
    }
    
    # Index learnings
    if (Test-Path "$MEMORY_DIR/learnings") {
        Get-ChildItem "$MEMORY_DIR/learnings/*.md" -ErrorAction SilentlyContinue | ForEach-Object {
            Add-FileToIndex -FilePath $_.FullName
            $count++
        }
    }
    
    Write-Success "Indexed $count files"
}

# Main
if (-not (Test-Sqlite)) {
    exit 1
}

# Create database if it doesn't exist
if (-not (Test-Path $DB_PATH)) {
    New-MemoryDatabase
}

# Index all files
Update-MemoryIndex

Write-Success "Memory index updated"
