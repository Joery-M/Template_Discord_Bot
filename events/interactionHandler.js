const Discord = require("discord.js");
var {client} = require("../index").globalInfo

module.exports = {
    event: "interactionCreate",
    /**
     * 
     * @param {Discord.Interaction} interaction 
     * @returns 
     */
    async execute (interaction)
    {
        if (interaction.isButton())
        {
            var curInterFile = require("../interactions/button");
        } else if (interaction.isCommand())
        {
            var curInterFile = require("../interactions/slash");
            curInterFile.execute(client, interaction);
            return;
        } else if (interaction.isSelectMenu())
        {
            var curInterFile = require("../interactions/menu");
        } else if (interaction.isContextMenu())
        {
            var curInterFile = require("../interactions/contextMenu");
        }
        try
        {
            curInterFile.execute(client, interaction);
        } catch (error)
        {
            console.error(error);
            const embed = new Discord.MessageEmbed()
                .setColor('#ff0000')
                .setTitle('Big error lol')
                .setDescription(error.toString());

            if (interaction.reply) {
                interaction.reply({ embeds: [embed] });
            }else{
                interaction.channel.send({ embeds: [embed] });
            }
        }
    },
};