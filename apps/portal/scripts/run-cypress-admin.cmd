@echo off
cd /d "%~dp0.."
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -Command "Start-Process cmd -Verb RunAs -ArgumentList '/c cd "%cd%" && pnpm exec cypress open --e2e --browser chrome'"
