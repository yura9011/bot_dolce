# GSD for Kiro - Installation Script
# Portable Get Shit Done system

Write-Host "🚀 Installing Get Shit Done for Kiro..." -ForegroundColor Cyan

# Create directory structure
$dirs = @(
    ".gsd",
    ".gsd/workflows",
    ".gsd/templates",
    ".gsd/research",
    ".gsd/planning",
    ".gsd/summaries",
    ".gsd/todos"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✓ Created $dir" -ForegroundColor Green
    }
}

# Create Kiro steering file
$kiroDir = ".kiro/steering"
if (-not (Test-Path $kiroDir)) {
    New-Item -ItemType Directory -Path $kiroDir -Force | Out-Null
}

Write-Host "✓ GSD installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: Initialize GSD project" -ForegroundColor White
Write-Host "2. Or type: /gsd:help for all commands" -ForegroundColor White
