const Discord = require('discord.js');

module.exports = {
    name: "TFMbuttons",

    /**
     * 
     * @param {boolean} disabled 
     * @param {boolean} disableSkip
     * @returns {Discord.MessageActionRow}
     */
    execute (disabled, disableSkip)
    {
        var skipButton = new Discord.MessageButton()
            .setLabel("Skip ⏭️")
            .setStyle('SECONDARY')
            .setCustomId("Mskip-button")
            .setDisabled(disableSkip);
        var loopButton = new Discord.MessageButton()
            .setLabel("Loop 🔁")
            .setStyle('SECONDARY')
            .setCustomId("Mloop-button")
            .setDisabled(disabled);
        var queueButton = new Discord.MessageButton()
            .setLabel("Queue 🔜")
            .setStyle('SECONDARY')
            .setCustomId("Mqueue-button")
            .setDisabled(disableSkip);
        var pauseButton = new Discord.MessageButton()
            .setLabel("Pause ⏸️")
            .setStyle("PRIMARY")
            .setCustomId("Mpause-button")
            .setDisabled(disabled);
        var stopButton = new Discord.MessageButton()
            .setLabel("Stop ⏹️")
            .setStyle("DANGER")
            .setCustomId("Mstop-button")
            .setDisabled(disabled);
        var favouriteButton = new Discord.MessageButton()
            .setLabel("Favourite ⭐")
            .setStyle("SUCCESS")
            .setCustomId("Mfavourite-button")
        var captionButton = new Discord.MessageButton()
            .setLabel("Captions 💬")
            .setStyle("PRIMARY")
            .setCustomId("Mcaptions-button")
        var row = new Discord.MessageActionRow()
            .addComponents([skipButton, loopButton, pauseButton]);
        var row2 = new Discord.MessageActionRow()
            .addComponents([queueButton, captionButton, stopButton])
        var row3 = new Discord.MessageActionRow()
            .addComponents([favouriteButton])
        return [row, row2, row3]
    },
};
