console.log("Loading Curse Manager...");

var exports = module.exports = {};

const mysql = require('mysql');
const Logger = require('./logger.js');

function startConnection(callback){
    var conn = mysql.createConnection({
		host: "192.168.1.167",
		port: "3306",
		user: "dev",
        password: "8675309",
        database: "dev_config"
    });
    
    conn.connect(function(err) {
		if (err){ 
            Logger.log("Failed to connect to Data Base!");
            callback(false);
        }
		else {
			callback(true, conn);
		}
    });
}

function addCurseWord(context, args){
    //Delete the command message
    context.delete();

    var word = args[2].replace(/[^a-z09]/g, '');
    var severity = args[3];

    //Ensure is a valid command
    if(word == undefined || severity == undefined) {
        context.channel.send("Invalid use! Example: `~curses add <word> <severity>`");
        return;
    }

    //Try and add Curse Word
    startConnection(function(success, conn){
        if(success){
            var guildID = context.guild.id;
            conn.query(("SELECT words FROM curses WHERE guildID = '" + guildID + "'"), function(err, result){
                if(result == undefined){ //If undefined create new
                    var badWords = {};
                    badWords[word] = severity;
                    var sql = "INSERT INTO curses (guildID, words) VALUES ('" + guildID + "', " + badWords + "')";
                    conn.query(sql, function(err, result){
                        context.channel.send("Updated Bad Words!");
                        Logger.log("Server '" + context.guild + "' just added '" + word + " to badWords with severity " + severity);
                    });
                } else { //Else update
                    var badWords = result[0].words;
                    badWords = JSON.parse(badWords);
                    badWords[word] = parseInt(severity);

                    var sql = "UPDATE curses SET words = '" + JSON.stringify(badWords) + "' WHERE guildID = '" + guildID + "'";
                    conn.query(sql, function(err, result){
                        context.channel.send("Updated Bad Words!");
                        Logger.log("Server '" + context.guild + "' just updated/added '" + word + "' to badWords with severity " + severity);
                    });
                }
            });
        } else {
            context.channel.send("Failed to Add!");
        }
    });
}

function removeCurseWord(context, args){
    //Delete the command message
    context.delete();

    //Ensure is a valid command
    var word = args[2].replace(/[^a-z09]/g, '');

    if(word == undefined) {
        context.channel.send("Invalid use! Example: `~curses remove <word>`");
        return;
    }

    //Remove Curse Word
    startConnection(function(success, conn){
        if(success){
            var guildID = context.guild.id;
            conn.query(("SELECT words FROM curses WHERE guildID = '" + guildID + "'"), function(err, result){
                if(result == undefined){ //If undefined create new
                    context.channel.send("It looks like curses are not setup yet!");
                } else { //Else update
                    var curses = result[0].words;
                    curses = JSON.parse(curses);
                    delete curses[word];

                    var sql = "UPDATE curses SET words = '" + JSON.stringify(curses) + "' WHERE guildID = '" + guildID + "'";
                    conn.query(sql, function(err, result){
                        context.channel.send("Removed Curse Word!");
                        Logger.log("Server '" + context.guild + "' just removed curse '" + word + "'");
                    });
                }
            });
        } else {
            context.channel.send("Failed to Remove!");
        }
    });
}

function checkForCurseWord(context, word){
    //Delete the command message
    context.delete();

    word = word.replace(/[^a-z09]/g, '');

    //Ensure is a valid command
    if(word == undefined) {
        context.channel.send("Invalid use! Example: `~curses check <word>`");
        return;
    }

    startConnection(function(success, conn){
        if(success){
            var guildID = context.guild.id;
            conn.query(("SELECT words FROM curses WHERE guildID = '" + guildID + "'"), function(err, result){
                var curses = result[0].words;
                curses = JSON.parse(curses);
                var value = curses[word];
                if(value == undefined){
                    context.channel.send("That is not a curse word!");
                } else {
                    if(value === -1){ context.channel.send("That is a banned word."); }
                    else { context.channel.send("That is a curse word with the severity of " + value); }
                }
            });
        }
    });
}

function getCurses(guildID, callback){
    startConnection(function(success, conn){
        if(success){
            conn.query(("SELECT words FROM curses WHERE guildID = '" + guildID + "'"), function(err, result){
                if(!err){
                    callback(result[0].words);
                }
            });
        }
    });
}

function getOccurrences(string, substr, callback){
    if(substr.length <= 0) return 0;

    var n = 0, pos = 0;

    while(true){
        pos = string.indexOf(substr, pos);
        if (pos >= 0) {
            ++n;
            pos += substr.length;
        } else {
            callback(n);
            break;
        }
    }
}

function handleDelete(context){
    context.delete();
    context.channel.send(context.author + " Your message was removed for to much inappropriate language.").then(sentMessage => {sentMessage.delete(3000);});
}

exports.moderateMessage = function moderateMessage(context){
    //Cleanup the message
    var message = context.content.toLowerCase();
    //message = message.replace(/\s/g, '');
    message = message.replace(/[^a-z09]/g, '');
    var score = 0;

    getCurses(context.guild.id, function(words){
        var curses = JSON.parse(words);
        var keys = Object.keys(curses);
        var i = 0;
        while(true){
            var count = 0, pos = 0;
            var word = keys[i];
            while(true){
                pos = message.indexOf(word, pos);
                if(pos >= 0){
                    count++;
                    message = message.replace(word, '');
                    //pos += word.length; //As the word is being removed it shouldn't need shifted
                } else {
                    if(count >= 1){
                        if(curses[word] === -1){
                            context.delete();
                            context.channel.send("Your message was removed for containing a banned word " + context.author).then(sentMessage => {sentMessage.delete(3000);});
                            return;
                        } else {
                            score += curses[word] * count;
                        }
                    }
                    break;
                }
            }
            if (i < keys.length) {
                i++;
            } else {
                //if (message.length > 0 && (message.length - score) <= 0){ handleDelete(context); }
                if (((message.length / 4) - score) <= 0){
                    handleDelete(context);
                }
                console.log((message.length / 4) - score);
                //console.log(message);
                break;
            }
        }

    });
}

exports.curseCommand = function curseCommand(context, args){
    switch (args[1]){
        case 'add':
            addCurseWord(context, args);
            break;
        case 'remove':
            removeCurseWord(context, args);
            break;
        case 'check':
            checkForCurseWord(context, args[2]);
            break;
        default:
            context.channel.send(context.auther + " I'm afraid that is not a valid command!");
            break;
    }
}