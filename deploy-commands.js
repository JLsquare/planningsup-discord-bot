const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
const signale = require('signale');
const config = require('./config.json');

signale.config({
    displayFilename: true,
    displayTimestamp: true,
    displayDate: true,
});

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(foldersPath, file);
    const command = require(filePath);
    if ('commandData' in command && 'execute' in command) {
        commands.push(command.commandData().toJSON());
    } else {
        signale.warn(`[WARNING] The command at ${filePath} is missing a required "commandData" or "execute" property.`);
    }
}

const rest = new REST().setToken(config.discordToken);

(async () => {
    try {
        signale.info(`Started refreshing ${commands.length} application (/) commands.`);

        await rest.put(Routes.applicationCommands(config.discordClientId), { body: [] })

        const data = await rest.put(
            Routes.applicationCommands(config.discordClientId),
            { body: commands },
        );

        signale.success(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        signale.error(error);
    }
})();
