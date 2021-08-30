console.log("Starting Kaffee Bot Beta...\n");

const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');

//The Bot Config
var config = {};

var plugins = [];

var commands = new Map();

//The Discord Channel for bot Logs
var AdminLogChannel;

var GuildLogChannels = new Map();

//Temp
GuildLogChannels.set('788236129584545812', '793408624029990923');

var help = new Map();

var listeners = new Map();

//Listeners - These will replace listeners var
const GuildListeners = new Map();
const ChannelListeners = new Map();

var PluginInits = [];

//Guilds the Bot is currently Disabled in.
var DisabledGuilds = [];

//Loads the Bot Config File - Always stored in the Root.
//Contains the Token, Admin User ID, Admin Log Channel ID, Plugin Config Dir.
function LoadBotConfig(callback){
	fs.readFile('./config.json', (err, buffer) => {
		if(err){
			console.log("Failed Loading 'config.json'!");
		} else {
			config = JSON.parse(buffer);
			callback();
		}
	});
}

function LoadPlugins(callback){
    console.log("Searching for Plugins...");

    let found = 0;
    let successfull = 0;
    let failed = 0;

    fs.readdir('./plugins/', (err, files) => {
        var pluginfiles = files.filter((file) => { return file.slice(file.lastIndexOf('.')).toLowerCase() === '.js' });

        found = pluginfiles.length;

        pluginfiles.forEach((file) => {
            try {
                console.log('\nLoading: ' + file);

                var plugin = require('./plugins/' + file);

                //Get Plugin Commands
                plugin.commands.forEach((json, name) => {
                    if(commands.has(name) == false){
						commands.set(name, json);
						//help.set(name, json.help);
                    } else {
                        console.log("Error! Plugin '" + plugin.name + "' has the command '" + name + "' but that command already exists!");
                        throw('Overlapping Command Name: ' + name);
                    }
                });

                //Link the Functions for Starting and Stopping Listening
                plugin.StartListening = StartListening;
				plugin.StopListening = StopListening;

				plugin.StartGuildListener = StartGuildListener;
				plugin.StopGuildListener = StopGuildListener;
				
				//Command Getter/Setter
				plugin.GetCommands = GetCommands;
				plugin.AddCommand = AddCommand;

				//Loggers
				plugin.GuildLog = GuildLog;
				plugin.AdminLog = AdminLog;

				//Config
				plugin.LoadConfig = LoadConfig;
				plugin.SaveConfig = SaveConfig;
				
				//Pass Bot Client Reference TODO: Maybe don't do this
				plugin.client = client;

				//Check Init
				if(plugin.init != undefined){
					
				}

                console.log('Success: ' + plugin.name + " V" + (plugin.version).toFixed(1));

                plugins.push(plugin);
                successfull++;
            }
            catch (err) {
                console.log("Failed Loading: " + file);
                console.log(err);
                failed++;
            }
        });

        console.log("\nFound: " + found + "\nLoaded: " + successfull + "\nFailed: " + failed + "\nFinished Loading Plugins!\n");

        callback();
    });
}

//Load Plugin Config
function LoadConfig(parent, name, guildID, callback){
	//Get Config Directory
	let dir = './';
	if(config.configDir != undefined){
		dir = config.configDir;
	}

	//If guildID is set then we look for per guild config
	if(guildID != undefined){
		dir += guildID + "/";
	}

	//Add Config Name
	dir += parent.toLowerCase() + '.' + name.toLowerCase() + '.json';

	//Try and Read
	fs.readFile(dir, (err, buffer) => {
		if(err){
			callback("Failed to Load Config", []);
		} else {
			let json = JSON.parse(buffer);
			callback(undefined, json);
		}
	});
}

//Save Plugin Config
function SaveConfig(parent, name, json, guildID){
	//Get Config Directory
	let dir = './config/';
	if(config.configDir != undefined){
		dir = config.configDir;
	}

	//If guildID is set then we save config per guild
	if(guildID != undefined){
		dir += guildID + "/";

		//Ensure Folder Exsists
		if(!fs.existsSync(dir)){
			fs.mkdir(dir, (err) => {
				if(err){
					console.log(err);
				}
			});
		}
	}

	//Append Config File Name
	dir += parent.toLowerCase() + '.' + name.toLowerCase() + '.json';

	//Write Config File
	fs.writeFile(dir, JSON.stringify(json), (err) => { if(err){ console.log(err); } });
}

