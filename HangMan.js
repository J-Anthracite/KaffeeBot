//HangMan Game Module
var exports = module.exports = {};

var HM_Config;
var HM_Words;

var isGameRunning = false;
var Channel;
var Player;
var DisplayMessage;
var Difficulty = 2;

var HM_Word;
var GuessedLetters = "";
var Guesses = 0;

var isConfigLoaded = false;

//Load Config and Words
require("./Loader.js").loadParsedJson("hangman/config", (err, json) => {
    if (err || json == undefined){ console.log(err); return; }
    HM_Config = json;

    require("./Loader.js").loadParsedJson("hangman/words", (err, json) => {
        if (err || json == undefined){ console.log(err); return; }
        HM_Words = json;
        isConfigLoaded = true;
        console.log("Loaded HangMan Module V1.0");
    });
});

//Sets all variables to default values!
function cleanupGame(){
    Channel = undefined;
    Player = undefined;
    DisplayMessage = undefined;
    StartedExit = false;
    isGameRunning = false;
    Difficulty = 2;
    GuessedLetters = "";
    Guesses = 0;
    HM_Word;
}

//Updates the display for the game
function updateGameDisplay(postfix = ""){
    //Assibles display message
    var displayMsg;
    displayMsg = "Send a letter to guess!\n";
    displayMsg += HM_Config.states[Guesses];
    displayMsg += "\nGuess:" + getGuessText();
    displayMsg += '\n' + postfix;

    //Creates new display message if none exists, or update the existing one.
    if (DisplayMessage == undefined){
        Channel.send(displayMsg).then( msg => { DisplayMessage = msg; });
    } else {
        DisplayMessage.edit(displayMsg);
    }
}

//Generate the word guess text
function getGuessText(){
    var wordLength = HM_Word.length;
    var guessText = "";
    for(var pos = 0; pos < wordLength; pos++){
        var letter = HM_Word.charAt(pos);
        if (GuessedLetters.includes(letter)){
            guessText += " " + letter;
        } else {
            guessText += " -";
        }
    }

    return guessText;
}

//Sets the player & channel, picks random word from difficulty, creates message for displaying game.
function setupNewGame(context){
    isGameRunning = true;
    Player = context.author;
    Channel = context.channel;

    //Get random word of selected difficulty
    switch (Difficulty){
        case 1: //Easy
            HM_Word = HM_Words.easy[Math.floor(Math.random() * HM_Words.easy.length)];
            context.channel.send("Starting a easy difficulty game!\nSend 'quit' to stop playing");
            break;
        case 3: //Hard
            HM_Word = HM_Words.hard[Math.floor(Math.random() * HM_Words.hard.length)];
            context.channel.send("Starting a hard difficulty game!\nSend 'quit' to stop playing");
            break;
        default: //Normal
            HM_Word = HM_Words.normal[Math.floor(Math.random() * HM_Words.normal.length)];
            context.channel.send("Starting a normal difficulty game!\nSend 'quit' to stop playing");
            break;
    }

    //console.log("Starting new game with the Word '" + HM_Word +"'");
    
    updateGameDisplay();
}

//Checks if the player has guessed all the letters in the word
function isGameWon(){
    var wordLength = HM_Word.length;
    for(var i = 0; i < wordLength; i++){
        if (!GuessedLetters.includes(HM_Word[i])){
            return false;
        }
    }

    return true;
}

//Starts a new game if one doesn't already exist
exports.newGame = function newGame(context, param){
    //Checks that the configuration is loaded
    if (isConfigLoaded == false) {
        console.log("HangMan Config is not loaded!");
        return;
    }

    cleanupGame();
    
    //Set difficulty if specified, otherwise it always defaults to normal.
    if (param == "easy") { Difficulty = 1; }
    else if (param == "hard") { Difficulty = 3; }

    //TODO Possibly add something to stop someone from overriding a game.
    setupNewGame(context);
}

//Handles player input
exports.checkInput = function checkInput(context){
    //Check if the input is from the player and is in the correct channel
    if (isGameRunning == true && Channel.id == context.channel.id && Player == context.author){
        var msg = context.content.toLowerCase();

        //Check the input is a-z
        if (msg.replace(/[^a-z]/g, '').length == 0){
            updateGameDisplay("A guess can only be a letter");
            context.delete();
        }

        //Checks if the message is only 1 char long
        else if (msg.length == 1){
            //Gets the letter
            var letter = msg.charAt(0);

            //Has the input already been guessed
            if (GuessedLetters.includes(letter)){
                updateGameDisplay("You already guessed " + letter.toUpperCase());
            } 
            else {
                GuessedLetters += letter;

                //Checks if the input letter is a letter in the word
                if (HM_Word.includes(letter)){
                    //Check if the game has been won
                    if (isGameWon()){
                        updateGameDisplay();
                        var message = "You Win!"; //Should get override, but just incase this prevents a empty message error.

                        switch (Difficulty){
                            case 1:
                                message = HM_Config.win_responses.easy[Math.floor(Math.random() * HM_Config.win_responses.easy.length)];
                                break;
                            case 3:
                                message = HM_Config.win_responses.hard[Math.floor(Math.random() * HM_Config.win_responses.hard.length)];
                                break;
                            default:
                                message = HM_Config.win_responses.normal[Math.floor(Math.random() * HM_Config.win_responses.normal.length)];
                                break;
                        }
                        message = message.replace("%u", context.author);
                        
                        context.channel.send(message);
                        

                        cleanupGame();
                    } else {
                        updateGameDisplay("Word Contains " + letter.toLowerCase());
                    }
                } else {
                    Guesses += 1;
                    
                    //If the guesses is equal to 7 which is the final frame, end the game!
                    if(Guesses == 7){
                        updateGameDisplay();

                        
                        var message = "You Lose"; //Should get override, but just incase this prevents a empty message error.

                        switch (Difficulty){
                            case 1:
                                message = HM_Config.lose_responses.easy[Math.floor(Math.random() * HM_Config.lose_responses.easy.length)];
                                break;
                            case 3:
                                message = HM_Config.lose_responses.hard[Math.floor(Math.random() * HM_Config.lose_responses.hard.length)];
                                break;
                            default:
                                message = HM_Config.lose_responses.normal[Math.floor(Math.random() * HM_Config.lose_responses.normal.length)];
                                break;
                        }

                        

                        //Replace %u
                        message = message.replace("%u", context.author);
                        context.channel.send("The word was: **" + HM_Word.toUpperCase() + "**");
                        context.channel.send(message);
                        
                        cleanupGame();
                    } else {
                        updateGameDisplay("Word has no " + letter.toLowerCase());
                    }
                }
            }
            
            context.delete();
            }

        //If the input is longer than one char check if its exit or quit
        else if (msg == "exit" || msg == "quit"){
            context.channel.send("Alrighty! Game Quit.");
            DisplayMessage.delete();
            context.delete();
            cleanupGame();
        }
    }
}
