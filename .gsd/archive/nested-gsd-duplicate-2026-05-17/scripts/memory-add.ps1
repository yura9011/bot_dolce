# memory-add.ps1 - Add entry to agent memory system

param(
    [Parameter(Mandatory=$true, Position=0)]
    [ValidateSet("journal", "decision", "pattern", "learning")]
    [string]$Type,
    
    [string]$Content,
    [string]$ContentFile,
    [switch]$Stdin,
    [switch]$Template,
    [string]$Tags,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

# Usage
function Show-Help {
    Write-Host @"
Add entry to agent memory system

USAGE:
    .\memory-add.ps1 TYPE [OPTIONS]

TYPES:
    journal     Agent reflection and observations
    decision    Technical/architectural decision
    pattern     Detected behavior pattern
    learning    Technical learning or discovery

OPTIONS:
    -ContentFile FILE   Read content from file
    -Content TEXT       Content as string
    -Stdin              Read content from stdin
    -Template           Use template (opens in editor)
    -Tags "tag1,tag2"   Add custom tags
    -Help               Show this help

EXAMPLES:
    # From file
    .\memory-add.ps1 journal -ContentFile my-reflection.md

    # From string
    .\memory-add.ps1 learning -Content "Today I learned..."

    # From stdin
    Get-Content input.md | .\memory-add.ps1 decision -Stdin

    # Using template
    .\memory-add.ps1 journal -Template

    # Quick entry
    .\memory-add.ps1 decision -ContentFile decision.md -Tags "architecture,database"

"@
}

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

# Generate filename
function Get-MemoryFilename {
    param([string]$Type)
    
    $timestamp = Get-Date -Format "yyyy-MM-dd-HH-mm-ss"
    return "$timestamp-$Type.md"
}

# Get memory directory
function Get-MemoryDirectory {
    param([string]$Type)
    
    return ".gsd/memory/$Type"
}

# Add entry
function Add-MemoryEntry {
    param(
        [string]$Type,
        [string]$Content,
        [string]$Tags
    )
    
    # Generate filename
    $filename = Get-MemoryFilename -Type $Type
    $memoryDir = Get-MemoryDirectory -Type $Type
    $filepath = Join-Path $memoryDir $filename
    
    # Ensure directory exists
    New-Item -ItemType Directory -Force -Path $memoryDir | Out-Null
    
    # Write content
    Set-Content -Path $filepath -Value $Content -Encoding UTF8
    
    # Add tags if provided
    if ($Tags) {
        Add-Content -Path $filepath -Value ""
        Add-Content -Path $filepath -Value "---"
        Add-Content -Path $filepath -Value ""
        Add-Content -Path $filepath -Value "## Tags"
        Add-Content -Path $filepath -Value ""
        Add-Content -Path $filepath -Value "``$Tags``"
    }
    
    Write-Success "Entry created: $filepath"
    
    # Trigger indexing if script exists
    if (Test-Path ".gsd/scripts/memory-index.ps1") {
        Write-Info "Indexing memory..."
        & .gsd/scripts/memory-index.ps1
    }
}

# Use template
function Use-MemoryTemplate {
    param(
        [string]$Type,
        [string]$Tags
    )
    
    # Check if template exists
    $template = ".gsd/memory/templates/$Type.md"
    if (-not (Test-Path $template)) {
        Write-ErrorMsg "Template not found: $template"
        exit 1
    }
    
    # Generate filename
    $filename = Get-MemoryFilename -Type $Type
    $memoryDir = Get-MemoryDirectory -Type $Type
    $filepath = Join-Path $memoryDir $filename
    
    # Ensure directory exists
    New-Item -ItemType Directory -Force -Path $memoryDir | Out-Null
    
    # Copy template
    Copy-Item $template $filepath
    
    # Add tags if provided
    if ($Tags) {
        Add-Content -Path $filepath -Value ""
        Add-Content -Path $filepath -Value "---"
        Add-Content -Path $filepath -Value ""
        Add-Content -Path $filepath -Value "## Tags"
        Add-Content -Path $filepath -Value ""
        Add-Content -Path $filepath -Value "``$Tags``"
    }
    
    Write-Info "Template copied to: $filepath"
    
    # Open in editor if available
    $editor = $env:EDITOR
    if ($editor) {
        Write-Info "Opening in editor: $editor"
        & $editor $filepath
    } else {
        Write-Info "Edit the file manually: $filepath"
        # Try to open with default editor
        Start-Process $filepath
    }
    
    # Trigger indexing if script exists
    if (Test-Path ".gsd/scripts/memory-index.ps1") {
        Write-Info "Indexing memory..."
        & .gsd/scripts/memory-index.ps1
    }
}

# Main
if ($Help) {
    Show-Help
    exit 0
}

# Handle template mode
if ($Template) {
    Use-MemoryTemplate -Type $Type -Tags $Tags
    exit 0
}

# Get content
$entryContent = ""

if ($ContentFile) {
    if (-not (Test-Path $ContentFile)) {
        Write-ErrorMsg "File not found: $ContentFile"
        exit 1
    }
    $entryContent = Get-Content $ContentFile -Raw
}
elseif ($Content) {
    $entryContent = $Content
}
elseif ($Stdin) {
    $entryContent = $input | Out-String
}
else {
    Write-ErrorMsg "No content provided. Use -ContentFile, -Content, -Stdin, or -Template"
    Show-Help
    exit 1
}

# Validate content
if ([string]::IsNullOrWhiteSpace($entryContent)) {
    Write-ErrorMsg "Content is empty"
    exit 1
}

# Add entry
Add-MemoryEntry -Type $Type -Content $entryContent -Tags $Tags

Write-Success "Memory entry added successfully!"
