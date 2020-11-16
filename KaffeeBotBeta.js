const Discord = require('discord.js');
const bot = new Discord.Client();

const Logger = require('./logger.js');
const Perm = require('./Permissions.js');
const DBM = require('./DBManager.js');
const MR = require('./MessageResponder.js');
const CM = require('./CurseManager.js');

function adminCommand(context, args){
	if(context.author.id === '320707233812054019'){ //Admin commands can only be run by this account!
		switch (args[1]){
			case 'uptime':
				var s = bot.uptime;
				var ms = s % 1000;
				s = (s - ms) / 1000;
				var secs = s % 60;
				s = (s - secs) / 60;
				var mins = s % 60;
				var hrs = (s - mins) / 60;
				var days = (s - hrs) / 24;
				context.channel.send('I have been concurrently online for ' + days + 'd ' + hrs + 'h ' + mins + 'm ' + secs + 's');
				break;
			case 'update':
				context.channel.send("Updating is not yet implemented!");
				break;
			case 'backup':
				context.channel.send("Backing up is not yet implemented!");
				break;
			case 'restart':
				context.channel.send("Restarting...");
				bot.user.setActivity('Restarting...');
				setTimeout(() => { process.exit(0); }, 500);
				break;
			case 'shutdown':
				context.channel.send("Shutting Down...");
				var fs = require('fs');
				fs.writeFile('./Temp/QUIT', '', (err) => {
					bot.destroy();
					process.exit(0);
				});
				break;
		}
	} else {
		context.channel.send(context.author + " I'm afraid you are not allowed to run this command!");
	}
}

function main(){
	bot.on('ready', () => {
		console.log("Connected as " + bot.user.tag + "\n");
		bot.user.setActivity('~help');
	});

	bot.on('message', (message) => {
		if (message.author == bot.user) {
			return;
		}
		
		var msgCont = message.content.toLowerCase();

		if(msgCont[0] === "~"){
			msgCont = msgCont.slice(1);
			Logger.logCommand(msgCont);
			var args = msgCont.split(' ');
			switch(args[0]){
				case 'ping':
					message.channel.send("Pong! `" + bot.ping + "ms`");
					break;
				case 'curses':
					CM.curseCommand(message, args);
					break;
				case 'responses':
					MR.command(message, args);
					break;
				case 'perms':
					Perm.command(message, args);
					break;
				case 'canrun':
					Perm.canExecute(message, args[1], (allowed) => {
						message.channel.send(allowed ? "You can execute that here!" : "You can not run that here"); //"Can run here: **" + allowed + "**");
					});
					break;
				case 'admin':
					adminCommand(message, args);
					break;
				default:
					message.channel.send(message.author + " I'm afraid thats not a valid command!");
					break;
			}
		} else { //For now we don't check for curses in commands
			CM.moderateMessage(message);
		}
	});

	bot.on('messageUpdate', (oldMessage, newMessage) => {
		CM.moderateMessage(newMessage);
	});

	//bot.on('voiceStateUpdate', (oldMember, newMember) => {
	//	
	//});

	//bot.on('typingStart', (channel, user) => {
	//	channel.send("I see you typing!").then(sentMessage => {sentMessage.delete(1000);});
	//});

	bot.on('error', err => {
		Logger.logError(err.code);
	});

	var fs = require('fs');
	file = fs.readFile('./config.json', (err, file) => {
		if(!err){
			var config = JSON.parse(file);
			bot.login(config.token).then().catch();
		}
	});
}

console.log("\nStarting Kaffee Bot Beta...");

main();