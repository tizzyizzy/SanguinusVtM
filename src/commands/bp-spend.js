var Player = require("../models/player.js");
var Character = require("../models/character.js");

/*
 * ToDo:
 * - Warn about frenzy depending on Virtue
 * - Warn about BP spent in one turn depending on Generation
 */
module.exports = {
	name: 'bp-spend',
	description: 'Spends BP with your selected character. Spends 1 BP if no amount is provided.',
	aliases: ['bp'],
	usage: '[(opt) amount] [(opt) comment]',
	cooldown: 2,
	execute(message, args) {
		Player.getPlayer(message, function (player) {
			if (!player) return;

			Character.findById(player.selectedCharacter).exec(function (err, character) {
				if (err) {
					console.log(err);
					message.author.send(err.message);
					return;
				}
				if (!character) {
					message.author.send("You don't have a character selected.");
					return;
				}

				if (args[0] && !isNaN(args[0])) {
					var amount = parseInt(args.shift());
				} else {
					var amount = 1;
				}
				if (character.bp < amount) {
					message.reply("You don't have enough BP. Currently " + character.bp + "/" + Character.getMaxBP(character.generation) + ".");
					return;
                }

				character.bp -= amount;
				character.save(function (err) {
					if (err) {
						console.log(err);
						message.author.send(err.message);
						return;
					}

					message.reply(character.name + " spent " + amount + " BP" +
						(args[0] ? " on '" + args.join(' ') + "'" : "") + ". " +
						character.bp + "/" + Character.getMaxBP(character.generation) + " BP left." +
						(amount > Character.getMaxBPPerTurn(character.generation) ? "\nKeep in mind: you are only allowed to spend " + Character.getMaxBPPerTurn(character.generation) + " BP per turn." : ""));
				});
			});
		});
	}
}