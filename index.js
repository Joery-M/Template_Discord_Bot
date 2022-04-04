const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const Discord = require('discord.js');
const disVoice = require("@discordjs/voice");
const Vibrant = require("node-vibrant");
var prefixConfig = require("./misc/prefixes.json");
const keys = require('dotenv').config().parsed;
const stringSimilarity = require("string-similarity");
const twig = require("./Twig");
const fs = require('fs');

//to see if prefixconfig has changed
fs.watchFile("./misc/prefixes.json", (curr, prev) =>
{
    prefixConfig = require("./misc/prefixes.json");
});

// Set intents up
var myIntents = new Discord.Intents();
myIntents.add([
    "DIRECT_MESSAGES",
    "DIRECT_MESSAGE_TYPING",
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_MEMBERS",
    "GUILD_PRESENCES",
    "GUILD_VOICE_STATES",
    "GUILD_MESSAGE_REACTIONS",
    "DIRECT_MESSAGE_REACTIONS"
]);
const client = new Discord.Client({
    intents: myIntents,
    partials: ["CHANNEL", "REACTION"]
});
client.commands = new Discord.Collection();

// Take commands
const allCommands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles)
{
    const command = require(`./commands/` + file);
    client.commands.set(command.name, command);
    allCommands.push(command.name);
    command.aliases.forEach(elem =>
    {
        allCommands.push(elem);
    });
}

// Cooldowns
const cooldowns = new Discord.Collection();

// On Ready
client.on("ready", async () =>
{
    console.log('Logged in as ' + client.user.username + "#" + client.user.discriminator + '!');
    client.user.setActivity("github.", {
        type: "WATCHING",
        url: "https://github.com/GamingBig"
    });

    // Registering the slash commands
    const commandFiles = fs.readdirSync('./interactions/slash/').filter(file => file.endsWith('.js'));
    var slashCommandMap = new Discord.Collection();
    for (const file of commandFiles)
    {
        const command = require('./interactions/slash/' + file);
        slashCommandMap.set(command.name, command);
    }

    // Registering the Context menu commands
    const contextcommandFiles = fs.readdirSync('./interactions/contextMenu/').filter(file => file.endsWith('.js'));
    var contextCommandMap = new Discord.Collection();
    for (const file of contextcommandFiles)
    {
        const command = require('./interactions/contextMenu/' + file);
        contextCommandMap.set(command.name, command);
    }

    // slashCommands are the commands of the bot, it creates the commands when it runs
    // The testing is seperate, since changing commands specifically of a guild, is faster than changing commands for every server.
    var commands;
    if (keys.TESTING_GUILD)
    {
        //* Testing guild commands
        var guildId = keys.TESTING_GUILD;
        var guild = client.guilds.cache.get(guildId);
        commands = guild.commands;
    } else
    {
        //* Global commands (slow update time)
        commands = client.application.commands;
    }
    // Loop over all commands
    slashCommandMap.forEach(value =>
    {
        commands.create({
            name: value.name,
            description: value.description,
            options: value.options
        });
    });

    contextCommandMap.forEach(async value =>
    {
        commands.create({
            name: value.name,
            type: value.type
        })
    });
    
    // Remove unused commands
    var uncachedCommands = await commands.fetch()
    uncachedCommands.forEach((command) => {
        var hasCurrentContextCommand = contextCommandMap.has(command.name)
        var hasCurrentSlashCommand = slashCommandMap.has(command.name)

        if (!hasCurrentContextCommand && !hasCurrentSlashCommand) {
            commands.delete(command)
            console.log(`Deleted command: ${command.name}, since it wasn't used.`);
        }
    })

    module.exports = {
        globalInfo: {
            client: client,
            prefixConfig: prefixConfig,
            allCommands: allCommands,
            cooldowns: cooldowns
        }
    };

    const events = fs.readdirSync("./events").filter(file => file.endsWith('.js'));
    events.forEach((file) =>
    {
        var command = require("./events/" + file);
        client.on(command.event, command.execute);
    });
});


client.login( keys.TEST_DISCORD_TOKEN ?? keys.DISCORD_TOKEN);

process.on('uncaughtException', (error, origin)=>{
    disVoice.getVoiceConnections().forEach((connection, key, map) =>
    {
        connection.disconnect()
    });

    console.error(error)
    process.exit(1)
})