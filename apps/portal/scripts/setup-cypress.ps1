function Write-ProgressBar {
    param (
        [int]$PercentComplete,
        [string]$Status,
        [string]$Activity = "Setting up Cypress Environment"
    )
    Write-Progress -Activity $Activity -Status $Status -PercentComplete $PercentComplete
}

function Write-TaskHeader {
    param (
        [string]$TaskName
    )
    Write-Host "`n🔄 $TaskName" -ForegroundColor Cyan
    Write-Host ("=" * 50)
}

Write-Host "`n🚀 Starting Cypress Setup" -ForegroundColor Green
$startTime = Get-Date

Write-TaskHeader "Creating Directory Structure"
$dirs = @(
    "cypress/downloads",
    "cypress/screenshots",
    "cypress/videos",
    "cypress/fixtures"
)

for ($i = 0; $i -lt $dirs.Count; $i++) {
    $dir = $dirs[$i]
    $percent = [math]::Round(($i + 1) / $dirs.Count * 100)
    Write-ProgressBar -PercentComplete $percent -Status "Creating directory: $dir"
    
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "✓ Exists: $dir" -ForegroundColor Yellow
    }
    Start-Sleep -Milliseconds 500
}

Write-TaskHeader "Cleaning Package Manager Cache"
Write-ProgressBar -PercentComplete 0 -Status "Cleaning npm cache"
npm cache clean --force
Write-ProgressBar -PercentComplete 50 -Status "Cleaning pnpm store"
npm cache clean --force
Write-ProgressBar -PercentComplete 100 -Status "Cache cleaning complete"
Write-Host "✅ Cache cleaned" -ForegroundColor Green

Write-TaskHeader "Removing Existing Cypress Installations"
$cypressPaths = @(
    "$env:APPDATA\Cypress",
    "$env:USERPROFILE\.cache\Cypress"
)

for ($i = 0; $i -lt $cypressPaths.Count; $i++) {
    $path = $cypressPaths[$i]
    $percent = [math]::Round(($i + 1) / $cypressPaths.Count * 100)
    Write-ProgressBar -PercentComplete $percent -Status "Removing: $path"
    
    if (Test-Path $path) {
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "🗑️ Removed: $path" -ForegroundColor Yellow
    }
    Start-Sleep -Milliseconds 500
}

Write-TaskHeader "Cleaning Project Dependencies"
$depsToClean = @(
    @{Path = "node_modules"; Type = "directory"},
    @{Path = "package-lock.json"; Type = "file"},
    @{Path = "pnpm-lock.yaml"; Type = "file"}
)

for ($i = 0; $i -lt $depsToClean.Count; $i++) {
    $item = $depsToClean[$i]
    $percent = [math]::Round(($i + 1) / $depsToClean.Count * 100)
    Write-ProgressBar -PercentComplete $percent -Status "Cleaning: $($item.Path)"
    
    if (Test-Path $item.Path) {
        Remove-Item -Path $item.Path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "🗑️ Removed: $($item.Path)" -ForegroundColor Yellow
    }
    Start-Sleep -Milliseconds 500
}

Write-TaskHeader "Installing Dependencies"
Write-ProgressBar -PercentComplete 0 -Status "Installing project dependencies"
# Capture and log output
$output = & npm install --legacy-peer-deps 2>&1
$exitCode = $LASTEXITCODE

# Log output for debugging
Write-Host $output
Write-ProgressBar -PercentComplete 100 -Status "Dependencies installed"

if ($exitCode -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Error installing dependencies" -ForegroundColor Red
    exit 1
}

Write-TaskHeader "Verifying Cypress Installation"
Write-ProgressBar -PercentComplete 0 -Status "Setting environment variables"
$env:CYPRESS_VERIFY_TIMEOUT = 100000

Write-ProgressBar -PercentComplete 25 -Status "Verifying Cypress binary"
# Capture and log output
$output = & npx cypress verify 2>&1
$exitCode = $LASTEXITCODE

# Log output for debugging
Write-Host $output

if ($exitCode -eq 0) {
    Write-ProgressBar -PercentComplete 75 -Status "Testing Cypress launch"
    Write-Host "✅ Cypress binary verified" -ForegroundColor Green
    
    Write-ProgressBar -PercentComplete 100 -Status "Cypress setup complete"
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host "`n✨ Setup completed in $([math]::Round($duration, 2)) seconds" -ForegroundColor Green
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Run 'pnpm cypress:open' to start Cypress" -ForegroundColor White
    Write-Host "   2. Select 'E2E Testing' in the Cypress window" -ForegroundColor White
    Write-Host "   3. Choose your preferred browser" -ForegroundColor White
} else {
    Write-Host "❌ Cypress verification failed" -ForegroundColor Red
    exit 1
}

Write-Host "Setup complete! You can now run 'pnpm cypress:open' to start Cypress" -ForegroundColor Green
