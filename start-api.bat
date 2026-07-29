@echo off
setlocal

REM ============================================================
REM  start-api.bat
REM  Checks if the Customer Intelligence API (port 8000) is
REM  already running. If not, starts it automatically.
REM  Place this file in your project ROOT
REM  (same level as the "api" and "venv" folders).
REM ============================================================

set PORT=8000
set API_DIR=%~dp0api
set VENV_ACTIVATE=%~dp0venv\Scripts\activate.bat

echo Checking if API is already running on port %PORT% ...

REM --- Check if something is already listening on the port ---
netstat -ano | findstr LISTENING | findstr :%PORT% >nul
if %ERRORLEVEL%==0 (
    echo API already running on port %PORT%. Nothing to do.
    goto :check_url
)

echo API not running. Starting it now...

REM --- Open a new terminal window, activate venv, cd into api, start uvicorn ---
start "Customer Intelligence API" cmd /k "cd /d "%API_DIR%" && call "%VENV_ACTIVATE%" && uvicorn main:app --reload --port %PORT%"

echo Waiting for API to come up...
timeout /t 5 /nobreak >nul

:check_url
echo Verifying API status at http://localhost:%PORT%/ ...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:%PORT%/ 2>nul

if errorlevel 1 (
    echo.
    echo Could not verify API with curl. If a new terminal window opened,
    echo check that window for errors ^(missing dependencies, missing model
    echo files, wrong folder, etc.^).
) else (
    echo.
    echo Open http://localhost:%PORT%/ in your browser to confirm.
)

echo.
echo Done. Press any key to close this window ^(the API terminal will stay open^).
pause >nul