const Discord = require('discord.js');
const config = require('./config.json');
const prefixConfig = require("./prefixes.json")
const keys = require('dotenv').config().parsed
const stringSimilarity = require("string-similarity")
const fs = require('fs');

const Intents = Discord.Intents.FLAGS
var myIntents = new Discord.Intents()
myIntents.add([Intents.GUILDS, Intents.GUILD_MESSAGES, Intents.GUILD_MEMBERS])
const client = new Discord.Client({ intents: myIntents });
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

// On Message
client.on('messageCreate', msg => {
    // Define prefix
    if (!prefixConfig[msg.guildId]) {
        prefixConfig[msg.guildId] = "!"
        fs.writeFileSync("./prefixes.json", JSON.stringify(prefixConfig))
        var curPrefix = "!"
    } else {
        var curPrefix = prefixConfig[msg.guildId]
    }
    if (!msg.content.startsWith(curPrefix) || msg.author.bot) return;

    const args = msg.content.slice(curPrefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // If command exist
    if (!command) {
        var closestString = stringSimilarity.findBestMatch(commandName, allCommands).bestMatch
        if (closestString.rating == 0) return
        msg.channel.send("Did you mean: ``" + closestString.target.charAt(0).toUpperCase() + closestString.target.slice(1) + "``?")
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
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(msg.author.id)) {
        const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

        if (now < expirationTime) {
            // If user is in cooldown
            const timeLeft = (expirationTime - now) / 1000;
            return msg.reply("please wait " + timeLeft.toFixed(1) + " more second(s) before reusing the ``" + command.name + "`` command.");
        }
    } else {
        timestamps.set(msg.author.id, now);
        setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
        // Execute command
        try {
            command.execute(client, msg, args, curPrefix);
        } catch (error) {
            console.error(error);
            msg.reply('there was an error trying to execute that command!');
        }
    }
});

client.login(keys.DISCORD_TOKEN);