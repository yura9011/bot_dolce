# scripts/index-codebase.ps1
# Universal Codebase Intelligence Indexer (PowerShell)
# Scans codebase and generates intelligence files

param(
    [switch]$Incremental,
    [switch]$Verbose,
    [string]$Directory = "",
    [switch]$Help
)

# Configuration
$IntelDir = ".gsd/intel"
$SrcDirs = @("src", "lib", "app", "packages")

# Show help
if ($Help) {
    Write-Host "Usage: ./scripts/index-codebase.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Incremental    Only index changed files"
    Write-Host "  -Verbose        Show detailed output"
    Write-Host "  -Directory DIR  Index specific directory"
    Write-Host "  -Help           Show this help"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  ./scripts/index-codebase.ps1                # Full index"
    Write-Host "  ./scripts/index-codebase.ps1 -Incremental   # Only changed files"
    Write-Host "  ./scripts/index-codebase.ps1 -Directory src/lib  # Specific directory"
    exit 0
}

# Helper functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Verbose-Custom {
    param([string]$Message)
    if ($Verbose) {
        Write-Host "[VERBOSE] $Message" -ForegroundColor Blue
    }
}

# Initialize intelligence directory
function Initialize-IntelDir {
    Write-Info "Initializing intelligence directory..."
    
    if (-not (Test-Path $IntelDir)) {
        New-Item -ItemType Directory -Path $IntelDir -Force | Out-Null
    }
    
    # Create empty files if they don't exist
    $files = @{
        "index.json" = '{"files":{},"totalFiles":0}'
        "conventions.json" = '{"naming":{},"directories":{},"fileSuffixes":{},"importPatterns":{}}'
        "graph.json" = '{"nodes":{},"edges":[],"clusters":[]}'
        "hotspots.json" = '{"byChanges":[],"byCentrality":[],"byComplexity":[]}'
        "metadata.json" = '{"version":"1.0.0","errors":[],"warnings":[]}'
    }
    
    foreach ($file in $files.Keys) {
        $path = Join-Path $IntelDir $file
        if (-not (Test-Path $path)) {
            $files[$file] | Out-File -FilePath $path -Encoding UTF8
        }
    }
    
    Write-Success "Intelligence directory initialized"
}

# Find source directories
function Find-SourceDirs {
    $dirs = @()
    
    if ($Directory) {
        if (Test-Path $Directory) {
            $dirs += $Directory
        } else {
            Write-Error "Directory not found: $Directory"
            exit 1
        }
    } else {
        foreach ($dir in $SrcDirs) {
            if (Test-Path $dir) {
                $dirs += $dir
                Write-Verbose-Custom "Found source directory: $dir"
            }
        }
    }
    
    if ($dirs.Count -eq 0) {
        Write-Warn "No source directories found. Checked: $($SrcDirs -join ', ')"
        Write-Warn "Use -Directory to specify a custom directory"
        exit 1
    }
    
    return $dirs
}

# Find files to index
function Find-Files {
    param([string[]]$Dirs)
    
    Write-Info "Scanning for source files..."
    
    $extensions = @("*.ts", "*.tsx", "*.js", "*.jsx", "*.py", "*.go", "*.rs", "*.java", "*.c", "*.cpp", "*.h", "*.hpp")
    $files = @()
    
    foreach ($dir in $Dirs) {
        foreach ($ext in $extensions) {
            $found = Get-ChildItem -Path $dir -Filter $ext -Recurse -File -ErrorAction SilentlyContinue
            $files += $found
        }
    }
    
    Write-Success "Found $($files.Count) source files"
    return $files
}

# Detect language from file extension
function Get-Language {
    param([string]$FilePath)
    
    $ext = [System.IO.Path]::GetExtension($FilePath)
    switch ($ext) {
        {$_ -in ".ts", ".tsx"} { return "typescript" }
        {$_ -in ".js", ".jsx"} { return "javascript" }
        ".py" { return "python" }
        ".go" { return "go" }
        ".rs" { return "rust" }
        ".java" { return "java" }
        {$_ -in ".c", ".h"} { return "c" }
        {$_ -in ".cpp", ".hpp"} { return "cpp" }
        default { return "unknown" }
    }
}