//Add a Command to the Map of Commands, However plugins cannot call this when initialzing.
function AddCommand(name, data)
{
	if(name != undefined && data.func != undefined)
	{
		if(commands.has(name) == false)
		{
			commands.set(name.toLowerCase(), data);
		}
		else
		{
			console.log("Warning: Tried to add the command '" + name + "' but it already exists!");
		}
	}
	else
	{
		if(name == undefined)
		{
			console.log("Warning: Tried to add a command but it was missing a name!");
		}
		else
		{
			console.log("Warning: Tried to add the command '" + name + "' but it was missing the function!");
		}
	}
}

/*
	"788236129584545812": {
		"listenerone": {
			"onHeard": function(),
			"onStopped": function()
		},
		"listenertwo": {
			"onHeard": function(),
			"onStopped": function()
		}
	}
*/

function GetListeners(context){
	if(GuildListeners.has(context.guild.id)){
		let obj = GuildListeners.get(context.guild.id);
		let msg = "Listeners:\n";
		Object.keys(obj).forEach(name => {
			msg += name + '\n';
		});
		context.channel.send(msg);
	} else {
		context.channel.send("No Listeners Here");
	}
}

function StartGuildListener(guildID, name, onHeard, onStopped, callback){
	//Ensure Lowercase
	name = name.toLowerCase();

	if(GuildListeners.has(guildID)){
		let obj = GuildListeners.get(guildID);
		if(obj[name] != undefined){
			callback("Listener Already Exists!");
		} else {
			obj[name] = {"onHeard": onHeard, "onStopped": onStopped};
			console.log("Guild Listener Started: " + guildID + " " + name);
		}
	} else {
		let obj = {};
		obj[name] = {"onHeard": onHeard, "onStopped": onStopped};
		GuildListeners.set(guildID, obj);
		console.log("Guild Listener Started: " + guildID + " " + name);
	}
}

function StopGuildListener(guildID, name){
	name = name.toLowerCase();

	if(GuildListeners.has(guildID)){
		let obj = GuildListeners.get(guildID);
		if(obj[name] != undefined){
			if(obj[name].onStopped){
				obj[name].onStopped();
			}
			console.log("Guild Listener Stopped: " + guildID + " " + name);
			delete obj[name];
			GuildListeners.set(guildID, obj);
		}
	}
}

function StartChannelListener(channelID, name, onHeard, onStopped, callback){
	
}

function StopChannelListener(channelID, name){
	
}

function StartListening(channel, listener, onHear, callback){
    if(listeners.has(channel)){
        callback(false);
    } else {
        listeners.set(channel, {"listener": listener, "onHear": onHear});
        callback(true);
    }
}

function StopListening(channel, listenerToStop){
    if(listeners.has(channel) && listeners.get(channel).listener === listenerToStop){
        listeners.delete(channel);
    }
}

function GetCommands()
{
    return commands;
}

function Help(context, args)
{
	if(args[1] == undefined)
	{
		var msg = "";
		
		//TODO: Only give commands the message author can use
		//Get Every Command
		var keys = Array.from( commands.keys() );
		keys.forEach(command => {
			msg += '`~' + command + '`\n';
		});

		context.channel.send(context.author.toString() + "\n**All Commands:**\n" + msg);
	}
	else
	{
		var cmd = args[1].toLowerCase();
		
		if(commands.has(cmd))
		{
			context.channel.send(context.author.toString() + '\n**Command Help:** `~' + cmd + '`\n' + commands.get(cmd).help);
		}
		else 
		{
			//If the command either doesn't exit or there is not help msg for it.
			context.channel.send("I'm afraid I can't help with that command " + context.author.toString());
		}
	}
}

function DisableBotInGuild(context){
	if(context.author.id === context.guild.ownerID){
		if(context.mentions.has(client.user.id)){
			if(DisabledGuilds.includes(context.guild.id) == false){
				DisabledGuilds.push(context.guild.id);
			}
			GuildLog(":x: Bot Disabled! Do `~enable` followed by <@" + client.user.id + "> to Enable.", context.guild.id);
			context.channel.send('<@' + client.user.id + '> is now Disabled in this Server. Do `~enable` followed by <@' + client.user.id + '> to Enable.');

			//fs.writeFile('./DisabledGuilds.json', JSON.stringify(DisabledGuilds, undefined, 2), (err) => {});

			SaveConfig('core', 'disabledguilds', DisabledGuilds);
		}
	} else {
		context.channel.send("Only the Server Owner can Disable Me!");
	}
}



//Sends a Log to the Log Channel for the given Guild.
function GuildLog(message, guildID){
	if(guildID == undefined){
		console.log("Must specify guild for Guild Log.");
	} else {
		let channelID = GuildLogChannels.get(guildID);
		if(channelID != undefined){
			client.channels.fetch(channelID).then((channel) => {
				channel.send(message);
			}).catch((err) => {
				console.log("Failed to get Guild Log Channel.");
			});
		}
	}
}

