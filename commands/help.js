const Discord = require("discord.js")
const fs = require('fs');

module.exports = {
    name: "help",
    aliases: [],
    description: "Your looking at it.",
    category: "Bot",
    guildOnly: false,
    memberpermissions: "",
    adminPermOverride: true,
    cooldown: 0,
    args: [],
    usage: "&pref;help",
    /**
     * @param {Discord.Client} client
     * @param {Discord.Message} msg
     * @param {Array} args 
     * @param {String} curPrefix 
     */
    execute(client, msg, args, curPrefix) {
        console.log(__dirname);
        const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
        console.log(commandFiles);
        var helpCommands = {}
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Help')

        for (const file of commandFiles) {
            const command = require(file);
            var commandNames = [command.name]
            command.aliases.forEach(elem => {
                commandNames.push(elem)
            });
            var curHelpCommandJson = helpCommands[commandNames.join(", ")]
            curHelpCommandJson = {}
            curHelpCommandJson.description = command.description
            curHelpCommandJson.usage = command.usage
            curHelpCommandJson.catagory = command.catagory
            embed.addField(commandNames.join(", "), "Description: " + curHelpCommandJson.description + "\nUsage: " + curHelpCommandJson.usage)
        }
        msg.channel.send(embed);
    },
};