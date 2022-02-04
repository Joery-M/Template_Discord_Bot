const Discord = require("discord.js")

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
		var timeAlive = timeSince(new Date(curTime - client.uptime))

        // If the ping originated from DidYouMean, multiply it by 2
        var multiplier = 1
        if (msg.isCorrected) {
            multiplier = 2
        }
		var ping = Math.round(curTime - msgTime) * multiplier
        var color = "#0099ff"
        if (ping > 250) {
            color = "#ff0000"
        }

		const embed = new Discord.MessageEmbed()
			.setColor(color)
			.setTitle("Ping and uptime")
			.addFields([
				{ name: "Ping", value: ping + "ms", inline: true },
				{ name: "Uptime", value: timeAlive, inline: true },
			])
        
        measureMsg.delete()
		msg.channel.send({ embeds: [embed] })
    },
};

function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval >= 1) {
        if (interval == 1) {
            return Math.floor(interval) + " year";
        }
        return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval >= 1) {
        if (interval == 1) {
            return Math.floor(interval) + " month";
        }
        return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval >= 1) {
        if (interval == 1) {
            return Math.floor(interval) + " day";
        }
        return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval >= 1) {
        if (interval == 1) {
            return Math.floor(interval) + " hour";
        }
        return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval >= 1) {
        if (interval == 1) {
            return Math.floor(interval) + " minute";
        }
        return Math.floor(interval) + " minutes";
    }
    if (seconds == 1) {
        return Math.floor(seconds) + " second";
    }
    return Math.floor(seconds) + " seconds";
}