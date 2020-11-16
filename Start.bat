@ECHO off
TITLE Kaffee Bot Beta
ECHO Starting Kaffee Bot Loop...

:START
IF EXIST "%CD%"\Temp\QUIT GOTO EXIT
IF EXIST "%CD%"\Temp\BACKUP GOTO BACKUP
IF EXIST "%CD%"\Temp\UPDATE GOTO UPDATE


REM Run Kaffee Bot Normally
:RUN
echo.
node KaffeeBotBeta.js
GOTO START

REM Start Kaffee Bot Backup Precedure
:BACKUP
DEL "%CD%"\Temp\BACKUP
echo.
echo Starting Backup!
echo Finished Backup!
GOTO START

REM Start the updater!
:UPDATE
DEL "%CD%"\Temp\UPDATE
echo.
echo Starting Update!
echo Finished Updating!
GOTO START

REM Quit out of the Kaffee Bot Run Loop
:EXIT
DEL "%CD%"\Temp\QUIT
ECHO.
ECHO Exiting Kaffee Bot Loop...
pause