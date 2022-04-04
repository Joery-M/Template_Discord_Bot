const Discord = require("discord.js")

module.exports = {
    name: "test",
    type: "MESSAGE",
    /**
     * @param {Discord.Client} client
     * @param {Discord.ContextMenuInteraction} interaction 
     */
    async execute (client, interaction)
    {
        interaction.reply("You right-clicked a message, and used this command!")
    }
}