@echo off
set CYPRESS_SHELL=cmd.exe
set CYPRESS_CACHE_FOLDER=%LOCALAPPDATA%\Cypress\Cache
set CYPRESS_RUN_BINARY=%CYPRESS_CACHE_FOLDER%\12.17.4\Cypress\Cypress.exe

npx cypress run --spec "cypress/e2e/academy/academy.cy.ts" --config-file cypress.config.js
