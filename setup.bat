@echo off

REM Colors for output (using ECHO with color codes is limited in Windows, so we'll use simple text)

echo.
echo ===== Online Attendance System - Setup Script =====
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo [OK] Node.js is installed
for /f "tokens=*" %%i in ('node --version') do echo Node version: %%i
echo.

REM Backend Setup
echo Setting up Backend...
cd backend

if not exist ".env" (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Please edit backend/.env with your configuration
)

echo Installing backend dependencies...
call npm install

echo [OK] Backend setup complete
echo.

REM Frontend Setup
cd ..
cd frontend

if not exist ".env" (
    echo Creating .env file from .env.example...
    copy .env.example .env
)

echo Installing frontend dependencies...
call npm install

echo [OK] Frontend setup complete
echo.

cd ..

echo.
echo ===== Setup Complete =====
echo.
echo Next steps:
echo 1. Update backend/.env with your MongoDB and email configuration
echo 2. Make sure MongoDB is running
echo 3. Open new terminal and run: npm run dev (in backend directory)
echo 4. Open new terminal and run: npm start (in frontend directory)
echo.
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
echo.
pause
