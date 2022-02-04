const Discord = require("Discord.js")

module.exports = {
    name: "help",
    aliases: [],
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
    async execute(client, msg, args, curPrefix) {
        const helpJSON = require("../misc/help.json")
        var embed = new Discord.MessageEmbed()
            .setColor("#1ecc18")
            .setTitle('Please select a catagory.')
        var defButton = new Discord.MessageButton()
            .setLabel("Catagories")
            .setStyle(2)
            .setCustomId("H-Catagories")
        var defButtonRow = new Discord.MessageActionRow().addComponents(defButton)
        var buttonRow = new Discord.MessageActionRow()
        for (var key in helpJSON.Catagories) {
            embed.addField(key, helpJSON.Catagories[key])
            var keyButton = new Discord.MessageButton()
                .setCustomId("H-" + key)
                .setLabel(key)
                .setStyle(1)
            buttonRow.addComponents(keyButton)
        }
        msg.channel.send({ embeds: [embed], components: [buttonRow, defButtonRow] });
    },
};