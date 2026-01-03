if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {  
    $arguments = "& '" + $myinvocation.mycommand.definition + "'"
    Start-Process powershell -Verb runAs -ArgumentList $arguments
    Break
}

Set-Location $PSScriptRoot\..
Write-Host "Starting Cypress as Administrator..."
$env:CYPRESS_CACHE_FOLDER = "C:\Cypress\Cache"
pnpm exec cypress open --e2e --browser chrome
