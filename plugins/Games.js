//Games Plugin V1.0
var link = module.exports = {};

link.name = "Games";
link.version = 1.0;
link.commands = new Map();

function bubblewrap(context)
{
    context.channel.send("Enjoy!\n||pop||||pop||||pop||||pop||||pop||||pop||||pop||\n||pop||||pop||||pop||||pop||||pop||||pop||||pop||\n||pop||||pop||||pop||||pop||||pop||||pop||||pop||\n||pop||||pop||||pop||||pop||||pop||||pop||||pop||\n||pop||||pop||||pop||||pop||||pop||||pop||||pop||");
}

function roll(context, args){
    switch(args[1]){
        case 'd4':
            context.channel.send(":game_die: You rolled a **" + Math.floor((Math.random() * 4) + 1) + "**");
            break;
        case 'd6':
            context.channel.send(":game_die: You rolled a **" + Math.floor((Math.random() * 6) + 1) + "**");
            break;
        case 'd8':
            context.channel.send(":game_die: You rolled a **" + Math.floor((Math.random() * 8) + 1) + "**");
            break;
        case 'd10':
            context.channel.send(":game_die: You rolled a **" + Math.floor((Math.random() * 10) + 1) + "**");
            break;
        case 'd12':
            context.channel.send(":game_die: You rolled a **" + Math.floor((Math.random() * 12) + 1) + "**");
            break;
        case 'd20':
            context.channel.send(":game_die: You rolled a **" + Math.floor((Math.random() * 20) + 1) + "**");
            break;
        case 'percentile':
            context.channel.send(":game_die: You rolled **" + (Math.floor(Math.random() * 10) * 10) + "%**");
            break;
        default:
            context.channel.send("You must specify a valid Die! Do `~help roll` for more info.");
            break;
    }
}

//Commands
link.commands.set('bubblewrap', {
    "func": bubblewrap,
    "help": "The **BubbleWrap** Command Dispenses a roll of BubbleWrap for you to Pop!"
});

link.commands.set('roll', {
    "func": roll,
    "help": "The **Roll** Command rolls the Specified Die. Example: `~roll d20`\nValid Dice: D4, D6, D8, D10, D12, D20, Percentile"
});



//link.AddCommand('name', function, 'Help Message');

/*
{
    "function": function,
    "help": "The Help Message for the Command."
}
*/

//Help
//link.help.set('bubblewrap', "The **BubbleWrap** Command Dispenses a roll of BubbleWrap for you to Pop!");
//link.help.set('roll', "The **Roll** Command rolls the Specified Die. Example: `~roll d20`\nValid Dice: D4, D6, D8, D10, D12, D20, Percentile");