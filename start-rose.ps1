# Starts the MAZAL rose site on http://localhost:3001
# Run from PowerShell:  .\start-rose.ps1   (keep the window open)
$env:Path = "C:\Users\RANEEM\node-portable\node-v24.17.0-win-x64;$env:Path"
Set-Location "C:\Users\RANEEM\mazal-rose"
Write-Host "Starting MAZAL (rose) on http://localhost:3001 ..." -ForegroundColor Magenta
Write-Host "Keep this window OPEN. Press Ctrl+C to stop." -ForegroundColor DarkGray
npm run dev -- --port 3001
