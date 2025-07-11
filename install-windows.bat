@echo off
echo Installing dependencies for Windows...
echo This script will install the project without problematic optional dependencies.
echo.

echo Cleaning previous installations...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo Installing dependencies...
npm install --no-optional --legacy-peer-deps

echo Checking TypeScript compilation...
npm run check

echo.
echo Installation completed successfully!
echo.
echo To start development server, run:
echo   npm run dev:windows
echo   or
echo   run-dev.bat
echo.
pause