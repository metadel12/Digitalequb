$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

Write-Host "Starting DigiEqub backend on http://127.0.0.1:8001" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; python run_dev.py"

Start-Sleep -Seconds 2

Write-Host "Starting DigiEqub frontend on http://127.0.0.1:5173" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev"

Write-Host "Both services have been launched in separate PowerShell windows." -ForegroundColor Cyan
