@echo off
set CYPRESS_SHELL=cmd.exe
set NODE_OPTIONS=--require ts-node/register

npx cypress run --spec "%1"
