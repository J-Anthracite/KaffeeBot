console.log("Loading Message Responder...");

var exports = module.exports = {};

const mysql = require('mysql');
const Logger = require('./logger.js');

var defaultResponses = undefined;
require('fs').readFile('./defaults/default_responses.json', 'utf8', function(err, data) {
    if(err){
        Logger.logError('Failed to load default responses!');
    } else {
        defaultResponses = JSON.parse(data);
    }
});

function startConnection(callback){
    var conn = mysql.createConnection({
		host: "192.168.1.167",
		port: "3306",
		user: "dev",
        password: "8675309",
        database: "dev_responses"
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

//addResponse
function addResponse(context, responseID){
    if(context == undefined || responseID == undefined) {
        context.channel.send("Invalid use of the command!");
        return;
    }

    //Get Responses
    startConnection(function(success, conn){
        if(success){
            conn.query(('SELECT 0 FROM ' + responseID), function(err){
                if(err){
                    context.channel.send("Invalid ResponseID!");
                } else {
                    var guildID = context.guild.id;
                    conn.query(("SELECT responses FROM " + responseID + " WHERE guildID = '" + guildID + "'"), function(err, result){
                        if(result == undefined){ //If undefined create new
                            var responses = result[0].responses.split('|;');
                            
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
                }
            });
        }
    });
}

//removeResponse
function removeResponse(context, responseID){
    if(context == undefined || responseID == undefined) {
        context.channel.send("Invalid use of the command!");
        return;
    }


}

//Gets all the responses for a responseID
function checkResponses(context, responseID){
    if(context == undefined || responseID == undefined) {
        context.channel.send("Invalid use of the command!");
        return;
    }

    //Get Responses
    startConnection(function(success, conn){
        if(success){
            var guildID = context.guild.id;
            conn.query(("SELECT responses FROM " + responseID + " WHERE guildID = '" + guildID + "'"), function(err, result){
                var responses = undefined;
                if(result == undefined || result.length === 0){
                    responses = defaultResponses[responseID];
                } else {
                    responses = result[0].responses.split('|;');
                }

                if(responses != undefined && responses !== 0){
                    var msg = "**Responses:**\n1: ``";
                    var i = 0;
                    while(true){
                        msg += responses[i];
                        i++;
                        if (responses.length <= i){
                            context.channel.send(msg + "``");
                            break;
                        } else {
                            msg += "``\n" + (i + 1) + ": ``";
                        }
                    }
                }
                else {
                    context.channel.send("Invalid ResponseID!");
                }

            });
        }
    });
}

exports.respond = function respond(context, responseID, subID = 0, deleteContext = false, deleteAfter = 0){
    if(context == undefined) {
        Logger.log('Invalid Response Called! No context!');
        return;
    }

    if(deleteContext === true){
        context.delete();
    }
    
    if(responseID == undefined){
        Logger.warn('Invalid Response Called! No responeID!');
        return;
    }

    //Get Responses
    startConnection(function(success, conn){
        if(success){
            var guildID = context.guild.id;
            conn.query(("SELECT responses FROM " + responseID + " WHERE guildID = '" + guildID + "'"), function(err, result){
                responses = result[0].responses.split('|;');
                if (responses.length === 1){
                    console.log(responses);
                } else {
                    if(responses.length > subID){
                        console.log(responses[subID]);
                    }
                }
            });
        }
    });

}

exports.command = function command(context, args){
    switch (args[1]){
        case 'add':
            break;
        case 'remove':
            break;
        case 'check':
            checkResponses(context, args[2]);
            break;
        case 'clear':
            break;
        default:
            context.channel.send(context.auther + " I'm afraid that is not a valid responses command!");
            break;
    }
}