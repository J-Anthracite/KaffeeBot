@echo off
title Kaffee Bot
GOTO RUN

:CRASH
ECHO.
ECHO.
ECHO.
ECHO Kaffee Bot has stopped running and will automatically try and restart in 20 seconds...
TIMEOUT 20
ECHO.
GOTO RUN

:RUN
node KaffeeBot.js
GOTO CRASH