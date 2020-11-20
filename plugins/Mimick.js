//Mimicking Plugin V1.0
var exports = module.exports = {};

var commands = new Map();

exports.name = "Mimick";
exports.version = 1.0;
exports.commands = new Map();
exports.help = new Map();

var isMimicking = false;

function mimick(context){
    if(msg[0] != "~"){
        context.channel.send(context.content);
    }
}

function toggleMimick(context){
    if(isMimicking){
        context.channel.send("Alright, I'll stop...");
        exports.StopListening(context.channel.id, exports.name);
        isMimicking = false;
    } else {
        exports.StartListening(context.channel.id, exports.name, mimick, (success) => {
            if(success){
                context.channel.send("Initiating Annoyance! Use `~mimick` again to stop.");
                isMimicking = true;
            } else {
                context.channel.send("Sorry! This channel is currently busy...");
            }
        });
    }
}

//Export Commands
exports.commands.set('mimick', {
    "func": toggleMimick,
    "help": "The **Mimick** command repeats all of your messages!"
});