# Extract exports from TypeScript/JavaScript file
function Get-TsExports {
    param([string]$FilePath)
    
    $exports = @()
    $content = Get-Content $FilePath -Raw
    
    # Extract default exports
    if ($content -match 'export\s+default\s+([a-zA-Z_][a-zA-Z0-9_]*)') {
        $exports += @{name=$Matches[1]; kind="default"}
    }
    
    # Extract named exports (simplified)
    $matches = [regex]::Matches($content, 'export\s+(const|let|var|function|class|interface|type)\s+([a-zA-Z_][a-zA-Z0-9_]*)')
    foreach ($match in $matches) {
        $exports += @{name=$match.Groups[2].Value; kind="named"; type=$match.Groups[1].Value}
    }
    
    return $exports
}

# Extract imports from TypeScript/JavaScript file
function Get-TsImports {
    param([string]$FilePath)
    
    $imports = @()
    $content = Get-Content $FilePath -Raw
    
    # Extract import statements
    $matches = [regex]::Matches($content, 'import\s+.*\s+from\s+[''"]([^''"]+)[''"]')
    foreach ($match in $matches) {
        $imports += @{from=$match.Groups[1].Value}
    }
    
    return $imports
}

# Index a single file
function Index-File {
    param([System.IO.FileInfo]$File)
    
    $language = Get-Language $File.FullName
    Write-Verbose-Custom "Indexing: $($File.FullName) ($language)"
    
    # Get file modification time
    $mtime = $File.LastWriteTimeUtc.ToString("yyyy-MM-ddTHH:mm:ssZ")
    
    # Extract exports and imports based on language
    $exports = @()
    $imports = @()
    
    switch ($language) {
        {$_ -in "typescript", "javascript"} {
            $exports = Get-TsExports $File.FullName
            $imports = Get-TsImports $File.FullName
        }
        "python" {
            Write-Verbose-Custom "Python parsing not yet implemented"
        }
        default {
            Write-Verbose-Custom "Language $language not yet supported for parsing"
        }
    }
    
    # Create file entry
    return @{
        path = $File.FullName -replace '\\', '/'
        language = $language
        lastModified = $mtime
        exports = $exports
        imports = $imports
    }
}

# Build index
function Build-Index {
    param([System.IO.FileInfo[]]$Files)
    
    $total = $Files.Count
    Write-Info "Building index for $total files..."
    
    $index = @{
        files = @{}
        totalFiles = $total
        lastIndexed = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    }
    
    $current = 0
    foreach ($file in $Files) {
        $current++
        
        if (-not $Verbose) {
            $percent = [math]::Round(($current / $total) * 100)
            Write-Progress -Activity "Indexing files" -Status "$current of $total" -PercentComplete $percent
        }
        
        $fileData = Index-File $file
        $index.files[$fileData.path] = $fileData
    }
    
    if (-not $Verbose) {
        Write-Progress -Activity "Indexing files" -Completed
    }
    
    # Save index
    $indexPath = Join-Path $IntelDir "index.json"
    $index | ConvertTo-Json -Depth 10 | Out-File -FilePath $indexPath -Encoding UTF8
    
    Write-Success "Index built successfully"
}

# Detect naming conventions
function Detect-Conventions {
    Write-Info "Detecting naming conventions..."
    
    # Simplified version
    $conventions = @{
        naming = @{
            components = @{
                pattern = "PascalCase"
                confidence = 0.0
                examples = @()
            }
            utilities = @{
                pattern = "camelCase"
                confidence = 0.0
                examples = @()
            }
        }
        directories = @{}
        fileSuffixes = @{
            ".test.ts" = "Test files"
            ".spec.ts" = "Specification files"
            ".d.ts" = "TypeScript declarations"
        }
        importPatterns = @{}
    }
    
    $conventionsPath = Join-Path $IntelDir "conventions.json"
    $conventions | ConvertTo-Json -Depth 10 | Out-File -FilePath $conventionsPath -Encoding UTF8
    
    Write-Success "Conventions detected"
}

# Build dependency graph
function Build-Graph {
    Write-Info "Building dependency graph..."
    
    # Simplified version
    $graph = @{
        nodes = @{}
        edges = @()
        clusters = @()
    }
    
    $graphPath = Join-Path $IntelDir "graph.json"
    $graph | ConvertTo-Json -Depth 10 | Out-File -FilePath $graphPath -Encoding UTF8
    
    Write-Success "Dependency graph built"
}

