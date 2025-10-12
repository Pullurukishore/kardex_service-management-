# PowerShell script to setup production logging configuration
# Run this script to configure your environment for production

Write-Host "🔧 Setting up production logging configuration..." -ForegroundColor Cyan
Write-Host ""

# Backend configuration
Write-Host "📦 Backend Configuration" -ForegroundColor Yellow
Write-Host "------------------------" -ForegroundColor Yellow

$backendEnvPath = ".\backend\.env"

if (Test-Path $backendEnvPath) {
    Write-Host "✅ Found backend .env file" -ForegroundColor Green
    
    # Check if logging config exists
    $envContent = Get-Content $backendEnvPath -Raw
    
    if ($envContent -notmatch "ENABLE_CONSOLE_LOGS") {
        Write-Host "➕ Adding logging configuration to backend .env..." -ForegroundColor Yellow
        Add-Content $backendEnvPath "`n# Logging Configuration"
        Add-Content $backendEnvPath "ENABLE_CONSOLE_LOGS=false"
        Add-Content $backendEnvPath "LOG_LEVEL=info"
        Write-Host "✅ Backend logging configuration added" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  Logging configuration already exists in backend .env" -ForegroundColor Blue
    }
} else {
    Write-Host "⚠️  Backend .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".\backend\.env.example") {
        Copy-Item ".\backend\.env.example" $backendEnvPath
        Write-Host "✅ Created backend .env file" -ForegroundColor Green
    } else {
        Write-Host "❌ .env.example not found. Please create .env manually." -ForegroundColor Red
    }
}

Write-Host ""

# Frontend configuration
Write-Host "🎨 Frontend Configuration" -ForegroundColor Yellow
Write-Host "-------------------------" -ForegroundColor Yellow

$frontendEnvPath = ".\frontend\.env.production.local"

if (-not (Test-Path $frontendEnvPath)) {
    Write-Host "➕ Creating frontend .env.production.local..." -ForegroundColor Yellow
    @"
# Production Environment Configuration
NODE_ENV=production

# Disable console logs in production (default: false)
# Set to 'true' only for debugging
NEXT_PUBLIC_ENABLE_LOGS=false

# API URL - Update this to your production backend URL
NEXT_PUBLIC_API_URL=http://localhost:5000
"@ | Out-File -FilePath $frontendEnvPath -Encoding UTF8
    Write-Host "✅ Created frontend .env.production.local" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Frontend .env.production.local already exists" -ForegroundColor Blue
}

Write-Host ""
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Review and update environment variables in:" -ForegroundColor White
Write-Host "   - backend\.env" -ForegroundColor Gray
Write-Host "   - frontend\.env.production.local" -ForegroundColor Gray
Write-Host ""
Write-Host "2. For production deployment:" -ForegroundColor White
Write-Host "   Backend:  cd backend && npm run build && npm run start" -ForegroundColor Gray
Write-Host "   Frontend: cd frontend && npm run build && npm run start" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Read LOGGING-GUIDE.md for detailed documentation" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Console logs will be automatically disabled in production!" -ForegroundColor Green
