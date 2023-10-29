const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const signale = require('signale');
const config = require('./config.json');

signale.config({
    displayFilename: true,
    displayTimestamp: true,
    displayDate: true,
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
    ]
});
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('commandData' in command && 'execute' in command) {
        client.commands.set(command.commandData().name, command);
    } else {
        signale.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

client.on(Events.InteractionCreate, async interaction => {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        return;
    }

    try {
        if (interaction.isAutocomplete() && command.autocomplete) {
            await command.autocomplete(interaction);
        } else if (interaction.isCommand() && command.execute) {
            await command.execute(interaction);
        }
    } catch (error) {
        signale.error(error);
        try {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    ephemeral: true
                });
            } else if (interaction.replied) {
                await interaction.followUp({
                    content: 'An additional error occurred while processing!',
                    ephemeral: true
                });
            }
        } catch (followUpError) {
            signale.error('Failed to send error message:', followUpError);
        }
    }
});

client.once(Events.ClientReady, c => {
    signale.success(`Ready! Logged in as ${c.user.tag}`);
});

client.login(config.discordToken);
