@echo off
set "NODE_PATH=C:\tools\node-v24.18.0-win-x64"
set "PATH=%NODE_PATH%;%PATH%"
cd /d "%~dp0server"
"%NODE_PATH%\npm.cmd" run dev
