console.log("Loading DBManager...");

var exports = module.exports = {};
const mysql = require('mysql');

const Logger = require('./logger.js');

function startConnection(callback){
    var conn = mysql.createConnection({
		host: "192.168.1.167",
		port: "3306",
		user: "dev",
        password: "8675309",
        database: "dev_language"
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

exports.dbCommand = function dbCommand(context, args) {
    switch (args[1]){
        case 'status':
            startConnection(function(success){
                context.channel.send("Status: " + (success ? "Online" : "Offline"));
            });
            break;
        default:
            context.channel.send("Unknown Database Command!");
            break;
    }
}

exports.addBadWord = function addBadWord(context, args){
    context.delete();

    //Check the args are valid
    if(args[1] == undefined || args[2] == NaN) {
        context.channel.send("Invalid use! Example: *~addbadword badword 3*");
        return;
    }

    startConnection(function(success, conn){
        if(success){
            var guildID = context.guild.id;
            conn.query(("SELECT words FROM badWords WHERE guildID = '" + guildID + "'"), function(err, result){
                if(result == undefined){ //If undefined create new
                    var badWords = {};
                    badWords[args[1]] = args[2];
                    var sql = "INSERT INTO badWords (guildID, words) VALUES ('" + guildID + "', " + badWords + "')";
                    conn.query(sql, function(err, result){
                        context.channel.send("Updated Bad Words!");
                        Logger.log("Server '" + context.guild + "' just added '" + args[1] + " to badWords with severity " + args[2]);
                    });
                } else { //Else update
                    var badWords = result[0].words;
                    badWords = JSON.parse(badWords);
                    badWords[args[1]] = parseInt(args[2]);

                    var sql = "UPDATE badWords SET words = '" + JSON.stringify(badWords) + "' WHERE guildID = '" + guildID + "'";
                    conn.query(sql, function(err, result){
                        context.channel.send("Updated Bad Words!");
                        Logger.log("Server '" + context.guild + "' just updated/added '" + args[1] + "' to badWords with severity " + args[2]);
                    });
                }
            });
        } else {
            context.channel.send("Failed to Add!");
        }
    });
}

exports.removeBadWord = function removeBadWord(context, args){
    context.delete();

    if(args[1] == undefined) {
        context.channel.send("Invalid use! Example: *~removebadword badword*");
        return;
    }

    startConnection(function(success, conn){
        if(success){
            var guildID = context.guild.id;
            conn.query(("SELECT words FROM badWords WHERE guildID = '" + guildID + "'"), function(err, result){
                if(result == undefined){ //If undefined create new
                    context.channel.send("Removed Bad Word!");
                    Logger.log("Server '" + context.guild + "' just added '" + args[1] + " to badWords with severity " + args[2]);
                } else { //Else update
                    var badWords = result[0].words;
                    badWords = JSON.parse(badWords);
                    delete badWords[args[1]];

                    var sql = "UPDATE badWords SET words = '" + JSON.stringify(badWords) + "' WHERE guildID = '" + guildID + "'";
                    conn.query(sql, function(err, result){
                        context.channel.send("Removed Bad Word!");
                        Logger.log("Server '" + context.guild + "' just removed '" + args[1] + "' from badWords");
                    });
                }
            });
        } else {
            context.channel.send("Failed to Remove!");
        }
    });
}