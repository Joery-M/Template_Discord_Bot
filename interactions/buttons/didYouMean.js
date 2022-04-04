const Discord = require("discord.js")
const twig = require("../../Twig/")
const {cooldowns} = require("../../index").globalInfo

module.exports = {
	name: "didYouMean",
	activator: "D",
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Interaction} interaction
	 * @param {Array} components
	 * @param {Discord.Collection} cooldowns
     * @param {String} curId
	 */
	execute(client, interaction, components, curId) {
		//get all required vars
		var command = curId.substr(2).split(";")[0]
		var msgId = curId.split(";")[1]

		var curPrefix = require("../../misc/prefixes.json")[interaction.guildId]
		var channelMsg = interaction.channel.messages.cache.get(msgId)
		var args = channelMsg.content.split(" ").slice(1)

		// make channelMsg time the interaction time to make sure ping works
		channelMsg.createdTimestamp = interaction.createdTimestamp
		channelMsg.isCorrected = true

		// replace word
		var fullArgs = channelMsg.content.split(" ")
		fullArgs[0] = curPrefix + command
		channelMsg.content = fullArgs.join(" ")

		//get the command that needs to be executed, even if its an alias.
		var curCommand = client.commands.get(command) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(command))
		// Check if args are required
		if (curCommand.args && curCommand.args.length > 0 && !args.length) {
			let reply = `You didn't provide any arguments.`

			if (curCommand.usage) {
				reply += "\nThe proper usage would be: ``" + curCommand.usage.replace("&pref;", curPrefix) + "``."
			}

			//disable all the buttons on the interaction, respond, and return
			interaction.update({ components: twig.Discord.disableAllButtons(components) })
			channelMsg.channel.send(reply)
			return
		}

		// Check if user is in cooldown
		if (!cooldowns.has(curCommand.name)) {
			cooldowns.set(curCommand.name, new Discord.Collection())
		}

		const now = Date.now()
		const timestamps = cooldowns.get(curCommand.name)
		const cooldownAmount = (curCommand.cooldown || 3) * 1000

		if (timestamps.has(channelMsg.author.id)) {
			const expirationTime = timestamps.get(channelMsg.author.id) + cooldownAmount

			if (now < expirationTime) {
				// If user is in cooldown
				const timeLeft = (expirationTime - now) / 1000

				//disable all the buttons on the interaction, respond, and return
				interaction.update({ components: twig.Discord.disableAllButtons(components) })
				channelMsg.reply("please wait " + timeLeft.toFixed(1) + " more second(s) before reusing the ``" + curCommand.name + "`` command.")
				return
			}
		} else {
			timestamps.set(channelMsg.author.id, now)
			setTimeout(() => timestamps.delete(channelMsg.author.id), cooldownAmount)

			// Execute command
			try {
				curCommand.execute(client, channelMsg, args, curPrefix)
			} catch (error) {
				console.error(error)
				channelMsg.reply("there was an error trying to execute that command!")
			}
		}

		//disable all the buttons on the interaction
		interaction.update({ components: twig.Discord.disableAllButtons(components) })
	},
}
