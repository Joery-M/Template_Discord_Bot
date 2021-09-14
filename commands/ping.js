const Discord = require("discord.js")

module.exports = {
    name: "ping",
    aliases: ["uptime"],
    description: "View the ping and uptime of the bot.",
    category: "bot",
    guildOnly: false,
    memberpermissions: "VIEW_CHANNEL",
    adminPermOverride: true,
    cooldown: 0,
    args: [],
    usage: "&pref;ping or &pref;uptime",
    /**
     * @param {Discord.Client} client
     * @param {Discord.Message} msg
     * @param {Array} args 
     * @param {String} curPrefix 
     */
    execute(client, msg, args, curPrefix) {
        var msgTime = msg.createdTimestamp
        var curTime = Date.now()
        console.log(msgTime - curTime)
    },
};