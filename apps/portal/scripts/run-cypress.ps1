# Set environment variables
$env:CYPRESS_SHELL = "cmd.exe"
$env:FORCE_COLOR = "1"

# Check if dev server is running
$devServerRunning = $false
try {
    $connection = New-Object System.Net.Sockets.TcpClient("localhost", 3001)
    $devServerRunning = $true
    $connection.Close()
} catch {}

# Start dev server if not running
if (-not $devServerRunning) {
    Start-Process -NoNewWindow -FilePath "pnpm" -ArgumentList "dev"
    Start-Sleep -Seconds 5
}

# Run Cypress
if ($args.Count -eq 0) {
    & npx cypress run --headed --spec "cypress/e2e/**/*.cy.ts"
} else {
    & npx cypress run --headed --spec $args[0]
}
