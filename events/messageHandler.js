const Discord = require("discord.js")
var {client, cooldowns, prefixConfig, allCommands} = require("../index").globalInfo
const Vibrant = require("node-vibrant");
const stringSimilarity = require("string-similarity");
const twig = require("../Twig");
const fs = require('fs');


module.exports = {
    event: "messageCreate",
    async execute(msg)
    {
        // Define prefix
        if (msg.channel.type === "DM")
        {
            curPrefix = "!";
        } else
        {
            if (!prefixConfig[msg.guildId])
            {
                prefixConfig[msg.guildId] = "!";
                fs.writeFileSync("./misc/prefixes.json", JSON.stringify(prefixConfig));
                var curPrefix = "!";
            } else
            {
                var curPrefix = prefixConfig[msg.guildId];
            }
        }
        // See if the message mentions the bot.
        if (msg.content.includes("<@"+client.user.id+">") && msg.member.id !== client.user.id)
        {
            // Get color
            var color = (await Vibrant.from(client.user.avatarURL({ size: 32, format: 'jpg' })).getPalette()).Vibrant.hex;
            var userImg = client.user.avatarURL({ size: 128, format: 'jpg' });
    
            let embed = new Discord.MessageEmbed()
                .setColor(color)
                .setTitle('Bot Info')
                .setThumbnail(userImg)
                .setDescription("Hello. I'm a bot...")
                .addFields([
                    { name: 'Current Prefix', value: `\`${curPrefix}\``, inline: false },
                ])
    
            msg.channel.send({ embeds: [embed] });
        }
    
        if (!msg.content.startsWith(curPrefix) || msg.author.bot) return;
        const args = msg.content.slice(curPrefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();
    
        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
        // If command exist
        if (!command)
        {
            var closestString = stringSimilarity.findBestMatch(commandName, allCommands).bestMatch;
            var customId = "D-" + closestString.target + ";" + msg.id;
            if (closestString.rating == 0 || customId.length >= 100)
            {
                return msg.channel.send({
                    content: "I didn't recognise that command, Please use `" + curPrefix + "help` if you don't know what you're looking for.",
                    components: [twig.Discord.dismissButton]
                });
            }
            var didYouMeanButton = new Discord.MessageButton()
                .setCustomId(customId)
                .setLabel("Yes")
                .setStyle("SUCCESS");
            var didYouMeanRow = new Discord.MessageActionRow()
                .addComponents([didYouMeanButton]);
            msg.channel.send({ content: "Did you mean: ``" + closestString.target.charAt(0).toUpperCase() + closestString.target.slice(1) + "``?", components: [didYouMeanRow] });
            return;
        };
    
        // Check if command can be executed in DM
        if (command.guildOnly && msg.channel.type !== 'GUILD_TEXT')
        {
            return msg.reply('I can\'t execute that command inside DMs!');
        }
    
        // Check if args are required
        if (command.args && command.args.length > 0 && !args.length)
        {
            let reply = `You didn't provide any arguments.`;
    
            if (command.usage)
            {
                reply += "\nThe proper usage would be: ``" + command.usage.replace("&pref;", curPrefix) + "``.";
            }
    
            return msg.channel.send(reply);
        }
    
        // Check if user is in cooldown
        if (!cooldowns.has(command.name))
        {
            cooldowns.set(command.name, new Discord.Collection());
        }
    
        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 1.5) * 1000;
    
        if (timestamps.has(msg.author.id))
        {
            const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;
    
            if (now < expirationTime)
            {
                // If user is in cooldown
                const timeLeft = Math.ceil((expirationTime - now) / 100)/10
                var s = (timeLeft > 1) ? "" : "s";
                const embed = new Discord.MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle('⏳ Hold your horses!')
                    .setDescription(`Please wait ${timeLeft} more second${s} before reusing the \`${command.name}\` command.`);
                return msg.channel.send({ embeds: [embed] });
            }
        } else
        {
            timestamps.set(msg.author.id, now);
            setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
            // Execute command
            try
            {
                command.execute(client, msg, args, curPrefix);
            } catch (error)
            {
                console.error(error);
                const embed = new Discord.MessageEmbed()
                    .setColor('#ff0000')
                    .setTitle('Big error lol')
                    .setDescription(error.toString());
    
                msg.channel.send({ embeds: [embed] });
            }
        }
    },
};