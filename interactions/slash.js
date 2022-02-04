const Discord = require("discord.js");
const fs = require('fs');

module.exports = {
    name: "button",
    /**
     * @param {Discord.Client} client
     * @param {Discord.CommandInteraction} interaction 
     * @param {Array} components
     */
    execute (client, interaction)
    {
        client.slashCommands = new Discord.Collection();

        // Check if interaction was sent via DM's
        if (!interaction.inGuild)
        {
            let embed = new Discord.MessageEmbed()
                .setColor('#ff0000')
                .setTitle('I can\'t do that here!')
                .setThumbnail(client.attachments.get("Broken_disc"))
                .setDescription('Please go to a server to harnass my full power!!');

            interaction.reply({ embeds: [ embed ] });
        }

        // Take commands
        const commandFiles = fs.readdirSync('./interactions/slash/').filter(file => file.endsWith('.js'));
        for (const file of commandFiles)
        {
            const command = require('./slash/' + file);
            client.slashCommands.set(command.name, command);
        }

        const commandName = interaction.commandName.toUpperCase();

        const command = client.slashCommands.get(commandName) || client.slashCommands.find(cmd => cmd.name && cmd.name.toUpperCase() == commandName);

        try
        {
            command.execute(client, interaction);
        } catch (error)
        {
            console.log(error);
            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Big error lol')
                .setDescription('||error at: Trycatch at Slash command execution||')
                .addFields([
                    { name: 'Error:', value: error.toString(), inline: false },
                ]);
            interaction.reply({ embeds: [ embed ] });
        }
    },
};