//Permission Manager Plugin V1.0
var link = module.exports = {};

link.name = "PermissionManager";
link.version = 1.0;
link.commands = new Map();

//Permission Display
var permdisplay;

//Store the permissions being edit, Map Key is the Role ID and the value is TRUE/FALSE
var TempPerms = [];

var SelectedCommand = "";

function InitiatePermissionEditor(context, args)
{
    //Check Valid Command
    if(link.GetCommands().has(args[1]) == false){
        context.channel.send("I'm afraid I don't see a command with that name to edit!");
        return;
    } else {
        SelectedCommand = args[1];
    }

    //Check if permission editor is already running
    if(permdisplay != undefined){
        permdisplay.edit("Permission Editing was Cancelled because `~SetPerm` was called again.")
        permdisplay = undefined;
    }

    //Clear Old Temp Perms
    TempPerms = [];

    //Load Perms
    link.LoadConfig('permissions', SelectedCommand, context.guild.id, (err, json) => {
        //Get Guild Role IDs and populate 
        context.guild.roles.fetch().then(roles => {
            //Load Each role & Check for Saves Permission
            roles.cache.keyArray().forEach(roleid => {
                TempPerms.push({ "RoleID": roleid, "Allowed": json.includes(roleid) ? true : false });
            });

            //Initiate Perm Display
            context.channel.send("**Loading Permission Manager V1.0...**").then( sentmsg => {
                permdisplay = sentmsg;
                UpdatePermDisplay();
            });
        });

        //Start Listening To Channel
        link.StartListening(context.channel.id, link.name, OnEditorInput, (success) => {
            if(!success){
                context.channel.send("Sorry! This channel is currently busy...");
                return;
            }
        });
    });
}

function UpdatePermDisplay(){
    if(permdisplay == undefined || SelectedCommand === ""){
        return;
    }

    //Message Header
    var messagecontent = "**Permission Editor V1.0  |  Editing Command:**  ` ~" + SelectedCommand + " `\n";

    //Message Body
    for (let index = 0; index < TempPerms.length; index++) {
        messagecontent += (TempPerms[index].Allowed ? ":green_square: **" : ":red_square: **") + index + ": <@&" + TempPerms[index].RoleID + ">**\n";
    }

    //Message Footer / Help
    messagecontent += "A user can call a command if they have any role with a green box. Roles with a red box cannot call the command.\n";
    messagecontent += "Example Input: `5`,  `allow 5-10`,  `disallow 5 7 8`,  `Allow All`.\n";
    messagecontent += "Typing Save will Save & Exit the Permission Editor. Typing Cancel will Exit & Not Save.";

    //Edit Permission Display Message
    permdisplay.edit(messagecontent);
}

function SetPermission(index, allow){
    if(TempPerms[index] != undefined)
    {
        TempPerms[index] = { "RoleID": TempPerms[index].RoleID, "Allowed": allow };
    }
}

function TogglePermission(index){
    if(TempPerms[index] != undefined)
    {
        TempPerms[index] = { "RoleID": TempPerms[index].RoleID, "Allowed": !TempPerms[index].Allowed };
    }
}

function OnEditorInput(context){
    var input = context.content.toLowerCase().split(' ');

    if(input[0] === 'save'){
        link.StopListening(context.channel.id, link.name);
        link.GuildLog("Permissions for the command `~" + SelectedCommand + "` changed.", permdisplay.guild.id);

        //We only store the Roles who can run the command
        let roles = []; //TempPerms.filter(role => role.Allowed == true);
        TempPerms.forEach((role) => {
            if(role.Allowed){
                roles.push(role.RoleID);
            }
        });

        link.SaveConfig('permissions', SelectedCommand, roles, context.guild.id);
        permdisplay.edit("Permissions for `~" + SelectedCommand + "` Saved!");
        permdisplay = undefined;
    }
    else if (input[0] === 'cancel'){
        link.StopListening(context.channel.id, link.name);
        permdisplay.edit('Permission Editing Cancelled!');
        permdisplay = undefined;
    }
    else if (input[0] === 'allow') {
        if (input[1] != undefined){
            //Allow All Roles
            if (input[1] === 'all')
            {
                for (var index = 0; index < TempPerms.length; index++)
                {
                    SetPermission(index, true);
                }
            }
            //If Second Argument contains a Dash Allow All Roles between First & Second Number.
            else if(input[1].includes('-'))
            {
                var range = input[1].split('-');
                
                if(range.length >= 2){
                    for (var index = parseInt(range[0], 10); index <= parseInt(range[1], 10); index++) {
                        SetPermission(index, true);
                    }
                }
            }
            //Allow Role for Each Number Given, Seperated by Spaces.
            else if (input.length > 1)
            {
                for (let index = 1; index < input.length; index++)
                {
                    SetPermission(parseInt(input[index], 10), true);
                }
            }
        }
    }
    else if (input[0] === 'disallow') {
        if (input[1] != undefined){
            //Disallow All Roles
            if (input[1] === 'all')
            {
                for (var index = 0; index < TempPerms.length; index++)
                {
                    SetPermission(index, false);
                }
            }
            //If Second Argument contains a Dash Disallow All Roles between First & Second Number.
            else if(input[1].includes('-'))
            {
                var range = input[1].split('-');
                
                if(range.length >= 2){
                    for (var index = parseInt(range[0], 10); index <= parseInt(range[1], 10); index++) {
                        SetPermission(index, false);
                    }
                }
            }
            //Disallow Role for Each Number Given, Seperated by Spaces.
            else if (input.length > 1)
            {
                for (let index = 1; index < input.length; index++)
                {
                    SetPermission(parseInt(input[index], 10), false);
                }
            }
        }
    }
    else {
        TogglePermission(parseInt(input[0], 10));
    }

    //Update the Display
    UpdatePermDisplay();

    //Delete User Input
    context.delete();
}

//Export Commands
link.commands.set('editperm', {
    "func": InitiatePermissionEditor,
    "help": "Opens the Permission Editor. Example: `~editperm ping`"
});

/*

[
    {
        "RoleID": 234234,
        "Allowed": false
    }
]

*/