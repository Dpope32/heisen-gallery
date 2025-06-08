@echo off
start /b "" cmd /c "set NODE_ENV=production && npx electron . > nul 2>&1"