//Logs a message in the Admin Log Channel.
function AdminLog(message){
	if(AdminLogChannel == undefined){
		if(config.adminLogChannel == undefined){
			console.log("Bot missing Admin Log Channel ID. Please add a Channel ID the Bot has access to in config.json with the key 'adminLogChannel'");
		} else {
			client.channels.fetch(config.adminLogChannel).then((channel) => {
				AdminLogChannel = channel;
				AdminLogChannel.send(message);
			}).catch((err) => {
				console.log("Failed to get Admin Log Channel. Error: " + err);
			});
		}
	} else {
		AdminLogChannel.send(message);
	}
}

function main(OnReady){
	//When the bot connects call OnReady
	client.on('ready', OnReady);

	//When Bot Recieves a Message
	client.on('message', (message) => {
		if (message.author == client.user) {
			return
		}
		
		msg = message.content.toLowerCase();
		
		if (msg[0] == "~"){
			args = msg.slice(1).split(' ');

			//Check bot is not Disabled in Guild.
			if(DisabledGuilds.includes(message.guild.id)){
				if(args[0] === 'enable' && message.mentions.has(client.user.id)){			
					let i = DisabledGuilds.indexOf(message.guild.id);
					DisabledGuilds.splice(i, i + 1);
					SaveConfig('core', 'disabledguilds', DisabledGuilds);
					
					message.channel.send("Alright I'm Enabled! <@" + client.user.id + ">");
					GuildLog(":white_check_mark: Bot Enabled!", message.guild.id);
					message.react('✅');
				}
				return;
			}
			
			console.log("Command called '" + msg + "'");
			
			// Restart & ForceQuit are special commands that are only callable by the Bot Admin.
			// The Bot Admin is set in the config.json file with the Key 'admin'
			// The Value is a String with the 18 Digit Discord User ID of the Bot Admin.
			switch (args[0]){
				case 'restart':
					if (message.author.id === config.admin){
						client.user.setActivity('Restarting...');
						message.channel.send("Restarting...");
						console.log("Restarting...");
						AdminLog(":arrows_clockwise: Bot Restarting...");
						setTimeout(function(){ client.destroy(); }, 1000);
					}
					else {
						message.channel.send("Only the Bot Admin can restart me!");
					}
					break;
				case 'forcequit':
					if(message.author.id === config.admin){
						client.user.setActivity('Shutting Down...');
						message.channel.send('Shutting Down...');
						AdminLog(":x: Bot Shutting Down...");
						fs.writeFile('./temp/QUIT', '', () => {
							client.destroy();
						});
					} else {
						message.channel.send("Only the Bot Admin can make me Quit!");
					}
					break;
				default:
					//Commands are stored in the commands variable
                    if(commands.has(args[0])){
                        var command = commands.get(args[0]).func;
                        command(message, args);
                    } else {
                        message.channel.send("I'm afraid thats not a valid command " + message.author.toString());
                    }
                    break;
			}
        }
        
        //Log Message
        //console.log(message.guild.id);

		//Check Listeners
		if(GuildListeners.has(message.guild.id)){
			let obj = GuildListeners.get(message.guild.id);
			let msg = "Listeners:\n";
			Object.keys(obj).forEach(name => {
				obj[name].onHeard(message);
			});
		}

        if(listeners.has(message.channel.id)){
            listeners.get(message.channel.id).onHear(message);
        }

    });
    
    client.on('messageUpdate', (message) => {

    });

    client.on('userUpdate', (user) => {

    });

    client.on('messageReactionAdd', (user) => {

    });

    client.on('messageReactionRemove', (user) => {

    });

    client.on('messageReactionRemoveAll', (user) => {

    });

    client.on('messageReactionRemoveEmoji', (user) => {

    });

    client.on('messageDelete', (user) => {

    });
	
	client.on('error', (err) => {
		console.log("Error Caught: " + err);
	});

	console.log("Attemping To Login!");
	client.login(config.token);
}


// //Load Bot Config
// LoadBotConfig(() => {

// 	//Set Basic Commands
// 	//AddCommand('help', Help, 'Do `~help` to see a list of commands or `~help command` to see help for that command.');

// 	AddCommand('listeners', {
// 		"func": (context) => {
// 			if(listeners.has(context.channel.id)){
// 				context.channel.send("**Current Listeners Here:**\n" + listeners.get(context.channel.id).listener);
// 			} else {
// 				context.channel.send("**No Current Listeners Here.**");
// 			}
// 		},
// 		"help": "Displays the Current Listeners to the Channel."
// 	});

// 	AddCommand('enable', {
// 		"func": (context) => { context.react('✅') },
// 		"help": "Enables the @'ed bot in the current Guild. Example: `~enable @botname`"
// 	});

