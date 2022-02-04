const Discord = require("discord.js")

module.exports = {
    name: "help",
    activator: "H",
    /**
     * @param {Discord.Client} client
     * @param {Discord.Interaction} interaction 
     * @param {Array} components
     * @param {String} curId
	 */
     execute(client, interaction, components, curId) {
        // get the help file
        var helpJSON = require("../../misc/help.json")

        // Get current prefix
        var prefixConfig = require("../../misc/prefixes.json")
        var curPrefix = prefixConfig[interaction.guildId]

        // get current catagory
        var catagory = helpJSON[curId.substr(2)]
        var embed = new Discord.MessageEmbed()
            .setColor("#1ecc18")
        if (interaction.customId == "H-Catagories") {
            embed.setTitle('Please select a catagory.')
        } else {
            embed.setTitle('All commands for catagory: ' + curId.substr(2))
        }
        // get all keys for catagory
        for (var key in catagory) {
            embed.addField(key, catagory[key])
        }
        //make all buttons to switch
        var buttonRow = new Discord.MessageActionRow()
        var embed2 = new Discord.MessageEmbed()
            .setColor("#1ecc18")
            .setTitle('Please select a catagory.')
        for (var key in helpJSON.Catagories) {
            embed2.addField(key, helpJSON.Catagories[key].replace(/&pref;/g, curPrefix))
            var keyButton = new Discord.MessageButton()
                .setCustomId("H-" + key)
                .setLabel(key)
                .setStyle(1)
                .setDisabled(false)
            buttonRow.addComponents(keyButton)
        }
        var defButton = new Discord.MessageButton()
            .setLabel("Catagories")
            .setStyle(2)
            .setCustomId("H-Catagories")
        var defButtonRow = new Discord.MessageActionRow().addComponents(defButton)
        interaction.update({ embeds: [embed], components: [buttonRow, defButtonRow] });

    }
}