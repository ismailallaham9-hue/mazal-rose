@echo off
title Put MAZAL online (Vercel)
setlocal
set "PATH=C:\Users\RANEEM\node-portable\node-v24.17.0-win-x64;%PATH%"
cd /d "C:\Users\RANEEM\mazal-rose"
echo ============================================================
echo   Putting MAZAL (rose) online so clients can open it on
echo   their phones from anywhere.
echo ------------------------------------------------------------
echo   FIRST TIME: a browser opens - log in (Google, GitHub, or
echo   email). Then press ENTER at every question to accept the
echo   defaults. This window will STAY OPEN.
echo ============================================================
echo.
call vercel --prod
echo.
echo ============================================================
echo   If you see a https://...vercel.app link above, that is
echo   your public site. Send it to clients (or paste to Claude).
echo   If you see an error above, screenshot it and send it.
echo ============================================================
echo.
echo Press any key to close this window...
pause >nul
