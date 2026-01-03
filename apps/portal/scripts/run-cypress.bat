@echo off
setlocal

set CYPRESS_SHELL=cmd.exe
set FORCE_COLOR=1

start /b pnpm dev
timeout /t 5 /nobreak > nul

if "%1"=="" (
    npx cypress run --headed --spec "cypress/e2e/**/*.cy.ts"
) else (
    npx cypress run --headed --spec "%1"
)
