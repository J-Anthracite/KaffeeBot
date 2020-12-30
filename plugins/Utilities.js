//Utility Plugin V1.0
const link = module.exports = {};

link.name = "Utilities";
link.version = 1.0;
link.commands = new Map();

function GetUptime(context){
    if(link.client){
        let TotalSeconds = (link.client.uptime / 1000);
        let days = Math.floor(TotalSeconds / 86400);
        TotalSeconds %= 86400;
        let hours = Math.floor(TotalSeconds / 3600);
        TotalSeconds %= 3600;
        let minutes = Math.floor(TotalSeconds / 60);
        let seconds = Math.floor(TotalSeconds % 60);

        context.channel.send(":stopwatch: **I've been online for:** " + days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's');
    }
}

//Export Commands
link.commands.set('uptime', {
    "func": GetUptime,
    "help": "Displays how long the bot has been Online."
});