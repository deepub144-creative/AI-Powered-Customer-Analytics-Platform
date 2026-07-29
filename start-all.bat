@echo off
setlocal
cd /d %~dp0

start "" /min cmd /c "cd /d %~dp0 && start-api.bat"
start "" /min cmd /c "cd /d %~dp0 && start-react.bat"

:waitapi
timeout /t 1 /nobreak >nul
powershell -Command "try { (New-Object Net.Sockets.TcpClient).Connect('localhost',8000) } catch { exit 1 }" >nul 2>&1
if errorlevel 1 goto waitapi

:waitreact
timeout /t 1 /nobreak >nul
powershell -Command "try { (New-Object Net.Sockets.TcpClient).Connect('localhost',5173) } catch { exit 1 }" >nul 2>&1
if errorlevel 1 goto waitreact

start http://localhost:5173/
exit