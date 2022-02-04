const Discord = require("discord.js")
const fs = require('fs');
const { disableAllButtons } = require("../Twig/discord");

module.exports = {
    name: "button",
    /**
     * @param {Discord.Client} client
     * @param {Discord.ButtonInteraction} interaction 
     * @param {Array} components
     */
    execute(client, interaction, components) {
        client.buttonCommands = new Discord.Collection();
        var curId = interaction.customId

        // Take commands
        const commandFiles = fs.readdirSync('./interactions/buttons/').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require('./buttons/' + file);
            client.buttonCommands.set(command.name, command);
        }

        const commandName = interaction.customId.split("-")[0].toUpperCase();

        const command = client.buttonCommands.get(commandName) || client.buttonCommands.find(cmd => cmd.activator && cmd.activator.toUpperCase() === commandName);

        try{
            command.execute(client, interaction, components, curId)
        }catch(error){
            console.log(error);
            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Big error lol')
                .setDescription('||error at: Trycatch at Button command execution||')
                .addFields([
                    { name: 'Error:', value: error.toString(), inline: false },
                ])
            interaction.reply({embeds: [embed]})
        }
    },
};