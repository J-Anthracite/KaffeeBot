@ECHO off
TITLE Kaffee Bot

REM Before Starting the Loop clear the temp folder.
IF EXIST "%CD%/temp/" (
    ECHO Clearing Temporary Runtime Files...
    RMDIR "%CD%/temp/" /s /q
) 
IF NOT EXIST "%CD%/temp/" (
    MKDIR "%CD%/temp/"
)

REM The Begining of the Loop.
:START
IF EXIST "%CD%"\temp\QUIT GOTO QUIT
IF EXIST "%CD%"\temp\UPDATE GOTO UPDATE

REM Start Kaffee Bot
:RUN
ECHO.
ECHO Starting Kaffee Bot!
node KaffeeBot.js
GOTO START

REM Checkout the latest Master Branch.
:UPDATE
ECHO.
ECHO Updating...
REM git checkout master
IF EXIST "%CD%"\temp\UPDATE (
    DEL "%CD%"\temp\UPDATE
)
pause
ECHO Finished Updating!
GOTO START

REM Deleted Contents of the temp Directory
:CLEAN


REM Completely Quit Kaffee Bot.
:QUIT
ECHO Quiting Kaffee Bot Loop...
TIMEOUT /T 15