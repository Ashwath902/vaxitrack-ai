@echo off
set "PATH=C:\Program Files\nodejs;%PATH%"
echo ========================================================
echo Starting VaxiTrack AI Development Server...
echo ========================================================
cd /d "%~dp0"
call npm run dev
pause
