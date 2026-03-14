# Production Deployment Setup Script (Windows PowerShell)
# Run this on your production server before starting the application

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Production Setup..." -ForegroundColor Green
Write-Host ""

# Check Node.js version
Write-Host "✓ Checking Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node -v
    Write-Host "  Found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check npm version
Write-Host "✓ Checking npm..." -ForegroundColor Cyan
$npmVersion = npm -v
Write-Host "  Found: npm $npmVersion" -ForegroundColor Green

# Check MongoDB connection string
Write-Host "✓ Validating MONGODB_URI..." -ForegroundColor Cyan
if ([string]::IsNullOrEmpty($env:MONGODB_URI)) {
    Write-Host "❌ MONGODB_URI not set!" -ForegroundColor Red
    Write-Host "   Set it and try again: `$env:MONGODB_URI='mongodb+srv://...'" -ForegroundColor Yellow
    exit 1
}
Write-Host "  ✓ MONGODB_URI is configured" -ForegroundColor Green

# Install backend dependencies
Write-Host "✓ Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
npm ci --production
Set-Location ..

# Check required environment variables
Write-Host "✓ Validating environment variables..." -ForegroundColor Cyan
$requiredVars = @("JWT_SECRET", "MONGODB_URI", "SENDGRID_API_KEY", "SENDGRID_FROM_EMAIL", "CLIENT_URL")
foreach ($var in $requiredVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ([string]::IsNullOrEmpty($value)) {
        Write-Host "❌ Missing required variable: $var" -ForegroundColor Red
        exit 1
    }
    Write-Host "  ✓ $var is set" -ForegroundColor Green
}

# Install frontend dependencies
Write-Host "✓ Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm ci --production

# Build frontend
Write-Host "✓ Building frontend (this may take a few minutes)..." -ForegroundColor Cyan
npm run build

Set-Location ..

# Create logs directory if it doesn't exist
Write-Host "✓ Setting up logs directory..." -ForegroundColor Cyan
if (!(Test-Path "backend/logs")) {
    New-Item -ItemType Directory -Path "backend/logs" | Out-Null
}

# Verify uploads directory
if (!(Test-Path "backend/uploads")) {
    New-Item -ItemType Directory -Path "backend/uploads" | Out-Null
}

if (!(Test-Path "backend/uploads/profile-pictures")) {
    New-Item -ItemType Directory -Path "backend/uploads/profile-pictures" | Out-Null
}

Write-Host ""
Write-Host "✅ Production setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Verify all environment variables are set correctly"
Write-Host "2. Ensure MongoDB Atlas cluster is accessible"
Write-Host "3. Start backend server: cd backend && npm start"
Write-Host "4. Point frontend to: http://localhost:3000 (or your domain)"
Write-Host ""
Write-Host "For troubleshooting, check:" -ForegroundColor Yellow
Write-Host "- Backend logs: backend/logs/*.log"
Write-Host "- MongoDB connection in backend/server.js"
Write-Host "- CORS configuration for frontend domain"
