@echo off
echo Executing SQL script to add showtimes for movie ID 8...

set PGPASSWORD=Anhtien123.
psql -h movie-ticket.crm2sq0ssrzj.ap-southeast-2.rds.amazonaws.com -U postgres -d movie -f src/main/resources/add_showtimes.sql

if %ERRORLEVEL% == 0 (
  echo SQL script executed successfully!
) else (
  echo Error executing SQL script. Check connection and credentials.
)

pause 