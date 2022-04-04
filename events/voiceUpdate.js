const Discord = require("discord.js")
const disVoice = require("@discordjs/voice");
const {client} = require("../index").globalInfo

module.exports = {
    event: "voiceStateUpdate",
    /**
     * 
     * @param {Discord.VoiceState} oldState 
     * @param {Discord.VoiceState} newState 
     * @returns 
     */
    async execute(oldState, newState)
    {
        if (!oldState.guild.me.voice || !oldState.guild.me.voice.channel)
        {
            return
        }
        var guild = client.guilds.cache.get(newState.guild.id)
        var channel = guild.channels.cache.get(oldState.channelId)
        // check if user was in same channel as bot
        if (!oldState.channel || oldState.channelId !== oldState.guild.me.voice.channelId)
        {
            return
        }
        var memberArray = channel.members
        var realMemberArray = []
        memberArray.map(user => user.user.bot).forEach(element => {
            if (element == false)
            {
                realMemberArray.push(element.user)
            }
        })
        if (realMemberArray.length == 0)
        {
            try
            {
                disVoice.getVoiceConnection(guild.id).destroy()
            } catch (error)
            {}
        }
    }
};
