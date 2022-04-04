const Discord = require("discord.js")

module.exports = {
    name: "test",
    type: "USER",
    /**
     * @param {Discord.Client} client
     * @param {Discord.UserContextMenuInteraction} interaction 
     * @param {Array} components
     * @param {String} curId
     */
    async execute (client, interaction)
    {
        var name = (await interaction.targetUser.fetch()).username
        interaction.reply("You right-clicked a User, called `"+name+"`, and used this command!")
    }
}