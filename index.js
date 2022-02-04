const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const Discord = require('discord.js');
const disVoice = require("@discordjs/voice");
const Vibrant = require("node-vibrant")
var prefixConfig = require("./misc/prefixes.json")
const keys = require('dotenv').config().parsed
const stringSimilarity = require("string-similarity")
const fs = require('fs');

//to see if prefixconfig has changed
fs.watchFile("./misc/prefixes.json", (curr, prev) => {
    prefixConfig = require("./misc/prefixes.json")
})

// Set intents up
var myIntents = new Discord.Intents()
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
    partials: [ "CHANNEL", "REACTION" ]
});
client.commands = new Discord.Collection();

// Take commands
const allCommands = []
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/` + file);
    client.commands.set(command.name, command);
    allCommands.push(command.name)
    command.aliases.forEach(elem => {
        allCommands.push(elem)
    });
}

// Cooldowns
const cooldowns = new Discord.Collection();

// On Ready
client.once('ready', () => {
    console.log('Logged in as ' + client.user.username + "#" + client.user.discriminator + '!');
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    if (!oldState.guild.me.voice || !oldState.guild.me.voice.channel) { return }
    var guild = client.guilds.cache.get(newState.guild.id)
    var channel = guild.channels.cache.get(oldState.channelId)
    // check if user was in same channel as bot
    if (oldState.channelId !== oldState.guild.me.voice.channelId) { return }
    if (!oldState.channel) { return }
    if (oldState.channel.members.size > channel.members.size) {}
    var memberArray = channel.members
    var realMemberArray = []
    memberArray.map(user => user.user.bot).forEach(element => {
        if (element == false) {
            realMemberArray.push(element.user)
        }
    })
    if (realMemberArray.length == 0) {
        try {
            disVoice.getVoiceConnection(guild.id).destroy()
        } catch (error) {
        }
    }
});


// On Message
client.on('messageCreate', async msg => {
    // Define prefix
    if (msg.channel.type === "DM") {
        curPrefix = ""
    }else{
        if (!prefixConfig[msg.guildId]) {
            prefixConfig[msg.guildId] = "!"
            fs.writeFileSync("./misc/prefixes.json", JSON.stringify(prefixConfig))
            var curPrefix = "!"
        } else {
            var curPrefix = prefixConfig[msg.guildId]
        }
    }
    // See if the message mentions the bot.
    var regex = new RegExp("<@(!)?"+client.user.id+">")
    if (regex.test(msg.content) && msg.member.id !== client.user.id)
    {
        var tempArgs = msg.content.split(" ")
        // Remove mention
        tempArgs.shift()
        if (tempArgs[1] && tempArgs[1].includes("<@") && tempArgs[0] == "prefix")
        {
            tempArgs.shift()
            var prefix = tempArgs.join(" ");
            prefixConfig[ msg.guildId ] = prefix;
            fs.writeFileSync("./misc/prefixes.json", JSON.stringify(prefixConfig));
            return msg.channel.send("Prefix is now: `" + prefix + "`\n\nThis will take effect in about 1-3 seconds.");
        }

        // Get color
        var color = (await Vibrant.from(client.user.avatarURL({size: 32, format: 'jpg'})).getPalette()).Vibrant.hex
        var userImg = client.user.avatarURL({size: 128, format: 'jpg'})

        // Non prefix changing msg
        let embed = new Discord.MessageEmbed()
            .setColor(color)
            .setTitle('Bot Info')
            .setThumbnail(userImg)
            .setDescription("Hello. I'm a bot made for the **Koning Willem 1 College**, ICT Academy.\n\nMy main purpose has not been decided yet, but it will come.")
            .addFields([
                { name: 'Current Prefix', value: `\`${curPrefix}\``, inline: false },
            ])
            .setFooter({text: "You can only change the prefix if you have the permissions to do so.\n"+
            "You can do so with `"+ curPrefix +"prefix (New Prefix)` or `@"+client.user.username+" (New Prefix)`."})

        msg.channel.send({ embeds: [ embed ] });
    }

    if (!msg.content.startsWith(curPrefix) || msg.author.bot) return;
    const args = msg.content.slice(curPrefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // If command exist
    if (!command) {
        var closestString = stringSimilarity.findBestMatch(commandName, allCommands).bestMatch
        var customId = "D-" + closestString.target + ";" + msg.id
        if (closestString.rating == 0 || customId.length >= 100){
            return msg.channel.send({
                content: "I didn't recognise that command, Please use `" + curPrefix + "help` if you don't know what you're looking for.",
                components: [twig.Discord.dismissButton]
            })
        }
        var didYouMeanButton = new Discord.MessageButton()
            .setCustomId(customId)
            .setLabel("Yes")
            .setStyle("SUCCESS")
        var didYouMeanRow = new Discord.MessageActionRow()
            .addComponents([didYouMeanButton])
        msg.channel.send({ content: "Did you mean: ``" + closestString.target.charAt(0).toUpperCase() + closestString.target.slice(1) + "``?", components: [didYouMeanRow] })
        return
    };

    // Check if command can be executed in DM
    if (command.guildOnly && msg.channel.type !== 'GUILD_TEXT') {
        return msg.reply('I can\'t execute that command inside DMs!');
    }

    // Check if args are required
    if (command.args && command.args.length > 0 && !args.length) {
        let reply = `You didn't provide any arguments.`;

        if (command.usage) {
            reply += "\nThe proper usage would be: ``" + command.usage.replace("&pref;", curPrefix) + "``.";
        }

        return msg.channel.send(reply);
    }

    // Check if user is in cooldown
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 1.5) * 1000;

    if (timestamps.has(msg.author.id)) {
        const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

        if (now < expirationTime) {
            // If user is in cooldown
            const timeLeft = (expirationTime - now) / 1000;
            var s = timeLeft > 1 ? "" : "s";
            const embed = new Discord.MessageEmbed()
                .setColor('#ff0000')
                .setTitle('⏳ Hold your horses!')
                .setDescription(`Please wait ${timeLeft} more second${s} before reusing the \`${command.name}\` command.`);
            return msg.channel.send({ embeds: [ embed ] });
        }
    } else {
        timestamps.set(msg.author.id, now);
        setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
        // Execute command
        try {
            command.execute(client, msg, args, curPrefix);
        } catch (error) {
            console.error(error);
            const embed = new Discord.MessageEmbed()
                .setColor('#ff0000')
                .setThumbnail(client.attachments.get("Broken_disc"))
                .setTitle('Big error lol')
                .setDescription(error.toString());

            msg.channel.send({ embeds: [ embed ] });
        }
    }
});

// On Interaction (Buttons, Menus, slash commands)
client.on('interactionCreate', async (interaction) =>
{
    if (interaction.isButton())
    {
        var curInterFile = require("./interactions/button.js");
    } else if (interaction.isCommand())
    {
        var curInterFile = require("./interactions/slash.js");
        curInterFile.execute(client, interaction);
        return;
    } else if (interaction.isSelectMenu())
    {
        var curInterFile = require("./interactions/menu.js");
    }
    try
    {
        curInterFile.execute(client, interaction, interaction.message.components);
    } catch (error)
    {
        console.error(error);
        const embed = new Discord.MessageEmbed()
            .setColor('#ff0000')
            .setThumbnail(client.attachments.get("Broken_disc"))
            .setTitle('Big error lol')
            .setDescription(error.toString());
            
        interaction.channel.send({ embeds: [ embed ] });
    }
});

if (keys.TEST_DISCORD_TOKEN) {
    client.login(keys.TEST_DISCORD_TOKEN);
}else{
    client.login(keys.DISCORD_TOKEN);
}


client.on("error", (err) => {
    console.log(err);
    disVoice.getVoiceConnections().forEach((connection, key, map) =>{
        connection.destroy()
    })
})
