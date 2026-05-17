#!/usr/bin/env pwsh
# setup-vault.ps1 - Configure Obsidian Vault for self-indexing

param(
    [Parameter(Mandatory=$true)]
    [string]$VaultPath
)

$ErrorActionPreference = "Stop"

Write-Host "Configurando Vault para auto-indexado..." -ForegroundColor Yellow
Write-Host ""

# Update config to point to itself
$config = @{
    external_sources = @($VaultPath)
    file_patterns = @("*.md", "*.txt")
    exclude_patterns = @(
        "**/.gsd/**",
        "**/node_modules/**",
        "**/.git/**",
        "**/.obsidian/**",
        "**/dist/**",
        "**/build/**"
    )
    index_path = ".gsd/memory/.index/vault.db"
}

$configPath = Join-Path $VaultPath ".gsd\memory\config.json"
$config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8

Write-Host "Configuración actualizada: $configPath" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora indexa el Vault:" -ForegroundColor Yellow
Write-Host "  cd '$VaultPath'" -ForegroundColor Cyan
Write-Host "  .\.gsd\scripts\memory-index-external.ps1" -ForegroundColor Cyan
Write-Host ""