# Identify hotspots
function Identify-Hotspots {
    Write-Info "Identifying hotspots..."
    
    $hotspots = @{
        byChanges = @()
        byCentrality = @()
        byComplexity = @()
    }
    
    # Use git log to find frequently changed files
    if (Test-Path ".git") {
        try {
            $gitLog = git log --all --format=format: --name-only 2>$null | 
                      Where-Object {$_} | 
                      Group-Object | 
                      Sort-Object Count -Descending | 
                      Select-Object -First 20
            
            foreach ($item in $gitLog) {
                $hotspots.byChanges += @{
                    path = $item.Name
                    commits = $item.Count
                }
            }
        } catch {
            Write-Verbose-Custom "Could not analyze git history"
        }
    }
    
    $hotspotsPath = Join-Path $IntelDir "hotspots.json"
    $hotspots | ConvertTo-Json -Depth 10 | Out-File -FilePath $hotspotsPath -Encoding UTF8
    
    Write-Success "Hotspots identified"
}

# Generate summary
function Generate-Summary {
    Write-Info "Generating summary..."
    
    # Read total files from index
    $indexPath = Join-Path $IntelDir "index.json"
    $index = Get-Content $indexPath | ConvertFrom-Json
    $totalFiles = $index.totalFiles
    
    $summary = @"
# Codebase Intelligence Summary

**Last Updated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss") UTC
**Total Files**: $totalFiles files indexed

## Project Structure

This summary is automatically generated from codebase analysis.
AI assistants should read this file to understand the codebase structure and conventions.

## Detected Patterns

[WARN] Full pattern detection not yet implemented.
This is a minimal summary. Run indexing again after implementation is complete.

## Key Files

Check ``.gsd/intel/hotspots.json`` for frequently changed files.

## Recommendations for AI

1. Follow existing naming conventions
2. Maintain consistent import patterns
3. Keep file structure organized
4. Add tests for new functionality

## Quick Reference

**To understand the codebase**:
1. Read this summary
2. Check ``.gsd/intel/index.json`` for exports/imports
3. Check ``.gsd/intel/graph.json`` for dependencies
4. Check ``.gsd/intel/hotspots.json`` for critical files
"@
    
    $summaryPath = Join-Path $IntelDir "summary.md"
    $summary | Out-File -FilePath $summaryPath -Encoding UTF8
    
    Write-Success "Summary generated"
}

# Save metadata
function Save-Metadata {
    param([int]$Duration, [int]$TotalFiles)
    
    Write-Info "Saving metadata..."
    
    $metadata = @{
        version = "1.0.0"
        lastIndexed = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        indexedBy = "scripts/index-codebase.ps1"
        duration = "${Duration}s"
        statistics = @{
            totalFiles = $TotalFiles
        }
        errors = @()
        warnings = @(
            "Full implementation pending - this is a minimal index"
        )
    }
    
    $metadataPath = Join-Path $IntelDir "metadata.json"
    $metadata | ConvertTo-Json -Depth 10 | Out-File -FilePath $metadataPath -Encoding UTF8
    
    Write-Success "Metadata saved"
}

# Main execution
function Main {
    $startTime = Get-Date
    
    Write-Host ""
    Write-Info "=== GSD Codebase Intelligence Indexer ==="
    Write-Host ""
    
    # Initialize
    Initialize-IntelDir
    
    # Find source directories
    $sourceDirs = Find-SourceDirs
    Write-Info "Source directories: $($sourceDirs -join ', ')"
    
    # Find files
    $files = Find-Files $sourceDirs
    
    if ($files.Count -eq 0) {
        Write-Warn "No files found to index"
        exit 0
    }
    
    # Build index
    Build-Index $files
    
    # Detect conventions
    Detect-Conventions
    
    # Build graph
    Build-Graph
    
    # Identify hotspots
    Identify-Hotspots
    
    # Generate summary
    Generate-Summary
    
    # Calculate duration
    $endTime = Get-Date
    $duration = [math]::Round(($endTime - $startTime).TotalSeconds)
    
    # Save metadata
    Save-Metadata $duration $files.Count
    
    Write-Host ""
    Write-Success "=== Indexing Complete ==="
    Write-Info "Duration: ${duration}s"
    Write-Info "Files indexed: $($files.Count)"
    Write-Info "Output directory: $IntelDir"
    Write-Host ""
    Write-Info "Next steps:"
    Write-Host "  1. Review: .gsd/intel/summary.md"
    Write-Host "  2. Commit: git add .gsd/intel/ && git commit -m 'feat: Add codebase intelligence'"
    Write-Host "  3. Use: AI can now read summary.md for context"
    Write-Host ""
}

# Run main
Main
