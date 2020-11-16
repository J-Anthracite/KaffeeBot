console.log("Starting Kaffee Bot Beta...\n");

const Discord = require('discord.js');
const bot = new Discord.Client();

var plugins = [];

var commands = new Map();

var CommandHelp = new Map();

var listeners = new Map();


function LoadPlugins(callback){
    var fs = require('fs');

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
                plugin.commands.forEach((func, name) => {
                    if(commands.has(name) == false){
                        commands.set(name, func);
                    } else {
                        console.log("Error! Plugin '" + plugin.name + "' has the command '" + name + "' but that command already exists!");
                        throw('Overlapping Command Name: ' + name);
                    }
                });

                //Get Plugin Help
                plugin.help.forEach((message, name) => {
                    if(CommandHelp.has(name) == false){
                        CommandHelp.set(name, message);
                    } else {
                        console.log("Warning! Plugin '" + plugin.name + "' has the help message for '" + name + "' but a help message for that command already exists!");
                    }
                });

                //Link the Functions for Starting and Stopping Listening
                plugin.StartListening = StartListening;
                plugin.StopListening = StopListening;
                plugin.GetCommands = GetCommands;

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
			
			console.log("Command called '" + msg + "'");
			
			switch (args[0]){
                case 'hello':
                    if(message.author.id === '253187393019052032'){ //Angel
                        var d = new Date();
                        if((d.getMonth() + 1) == '11' && d.getDate() == '11'){
                            message.channel.send("Happy Birthday <@253187393019052032>!").then(sentmsg => { sentmsg.react('🎂') });
                        } else {
                            message.channel.send('Hello <@253187393019052032> my friend!');
                        }
                    }
                    else if (message.author.id === '320707233812054019'){ //J.Anthracite
                        var d = new Date();
                        if((d.getMonth() + 1) == '10' && d.getDate() == '23'){
                            message.channel.send("Happy Birthday <@320707233812054019>!").then(sentmsg => { sentmsg.react('🎂') });
                        } else {
                            message.channel.send('Hello <@320707233812054019> my creator!');
                        }
                    }
                    else {
                        message.channel.send("Hello " + message.author.toString() + "!");
                    }
                    break;
                case 'help':
                    if(args[1] === 'all')
                    {
                        var helpmessage = "All Commands:\n";
                        
                        CommandHelp.forEach((helpmsg) => {
                            helpmessage += helpmsg + "\n";
                        });

                        message.channel.send(helpmessage);
                    } else {
                        if(CommandHelp.has(args[1])){
                            message.channel.send(CommandHelp.get(args[1]));
                        } else {
                            message.channel.send("I'm afraid I can't help with that...");
                        }
                    }
                    break;
				case 'forcequit':
					if (message.author.id === '320707233812054019'){
						bot.user.setActivity('Quiting...');
						message.channel.send("Good Night!");
						setTimeout(function(){ bot.destroy(); }, 1000);
					}
					else { message.channel.send("Only the server owner can restart me!"); }
					break;
				default:
                    if(commands.has(args[0])){
                        var command = commands.get(args[0]);
                        command(message, args);
                    } else {
                        message.channel.send("I'm afraid thats not a valid command " + message.author);
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
	var fs = require('fs');
	fs.readFile('./config.json', (err, file) => {
		if(!err){
			var config = JSON.parse(file);
			bot.login(config.token);
		}
	});
}

//Load Plugins
LoadPlugins(() => {
    //Start
    main();
});

