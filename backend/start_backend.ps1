$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot
$env:DIGIEQUB_PORT = "8001"

Write-Host "Starting DigiEqub backend on http://127.0.0.1:8001" -ForegroundColor Green
python -m uvicorn app.main:app --reload
