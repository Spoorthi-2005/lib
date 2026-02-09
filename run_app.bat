@echo off
echo Starting Library System...

start "Backend Server" cmd /k "cd backend && npm start"
start "Frontend Client" cmd /k "cd client && npm start"

echo System started!
echo Backend running on port 5001
echo Frontend running on port 3000
