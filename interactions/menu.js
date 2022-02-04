const Discord = require("discord.js")
const fs = require('fs');

module.exports = {
    name: "button",
    /**
     * @param {Discord.Client} client
     * @param {Discord.SelectMenuInteraction} interaction 
     * @param {Array} components
     */
    execute(client, interaction, components) {
        client.menuCommands = new Discord.Collection();
        var curId = interaction.customId

        // Take commands
        const commandFiles = fs.readdirSync('./interactions/menus/').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require('./menus/' + file);
            client.menuCommands.set(command.name, command);
        }

        const commandName = curId.toUpperCase();

        const command = client.menuCommands.get(commandName) || client.menuCommands.find(cmd => cmd.activator && cmd.activator.toUpperCase() == commandName);

        try{
            command.execute(client, interaction, components, curId)
        }catch(error){
            console.log(error);
            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Big error lol')
                .addFields([
                    { name: 'Error:', value: error.toString(), inline: false },
                ])
            interaction.reply({embeds: [embed]})
        }
    },
};