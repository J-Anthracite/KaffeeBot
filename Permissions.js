console.log("Loading Permissions...");

var exports = module.exports = {};

const mysql = require('mysql');
const Logger = require('./logger.js');

var defaultPermissions = undefined;
require('fs').readFile('./defaults/default_permissions.json', 'utf8', function(err, data) {
    if(err){
        Logger.logError('Failed to load Default Permissions!');
    } else {
        defaultPermissions = JSON.parse(data);
    }
});

function startConnection(callback){
    var conn = mysql.createConnection({
		host: "192.168.1.167",
		port: "3306",
		user: "dev",
        password: "8675309",
        database: "dev_commands"
    });
    
    conn.connect(function(err) {
		if (err){ 
            Logger.logError("Failed to connect to Data Base!");
            callback(false);
        }
		else {
			callback(true, conn);
		}
    });
}

function canExecuteInChannel(channels, channelID, callback){
    switch (channels){
        case 'anywhere':
            callback(true);
            break;
        case 'admin':
            //TODO Check if this channel is an administration channel on this server
            callback(true);
            break;
        default:
            //Check if the channelID is in the white list of channels for the command
            if(channels.includes(channelID)){
                callback(true);
            } else {
                callback(false);
            }
            break;
    }
}

function canUserExecuteByRole(roles, memberRoles, callback){
    if(roles !== "everyone"){
        var roles = roles.split(' ');

        var i = 0;
        while(true){
            if (memberRoles.has(roles[i])) {
                callback(true);
                break;
            } 
            else if (i <= roles.length){
                i++;
            }
            else {
                callback(false);
                break;
            }
        }
    }
}

function getCommandChannels(context, commandID){
    startConnection(function(success, conn){
        if(success){
            conn.query(("SELECT config FROM " + commandID + " WHERE guildID = '" + context.guild.id + "'"), function(err, result){
                if(result != undefined){
                    var json = JSON.parse(result[0].config);
                    var channels = json['channels'];
                    if(channels != undefined){
                        if (channels === "anywhere" || channels === "admin"){
                            context.channel.send("Command Channel Whitelist set to: **" + channels + "**")
                        } else {
                            channels = channels.split(' ');
                            var msg = "Command Channel Whitelist:\n";
                            var i = 0;
                            while(true){
                                msg += "<#" + channels[i] + "> ";
                                i++;
                                if (channels.length <= i){
                                    context.channel.send(msg);
                                    break;
                                }
                            }
                        }
                    }
                } else {
                    context.channel.send("Command Channel Whitelist set to Default: **" + defaultPermissions[commandID]['channels'] + "**");
                }
            });
        }
    });
}

exports.hasPermission = function hasPermission(context, permissionID, callback){
    //Check if the user is the server owner, if so always allow.
    //if(context.guild.ownerID == context.author.id){
    //    callback(true);
    //}

    //Check if the
    startConnection(function(success, conn){
        var guildID = context.guild.id;
        if(success){
            conn.query(("SELECT roles FROM " + permissionID + " WHERE guildID = '" + guildID + "'"), function(err, result){
                var roles = result[0].roles.split(' ');

                for(var i = 0; i <= roles.length; i++){
                    if(context.member.roles.has(roles[i])){
                        callback();
                        return;
                    }
                }

                context.channel.send("You do not have permission to do that!");
            });
        }
    });
}

exports.canExecute = function canExecute(context, commandID, callback){
    //If the user is the server owner always execute
    //if(context.guild.ownerID == context.author.id){
    //    callback(true);
    //}

    //Check CommandID is Valid & Get Default Permissions
    var perms = defaultPermissions[commandID];
    if (perms == undefined) {
        Logger.logWarn("Invalid CommandID " + commandID);
        return;
    }

    //Check for any server specific config to override default action
    startConnection(function(success, conn){
        if(success){
            conn.query(("SELECT config FROM " + commandID + " WHERE guildID = '" + context.guild.id + "'"), function(err, result){
                if(result != undefined){
                    var json = JSON.parse(result[0].config);
                    
                    if(json != undefined){
                        perms = json;
                    }
                }

                canExecuteInChannel(perms['channels'], context.channel.id, (canExecuteInChannel) => {
                    if(canExecuteInChannel){
                        canUserExecuteByRole(perms['roles'], context.member.roles, (userMatchesRole) => {
                            if (userMatchesRole){
                                callback(true);
                            } else {
                                callback(false);
                            }
                        });
                    } else {
                        callback(false);
                    }
                });
            });
        }
    });
}

// ~perms (commandID) (command) (input)
exports.command = function permCommand(context, args){
    //TODO Check is valid command
    if (args[1] == undefined || args[2] == undefined || args[3] == undefined){
        context.channel.send(context.auther + " I'm afraid that is not a valid perms command! For examples do ~help perms");
        return;
    }
    
    var commandID = args[1];
    if(defaultPermissions[commandID] == undefined){
        context.channel.send(context.auther + " I'm afraid that is not a valid Command ID! For examples do ~help perms");
        return;
    }

    if (args[2] === "channels"){
        switch (args[3]){
            case 'add':
                break;
            case 'remove':
                break;
            case 'check':
                getCommandChannels(context, commandID);
                break;
            case 'reset':
                break;
        }
    }
    else if (args[2] === "roles"){
        switch (args[3]){
            case 'add':
                break;
            case 'remove':
                break;
            case 'check':
                break;
            case 'reset':
                break;
        }
    } 
    else {
        context.channel.send(context.auther + " I'm afraid that is not a valid perms command!");
    }
}