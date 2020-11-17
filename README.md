# Kaffee Bot

A Discord Bot Built by James Belveal for The Coffee Club Discord Server.

## Setup & Information

Discord.js Must be Installed in the Directory of the Bot.

The bot Token is read from a JSON File called "config.json" with the key "token"

To make the "Start-Linux.sh" Script Executable on Linux run "chmod u+x Start-Linux.sh"

The Start Scripts hold the bot in a constant restart loop, if the bot closes for any reason it will relaunch it.
However the bot is designed to exit the loop if a file called "QUIT" is present in the temp directory before relaunching.

## Known Issues

The bot needs config files which are located in a folder called config however this folder is not tracked.
This will be fixed in a future release making the bot auto generate missing config files.

## Built With

* [NodeJS](https://nodejs.org/en/)
* [DiscordJS](https://discord.js.org/)

## Authors

* **James Belveal**

## License

This project is licensed under the Apache 2.0 License