var Player = require("../models/player.js");
var Character = require("../models/character.js");

module.exports = {
	name: 'bp-feed',
	description: 'Gain BP with your selected character.  (Full BP if no amount is provided.)',
	aliases: ['feed'],
	usage: '[(opt) amount]',
	hidden: true,
	cooldown: 2,
	execute(message, args) {
		Player.getPlayer(message, function (player) {
			if (!player) return;

			Character.findById(player.selectedCharacter).exec(function (err, character) {
				if (err) {
					console.log("bp-feed - Character.findById: " + err);
					return message.author.send(err.message);
				}
				if (!character) {
					return message.author.send("You don't have a character selected.");
				}

				if (args[0] && isNaN(args[0])) {
					return message.reply("Invalid amount of BP.");
				} else if (args[0] && !isNaN(args[0])) {
					var amount = parseInt(args[0]);
				} else {
					var amount = Character.getMaxBP(character.generation) - character.bp;
				}

				if ((character.bp + amount) > Character.getMaxBP(character.generation)) {
					message.reply("That's more than you can take. Reducing amount to " + (Character.getMaxBP(character.generation) - character.bp) + ".");
					amount = Character.getMaxBP(character.generation) - character.bp;
				}

				character.bp += amount;
				character.save(function (err) {
					if (err) {
						console.log("bp-feed - character.save: " + err);
						return message.author.send(err.message);
					}

					message.reply(character.name + " gained " + amount + " BP. Now at " + character.bp + "/" + Character.getMaxBP(character.generation) + " BP.");
				});
			});
		});
	}
}