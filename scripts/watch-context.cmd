@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0watch-context.ps1" %*
pause
