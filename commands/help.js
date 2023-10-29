const { SlashCommandBuilder } = require('discord.js');
const signale = require('signale');
const PlanningSupEmbedBuilder = require('../utils/embed');
const config = require('../config.json');

function commandData() {
    return new SlashCommandBuilder()
        .setName(config.help.command)
        .setDescription(config.help.commandDescription);
}

async function execute(interaction) {
    let embed = new PlanningSupEmbedBuilder()
        .setTitle(config.help.embedName)
        .setDescription(config.help.embedDescription)

    let fields = [];
    for (const field of config.help.fields) {
        fields.push({ name: field.name, value: field.value, inline: false });
    }
    embed.addFields(fields);

    await interaction.reply({ embeds: [embed] });

    signale.info(`Help command executed by ${interaction.user.tag}`);
}

module.exports = {
    commandData,
    execute
};