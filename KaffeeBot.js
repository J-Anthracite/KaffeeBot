console.log("Starting Kaffee Bot...\n");

const Discord = require('discord.js');
const bot = new Discord.Client();

const HangMan = require('./HangMan');

var settings;
var responses;
var words;

function loadConfig(filename, callback){
	var fs = require('fs');

	fs.readFile('./config/' + filename + '.json', 'utf8', function(err, data){
		if (!err){
			var result = JSON.parse(data);
			while (result == undefined){ }
			callback(result);
		}
	});
}

//Load Settings
loadConfig('settings', function(result){
	settings = result;

	loadConfig('responses', function(result){
		responses = result;
	
		loadConfig('words', function(result){
			words = result;

			main();
		});
	});
});

function reload(channel){
	console.log("Reloading Config...");

	loadConfig('settings', function(result){
		settings = result;
	
		loadConfig('responses', function(result){
			responses = result;
		
			loadConfig('words', function(result){
				words = result;
				
				console.log("Finished Reload!");
				channel.send("Finished Reload!");
			});
		});
	});
}

function badWordScore(input, callback){
	//var cleanedInput = input.replace(/[^a-zA-Z]/g, '');

	var bannedWords = words.bannedWords;
	bannedWords.forEach(function(word){
		if (input.indexOf(word) != -1) {
			callback(2);
			return;
		}
	});

	var bad = 0;
	var badWords = words.badWords;

	badWords.forEach(function(word){
		var pos = 0;
		while(input.indexOf(word, pos) != -1){
			pos = 1 + input.indexOf(word, pos);
			bad++;
		}
	});

	if (bad == 0){
		callback(0);
	} else {
		var wordCount = 0;

		input.split(' ').forEach(function(word){
			if(word.replace(/[^a-zA-Z]/g, '').length != 0){
				wordCount++;
			}
		});

		callback(bad / wordCount);
	}
}

function stateRule(num, message){
	if (num == undefined || num.isNan || message == undefined || num <= 0 || num > responses.rules.length){
		message.delete(3000);
		message.channel.send(message.author + " Invalid use of the command! Please do ~rule 1-" + responses.rules.length).then(sentMessage => {sentMessage.delete(3000);});
	} else {
		var msg = responses.rulePrefix + ' ' + responses.rules[num - 1];
		msg = msg.replace("%s", message.guild.name);
		msg = msg.replace("%u", message.auther);
		msg = msg.replace("%n", num);

		message.channel.send(msg);
	}
}

function main(){
	bot.on('ready', () => {
		console.log("\nConnected as " + bot.user.tag)
		bot.user.setActivity('~help')
	})

	bot.on('message', (message) => {
		if (message.author == bot.user) {
			return
		}
		
		msg = message.content.toLowerCase();
		
		if (msg[0] == "~"){
			args = msg.slice(1).split(' ');
			switch (args[0]){
				case 'ping':
					message.channel.send("Pong!");
					break;
				case 'hello':
					message.channel.send("Hello " + message.author + "!");
					break;
				case 'help':
					require('./help.js').help(message, args[1]);
					break;
				case 'rule':
					stateRule(args[1], message);
					break;
				case 'what':
					message.channel.send("You never heard of tuber simulator!?!");
					break;
				case 'coffee':
					message.channel.send("Here you go!\n" + responses.coffee[Math.floor(Math.random() * responses.coffee.length)]);
					break;
				case 'hangman':
					HangMan.newGame(message, args[1]);
					break;
				case 'pong':
					message.channel.send("Hey! thats what I'm supposed to say...");
					break;
				case 'reload':
					if (message.guild.ownerID == message.author.id){ reload(message.channel); }
					else { message.channel.send("Only the server owner can restart me!"); }
					break;
				case 'restart':
					if (message.guild.ownerID == message.author.id){ message.channel.send("Restarting..."); setTimeout(function(){ throw 'Restart Called!'; }, 1000); }
					else { message.channel.send("Only the server owner can restart me!"); }
					break;
				default:
					message.channel.send("I'm afraid thats not a valid command " + message.author);
					break;
			}
		} else {
			HangMan.checkInput(message);
		}
		
		//Check that message complies with rule 1
		badWordScore(msg, function(score){
			if (score == 2){
				message.delete();
				message.channel.send(message.author + "Your message was removed for containing a Banned Word!").then(sentMessage => {sentMessage.delete(3000);});
				console.log("Removed message containing banned word");
			}
			else if(score >= 0.5){
				message.delete();
				message.channel.send(message.author + "Your message was removed for containing too many Bad Words").then(sentMessage => {sentMessage.delete(3000);});
				console.log("Removed message containing to many bad words");
			}
		});

	});

	var fs = require('fs');
	file = fs.readFile('./config.json', (err, file) => {
		if(!err){
			var config = JSON.parse(file);
			bot.login(config.token);
		}
	});
}