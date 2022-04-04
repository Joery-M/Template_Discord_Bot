const Discord = require("discord.js")
const disVoice = require("@discordjs/voice")
const twig = require("../Twig")

module.exports = {
    name: "leave",
    aliases: [],
    guildOnly: true,
    memberpermissions: "",
    adminPermOverride: true,
    cooldown: 0,
    args: [],
    usage: "&pref;leave",
    /**
     * @param {Discord.Client} client
     * @param {Discord.Message} msg
     * @param {Array} args 
     * @param {String} curPrefix 
     */
    async execute(client, msg, args, curPrefix) {
        var vc = msg.guild.me.voice
        if (!vc.channel) {
            cantLeave(msg, "I'm not in a voice channel.")
            return
        }

        try {
            disVoice.getVoiceConnection(vc.guild.id).disconnect()
        } catch (err) {
            cantLeave(msg, "Something went wrong trying to leave the voice channel.\n\n||"+err.toString()+"||")
        }
    },
};

function cantLeave (msg, reason)
{
	const embed = new Discord.MessageEmbed()
		.setColor('#ff0000')
		.setTitle("🚫 I can't leave!")
		.setDescription(reason);

	msg.channel.send({ embeds: [embed], components: [twig.Discord.dismissButton] });
}