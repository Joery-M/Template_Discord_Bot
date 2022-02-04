const Discord = require("discord.js");
const twig = require("../../Twig");
const fs = require('fs');

module.exports = {
    name: "volume",
    description: "Change the volume of the sound your hearing.",
    options: [ {
        "type": 10,
        "name": "volume",
        "description": "The volume you want the sound to be. 1 is 100%",
        "required": true
    } ],
    /**
     * @param {Discord.Client} client
     * @param {Discord.CommandInteraction} interaction 
     * @param {Array} components
     * @param {String} curId
     */
    execute (client, interaction)
    {
        //! duplicate of commands/volume.js, but this one is made for interactions.
        var serverQueue = client.queue.get(interaction.guildId);
        if (!serverQueue || !serverQueue.player)
        {
            const embed = new Discord.MessageEmbed()
                .setColor('#ff0000')
                .setTitle('Can\'t change the volume of nothing.')
                .setThumbnail(client.attachments.get("Broken_disc"))
                .setDescription("Start playing a song with `/play (YouTube video)`.");

            return interaction.reply({ embeds: [ embed ], ephemeral: true });
        }

        var volume = parseFloat(interaction.options.getNumber("volume"));
        var displayVolume = Math.round(volume * 100);

        // Confirm loud volume
        if (volume >= 3)
        {
            var embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Did you mean that?')
                .setDescription('Are you sure you want to set the volume to ' + displayVolume + "%?")
                .setFooter({text: "Ran by: " + interaction.member.displayName})

            var button = new Discord.MessageButton()
                .setLabel("🔊 Yes 🔊")
                .setStyle("DANGER")
                .setCustomId("vConfirm-" + volume);
            var row = twig.Discord.dismissButton;
            var dismissButton = row.components.shift();
            row.addComponents([ button, dismissButton ]);
            interaction.reply({ embeds: [ embed ], components: [ row ]});
            return;
        }
        serverQueue.volume = volume;
        serverQueue.resource.volume.setVolume(volume);
        // I have to wait 1 second for discord to actually change volume
        interaction.deferReply();

        setTimeout(() =>
        {
            var embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('🔊 Set volume')
                .setDescription('Volume is now set to ' + displayVolume + "%")
                .setFooter({text: "Ran by: " + interaction.member.displayName});
            interaction.editReply({ embeds: [ embed ], components: [ twig.Discord.dismissButton ] });

            // Change controls to say who changed volume
            var embed = serverQueue.playingMsg.embeds[ 0 ];
            embed.setFooter({text: "Latest action: " + interaction.member.displayName + " changed the volume to " + displayVolume + "%"});
            serverQueue.playingMsg.edit({ embeds: [ embed ] });
        }, 1000);

    }
};