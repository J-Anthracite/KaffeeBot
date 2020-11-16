var exports = module.exports = {};

exports.help = function help(context, param){
    switch (param) {
        case "ping":
                context.channel.send("Ping - Check to see if I'm online!");
                break;
        case "coffee":
            context.channel.send("Coffee - If you need some coffee just ask!");
            break;
        case "hello":
                context.channel.send("Coffee - If you need some coffee just ask!");
                break;
        default:
            var msg = "**Here are my commands!**\n";
            //Commands everyone can use
            msg += "Ping - Check to see if I'm online\n";
            msg += "Hello - Say Hello to me!\n";
            msg += "Rule - Ask what a rule is!\n";
            msg += "Coffee - If you need some coffee just ask!\n";
            msg += "Hangman - I'll start a game of Hangman for you!\n";
            
            //Commands only light beans and higher can use

            //Commands only regular beans and higher can use

            //Commands only dark beans and higher can use

            //Commands only admin can use

            //Commands only owner can use

            msg += "\nFor specifics on a command do *~help CommandName*";
            context.channel.send(msg);
            break;
    }
}