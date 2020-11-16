//Utility Plugin V1.0
var exports = module.exports = {};

var commands = new Map();

exports.name = "Utilities";
exports.version = 1.0;
exports.commands = new Map();
exports.help = new Map();

function ping(context)
{
    context.channel.send(':ping_pong: Pong!')
}

//Export Commands
exports.commands.set('ping', ping);

//Help
exports.help.set('ping', "The **Ping** Command send a Pong in Response.");