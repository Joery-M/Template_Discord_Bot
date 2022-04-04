const Discord = require("discord.js");
const disVoice = require("@discordjs/voice");
const twig = require("../Twig");

module.exports = {
	name: "join",
	aliases: [],
	guildOnly: true,
	memberpermissions: "",
	adminPermOverride: true,
	cooldown: 0,
	args: [],
	usage: "&pref;join @user or &pref;join",
	/**
	 * @param {Discord.Client} client
	 * @param {Discord.Message} msg
	 * @param {Array} args
	 * @param {String} curPrefix
	 */
	async execute (client, msg, args, curPrefix)
	{
		// check if user mentions a user
		if (args.length > 0 && msg.mentions && msg.mentions.users.size >= 1)
		{
			let mention = msg.guild.members.cache.get(msg.mentions.users.first().id);
			if (!mention.voice.channel || !mention.voice.channel.joinable)
			{
				return msg.channel.send("I can't join that person.");
			}
			// join
			let vc = mention.voice.channel;
			disVoice.joinVoiceChannel({
				channelId: vc.id,
				guildId: vc.guildId,
				adapterCreator: vc.guild.voiceAdapterCreator,
			});
			return;
		}
		// join user that sent message
		var vc = msg.member.voice;
		if (!vc.channel)
		{
			return cantJoin(msg, "You're not in a voice channel.");
		}
		if (!vc.channel.joinable)
		{
			return cantJoin(msg, "I don't have permission to join your voice channel.");
		}

		disVoice.joinVoiceChannel({
			channelId: vc.channel.id,
			guildId: vc.guild.id,
			adapterCreator: vc.guild.voiceAdapterCreator,
		})
	},
};

function cantJoin (msg, reason)
{
	const embed = new Discord.MessageEmbed()
		.setColor('#ff0000')
		.setTitle("🚫 I can't join you!")
		.setDescription(reason);

	msg.channel.send({ embeds: [embed], components: [twig.Discord.dismissButton] });
}