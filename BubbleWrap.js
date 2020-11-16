//BubbleWrap Game Module
var exports = module.exports = {};

var cooldown = false;

exports.newGame = function newGame(context){
	//Was game Recently started in Channel?
	if(cooldown == true){
		//Warn about using all the Bubble Wrap
		context.channel.send("Whoa! Calm down, we don't want to use all the bubble wrap at once!!").then(sentMessage => {sentMessage.delete(({ timeout: 3000 }));});
	} 
	else {
		//Start Game
		context.channel.send("Enjoy!\n||pop||||pop||||pop||||pop||||pop||||pop||||pop||\n||pop||||pop||||pop||||pop||||pop||||pop||||pop||\n||pop||||pop||||pop||||pop||||pop||||pop||||pop||\n||pop||||pop||||pop||||pop||||pop||||pop||||pop||\n||pop||||pop||||pop||||pop||||pop||||pop||||pop||");
		cooldown = true;
		setTimeout(function(){ cooldown = false; }, 30000);
	}
	
	context.delete();
}

console.log("Loaded BubbleWrap V1.0");
