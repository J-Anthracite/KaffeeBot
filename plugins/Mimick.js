//Mimicking Plugin V1.0
var link = module.exports = {};

link.name = "Mimick";
link.version = 1.0;
link.commands = new Map();

var isMimicking = false;

function mimick(context){
    if(msg[0] != "~"){
        context.channel.send(context.content);
    }
}

function toggleMimick(context){
    if(isMimicking){
        context.channel.send("Alright, I'll stop...");
        link.StopListening(context.channel.id, link.name);
        isMimicking = false;
    } else {
        link.StartListening(context.channel.id, link.name, mimick, (success) => {
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
link.commands.set('mimick', {
    "func": toggleMimick,
    "help": "The **Mimick** command repeats all of your messages!"
});