// 	AddCommand('disable', {
// 		"func": DisableBotInGuild,
// 		"help": "Disables the @'ed bot in the current Guild. Example: `~disable @botname`"
// 	});

// 	AddCommand('writeconfig', {
// 		//TODO: This is temporary for testing
// 		"func": (context, args) => {
// 			SaveConfig(args[1], args[2], JSON.parse(args[3]), args[4]);
// 		},
// 		"help": "Sets the Log Channel for this Server."
// 	});

// 	AddCommand('getconfig', {
// 		//TODO: This is temporary for testing
// 		"func": (context, args) => {
// 			LoadConfig(args[1], args[2], args[3], (err, json) => {
// 				if(err){
// 					context.channel.send("Failed to load Config.");
// 				} else {
// 					context.channel.send(JSON.stringify(json, undefined, 2));
// 				}
// 			});
// 		},
// 		"help": "Sets the Log Channel for this Server."
// 	});

// 	AddCommand('setlog', {
// 		//TODO: This is temporary until the Config system is implemented.
// 		"func": (context, args) => { GuildLogChannels.set(context.guild.id, args[1]); context.react('✅'); },
// 		"help": "Sets the Log Channel for this Server."
// 	});

// 	AddCommand('clearlog', {
// 		"func": (context) => { GuildLogChannels.delete(context.guild.id); context.react('✅'); },
// 		"help": "Clears the Log Channel for this Server."
// 	});

// 	AddCommand('ping', {
// 		"func": (context) => { context.channel.send(':ping_pong: Pong!'); },
// 		"help": "Responds with Pong to check the bot is working!"
// 	});

// 	AddCommand('uptime', {
// 		"func": uptime,
// 		"help": "Displays how long the bot has been Online."
// 	});

// 	AddCommand('help', {
// 		"func": Help,
// 		"help": "Do `~help` to see a list of commands or `~help command` to see help for that command."
// 	});

// 	//Load Plugins
// 	LoadPlugins(() => {
// 		//Load Config
// 		LoadBotConfig();

// 		//Start Bot
// 		main();
// 	});
// });

//Core Commands
function InitCoreCommands(){
	AddCommand('ping', {
		"func": (context) => { context.channel.send(':ping_pong: Pong!'); },
		"help": "Responds with Pong to check the bot is working!"
	});
	AddCommand('help', {
		"func": Help,
		"help": "Do `~help` to see a list of commands or `~help command` to see help for that command."
	});
	AddCommand('enable', { //This is just catch the command so it doesn't say it doesn't exist.
		"func": {},
		"help": "Enables the @'ed bot in the current Guild. Example: `~enable @botname`"
	});
	AddCommand('disable', {
		"func": DisableBotInGuild,
		"help": "Disables the @'ed bot in the current Guild. Example: `~disable @botname`"
	});
	AddCommand('listeners', {
		"func": GetListeners, /*=> {
			if(listeners.has(context.channel.id)){
				context.channel.send("**Current Listeners Here:**\n" + listeners.get(context.channel.id).listener);
			} else {
				context.channel.send("**No Current Listeners Here.**");
			}
		},*/
		"help": "Displays the Current Listeners in the Channel."
	});
}


//////////////////////////////////////////////////////////////////////
/////////////////////	Initiate & Connect		/////////////////////
//////////////////////////////////////////////////////////////////////

// 1 - Load Bot Config
// 2 - Load Guilds the Bot is Disabled In
// 3 - Load Plugins
// 4 - Start Bot

//Load Bot Config
LoadBotConfig(() => {
	//Load Disabled Guilds
	LoadConfig('core', 'disabledguilds', undefined, (err, json) => {
		if(!err) { DisabledGuilds = json; }
	});

	//Init Core Commands
	InitCoreCommands();

	//Load Plugins
	LoadPlugins(() => {
		//Start Bot
		main(() => {
			client.user.setActivity('~help', { type: 'LISTENING' }).catch(console.error);
			AdminLog(":white_check_mark: Bot went Online!");
			console.log("\nConnected as " + client.user.tag);

			//Initiate Plugins - Might implement this to allow plugins to initiate once the bot client is connected.
		});
	});
});

//Notes
/*

{ //Listeners
	"name": "Listener", //Name of the Listener, Used to stop it.
	"exclusive": false or true, //Whether this must take exclusive control, only for channel listeners
	"priority": "0-10", //Used to determin which listener has priority in the stack
	"desire": "message" or "edit" or "react" or "delete", //What the listener cares about
	"onHeard": function(), //This is what's called when the listener hears something.
	"onStop": function() //Called when the Listener is stopped.
}

//Examples:
SwearGuard: SwearGuard, Guild, [message, edit], low

Hangman: Hangman, channel, [message], low

*/