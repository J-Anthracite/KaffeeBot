console.log("Starting Kaffee Bot Beta...\n");

const Discord = require('discord.js');
//const { config } = require('process');
const bot = new Discord.Client();
const fs = require('fs');

var config = {};

var botconfig = {};

var plugins = [];

var commands = new Map();

var help = new Map();

var listeners = new Map();

var ReactListeners = new Map();

//Guilds the Bot is currently Disabled in.
var DisabledGuilds = [];

function LoadBotConfig(callback){
	fs.readFile('./config.json', (err, file) => {
		if(err){
			console.log("Failed Loading 'config.json'!");
		} else {
			botconfig = JSON.parse(file);
			callback();
		}
	});
}

function LoadPlugins(callback){
    console.log("Searching for Plugins...");

    var found = 0;
    var successfull = 0;
    var failed = 0;

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
				
				plugin.GetCommands = GetCommands;
				plugin.AddCommand = AddCommand;

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

//Prints the Update for the Bot
function uptime(context)
{
	let totalSeconds = (bot.uptime / 1000);
	let days = Math.floor(totalSeconds / 86400);
	totalSeconds %= 86400;
	let hours = Math.floor(totalSeconds / 3600);
	totalSeconds %= 3600;
	let minutes = Math.floor(totalSeconds / 60);
	let seconds = Math.floor(totalSeconds % 60);
    context.channel.send(":stopwatch: **I've been online for:** " + days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's');
}

function DisableInGuild(context)
{
	if(context.author.id === context.guild.ownerID){
		if(context.mentions.has(bot.user.id)){
			if(DisabledGuilds.includes(context.guild.id) == false){
				DisabledGuilds.push(context.guild.id);
			}
			context.channel.send('<@' + bot.user.id + '> is now Disabled in this Server. Do `~enable` followed by <@' + bot.user.id + '> to Enable.');
			fs.writeFile('./DisabledGuilds.json', JSON.stringify(DisabledGuilds, undefined, 2), (err) => {});
		}
	} else {
		context.channel.send("Only the Server Owner can Disable Me!");
	}
}

function LoadConfig(){
	//Ensure config file exists
	if(!fs.existsSync('./DisabledGuilds.json')){
		fs.writeFileSync('./DisabledGuilds.json', '[]');
	}

	//Load Disabled Guilds
	var file = fs.readFileSync('./DisabledGuilds.json');

	if(file != undefined){
		let buffer = JSON.parse(file);
		if(buffer != undefined){
			DisabledGuilds = buffer;
		}
	}

	file = undefined;

	//Load Config File
	var file = fs.readFileSync('./config.json');
	
	if(file != undefined){
		let buffer = JSON.parse(file);
		if(buffer != undefined){
			config = buffer;
		} else {
			console.log("Failed Loading config.json!");
		}
	}
}

function main(){
	bot.on('ready', () => {
		console.log("\nConnected as " + bot.user.tag)
		bot.user.setActivity('~help', { type: 'LISTENING' }).catch(console.error);
	});

	bot.on('message', (message) => {
		if (message.author == bot.user) {
			return
		}
		
		msg = message.content.toLowerCase();
		
		if (msg[0] == "~"){
			args = msg.slice(1).split(' ');

			//Check bot is not Disabled in Guild.
			if(DisabledGuilds.includes(message.guild.id)){
				if(args[0] === 'enable' && message.mentions.has(bot.user.id)){			
					let i = DisabledGuilds.indexOf(message.guild.id);
					DisabledGuilds.splice(i, i + 1);
					fs.writeFile('./DisabledGuilds.json', JSON.stringify(DisabledGuilds, undefined, 2), (err) => {});
					
					message.channel.send("Alright I'm Enabled! <@" + bot.user.id + ">");
					message.react('✅');
				}
				return;
			}
			
			console.log("Command called '" + msg + "'");
			
			// Restart, Update, & ForceQuit are special commands that are only callable by the Bot Admin.
			// The Bot Admin is set in the config.json file with the Key 'admin'
			// The Value is a String with the 18 Digit Discord User ID of the Bot Admin.
			switch (args[0]){
				case 'restart':
					if (message.author.id === botconfig.admin){
						bot.user.setActivity('Restarting...');
						message.channel.send("Restarting...");
						console.log("Restarting...");
						setTimeout(function(){ bot.destroy(); }, 1000);
					}
					else {
						message.channel.send("Only the Bot Admin can restart me!");
					}
					break;
				case 'forcequit':
					if(message.author.id === botconfig.admin){
						bot.user.setActivity('Shutting Down...');
						message.channel.send('Shutting Down...');
						fs.writeFile('./temp/QUIT', '', () => {
							bot.destroy();
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
        //console.log(message);

        //Check Listeners
        if(listeners.has(message.channel.id)){
            listeners.get(message.channel.id).onHear(message);
        }

    });
    
    bot.on('messageUpdate', (message) => {

    });

    bot.on('userUpdate', (user) => {

    });

    bot.on('messageReactionAdd', (user) => {

    });

    bot.on('messageReactionRemove', (user) => {

    });

    bot.on('messageReactionRemoveAll', (user) => {

    });

    bot.on('messageReactionRemoveEmoji', (user) => {

    });

    bot.on('messageDelete', (user) => {

    });
	
	bot.on('error', (err) => {
		console.log("Error Caught: " + err);
	});

	console.log("Attemping To Login!");

	// fs.readFile('./config.json', (err, file) => {
	// 	if(!err){
	// 		var config = JSON.parse(file);
	// 		bot.login(config.token);
	// 	}
	// });
	bot.login(config.token);
}

//Load Bot Config
LoadBotConfig(() => {

	//Set Basic Commands
	//AddCommand('help', Help, 'Do `~help` to see a list of commands or `~help command` to see help for that command.');

	AddCommand('listeners', {
		"func": (context) => {
			if(listeners.has(context.channel.id)){
				context.channel.send("**Current Listeners Here:**\n" + listeners.get(context.channel.id).listener);
			} else {
				context.channel.send("**No Current Listeners Here.**");
			}
		},
		"help": "Displays the Current Listeners to the Channel."
	});

	AddCommand('enable', {
		"func": (context) => { context.react('✅') },
		"help": "Enables the @'ed bot in the current Guild. Example: `~enable @botname`"
	});

	AddCommand('disable', {
		"func": DisableInGuild,
		"help": "Disables the @'ed bot in the current Guild. Example: `~disable @botname`"
	});

	AddCommand('ping', {
		"func": (context) => { context.channel.send(':ping_pong: Pong!'); },
		"help": "Responds with Pong to check the bot is working!"
	});

	AddCommand('uptime', {
		"func": uptime,
		"help": "Displays how long the bot has been Online."
	});

	AddCommand('help', {
		"func": Help,
		"help": "Do `~help` to see a list of commands or `~help command` to see help for that command."
	});

	//Load Plugins
	LoadPlugins(() => {
		//Load Config
		LoadConfig();

		//Start Bot
		main();
	});
});