const Discord = require("discord.js")
const twig = require("../Twig")

module.exports = {
    name: "ping",
    aliases: ["uptime"],
    guildOnly: false,
    memberpermissions: "VIEW_CHANNEL",
    adminPermOverride: true,
    cooldown: 0,
    args: [],
    usage: "&pref;ping or &pref;uptime",
    /**
     * @param {Discord.Client} client
     * @param {Discord.Message} msg
     * @param {Array} args 
     * @param {String} curPrefix 
     */
    async execute(client, msg, args, curPrefix) {
        // I'm doing it like this because its more accurate
		var measureMsg = await msg.channel.send("Ping is being determined...")
		var msgTime = msg.createdTimestamp
		var curTime = measureMsg.createdTimestamp
        var actualTime = Date.now()
		var timeAlive = twig.msToTime(process.uptime()*1000)

        // If the ping originated from DidYouMean, multiply it by 2
        var multiplier = 1
        if (msg.isCorrected) {
            multiplier = 2
        }
		var ping = Math.round(curTime - msgTime) * multiplier

        var percentage = Math.min(ping/1000, 1)
        var color = twig.lerpColor('#00ff00', "#ff0000", percentage)

        var pingDescription

        if (ping > 1000) {
            pingDescription = "Bad"
        }else if (ping > 600) {
            pingDescription = "Not great"
        }else if(ping > 300){
            pingDescription = "Decent"
        }else {
            pingDescription = "Good"
        }

		const embed = new Discord.MessageEmbed()
			.setColor(color)
			.setTitle("Ping and uptime")
			.addFields([
				{ name: "Ping", value: `${ping}ms (${pingDescription})`, inline: true },
				{ name: "Uptime", value: timeAlive, inline: true },
			])
        
        measureMsg.edit({ content: "\u200b", embeds: [embed] })
    },
};