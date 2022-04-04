const Discord = require("discord.js")

module.exports = {
    name: "dismiss",
    activator: "dismiss",
    /**
     * @param {Discord.Client} client
     * @param {Discord.ButtonInteraction} interaction 
     * @param {Array} components
     * @param {String} curId
     */
    execute (client, interaction, components, curId)
    {
        if (interaction.message.deletable) {
            interaction.message.delete()
        }
    }
}