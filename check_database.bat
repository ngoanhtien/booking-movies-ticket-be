@echo off
echo Checking database for room and branch information...

set PGPASSWORD=Anhtien123.

echo.
echo --- Rooms with ID 1 and 3 ---
psql -h movie-ticket.crm2sq0ssrzj.ap-southeast-2.rds.amazonaws.com -U postgres -d movie -c "SELECT room_id, room_name, branch_id FROM rooms WHERE room_id IN (1, 3);"

echo.
echo --- Available Branchs (up to 10) ---
psql -h movie-ticket.crm2sq0ssrzj.ap-southeast-2.rds.amazonaws.com -U postgres -d movie -c "SELECT branch_id, branch_name FROM branchs LIMIT 10;"

if %ERRORLEVEL% == 0 (
  echo.
  echo SQL queries executed successfully!
) else (
  echo.
  echo Error executing SQL queries. Check connection and credentials.
)

pause 