@echo off
REM Environment Setup Script for Windows
REM This script helps you create .env files from templates

echo ================================================
echo   Environment Configuration Setup
echo ================================================
echo.

REM Check if templates exist
if not exist "env-templates\env.development.template" (
    echo Error: Template files not found in env-templates\
    pause
    exit /b 1
)

REM Setup development environment
if exist ".env.development" (
    echo Warning: .env.development already exists
    set /p "REPLY=   Do you want to overwrite it? (y/n): "
    if /i "%REPLY%"=="y" (
        copy /y "env-templates\env.development.template" ".env.development" >nul
        echo Created .env.development
    ) else (
        echo Skipped .env.development
    )
) else (
    copy "env-templates\env.development.template" ".env.development" >nul
    echo Created .env.development
)

echo.

REM Setup production environment
if exist ".env.production" (
    echo Warning: .env.production already exists
    set /p "REPLY=   Do you want to overwrite it? (y/n): "
    if /i "%REPLY%"=="y" (
        copy /y "env-templates\env.production.template" ".env.production" >nul
        echo Created .env.production
    ) else (
        echo Skipped .env.production
    )
) else (
    copy "env-templates\env.production.template" ".env.production" >nul
    echo Created .env.production
)

echo.
echo ================================================
echo   Setup Complete!
echo ================================================
echo.
echo Next Steps:
echo.
echo 1. Edit .env.production and set your backend URL:
echo    notepad .env.production
echo    or
echo    code .env.production
echo.
echo 2. Replace this line:
echo    VITE_API_BASE_URL=https://api.yourdomain.com
echo    with your actual backend URL
echo.
echo 3. Build for production:
echo    npm run build
echo.
echo 4. Deploy the dist/ folder to your hosting
echo.
echo ================================================
pause

