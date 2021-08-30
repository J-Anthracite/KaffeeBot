//Guild Listener Plugin V1.0
const link = module.exports = {};

link.name = "GuildListener";
link.version = 1.0;
link.commands = new Map();

function OnHeard(context){
    let msg = context.content.toLowerCase();

    if(msg.includes('hello')){
        context.channel.send("Hello!");
    }
}

function OnListenerStopped(){
    console.log("Guild Listener Stopped");
}

function StartListener(context){
    link.StartGuildListener(context.guild.id, link.name, OnHeard, undefined, (err) => {
        if(err){
            console.log(err);
        }
    });
}

// function StartListening(context){
//     link.StartGuildListener(context.guild.id, link.name, {
//         "desire": ["message"],
//         "onHeard": OnHeard,
//         "onStopped": OnListenerStopped
//     });
// }

function StopListener(context){
    link.StopGuildListener(context.guild.id, link.name);
}

//Export Commands
link.commands.set('sgl', {
    "func": StartListener,
    "help": "Starts the Listener"
});

//Export Commands
link.commands.set('egl', {
    "func": StopListener,
    "help": "Starts the Listener"
});