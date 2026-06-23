@echo off
title MAZAL Rose - localhost:3001
set "PATH=C:\Users\RANEEM\node-portable\node-v24.17.0-win-x64;%PATH%"
cd /d "C:\Users\RANEEM\mazal-rose"
echo Starting MAZAL (rose) on http://localhost:3001 ...
echo Keep this window OPEN. Press Ctrl+C to stop the server.
echo.
npm run dev -- --port 3001
pause
