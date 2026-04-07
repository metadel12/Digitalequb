$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

Write-Host "Starting DigiEqub frontend on http://127.0.0.1:5173" -ForegroundColor Green
npm run dev
