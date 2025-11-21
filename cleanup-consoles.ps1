# PowerShell script to remove all console statements from frontend and backend

Write-Host "🧹 Starting console cleanup..." -ForegroundColor Cyan

# Function to remove console statements from a file
function Remove-ConsoleStatements {
    param(
        [string]$FilePath
    )
    
    try {
        $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
        
        # Pattern to match console.* statements (handles multiline)
        # This matches: console.log(...), console.error(...), console.warn(...), etc.
        $pattern = 'console\.(log|error|warn|info|debug|trace)\([^)]*(?:\([^)]*\)[^)]*)*\);?\s*\n?'
        
        $newContent = $content -replace $pattern, ''
        
        # Also handle console statements that span multiple lines
        $newContent = $newContent -replace 'console\.(log|error|warn|info|debug|trace)\s*\(\s*[`\n\r\s]*[^;]*\);?\s*[\n\r]*', ''
        
        # Clean up extra blank lines created by removal
        $newContent = $newContent -replace '(\r?\n){3,}', "`n`n"
        
        if ($newContent -ne $content) {
            Set-Content -Path $FilePath -Value $newContent -Encoding UTF8
            return $true
        }
        return $false
    }
    catch {
        Write-Host "❌ Error processing $FilePath : $_" -ForegroundColor Red
        return $false
    }
}

# Get all TypeScript/JavaScript files
$backendFiles = Get-ChildItem -Path "c:\KardexCare\backend" -Include "*.ts", "*.js" -Recurse -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notmatch "node_modules|dist|build" }

$frontendFiles = Get-ChildItem -Path "c:\KardexCare\frontend" -Include "*.ts", "*.tsx", "*.js" -Recurse -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notmatch "node_modules|dist|build|\.next" }

$allFiles = @($backendFiles) + @($frontendFiles)

Write-Host "📊 Found $($allFiles.Count) files to process" -ForegroundColor Yellow

$processedCount = 0
$modifiedCount = 0

foreach ($file in $allFiles) {
    $processedCount++
    if ($processedCount % 50 -eq 0) {
        Write-Host "  Processing... $processedCount/$($allFiles.Count)" -ForegroundColor Gray
    }
    
    if (Remove-ConsoleStatements -FilePath $file.FullName) {
        $modifiedCount++
        Write-Host "  ✓ Cleaned: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host "   Processed: $processedCount files" -ForegroundColor Cyan
Write-Host "   Modified: $modifiedCount files" -ForegroundColor Cyan
