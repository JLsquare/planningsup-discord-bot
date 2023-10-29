const { SlashCommandBuilder } = require('discord.js');
const signale = require('signale');
const PlanningSupEmbedBuilder = require('../utils/embed');
const config = require('../config.json');

function commandData() {
    return new SlashCommandBuilder()
        .setName(config.info.command)
        .setDescription(config.info.commandDescription);
}

async function execute(interaction) {
    let embed = new PlanningSupEmbedBuilder()
        .setTitle(config.info.embedName)
        .setDescription(config.info.embedDescription)

    let fields = [];
    for (const field of config.info.fields) {
        fields.push({ name: field.name, value: field.value, inline: false });
    }
    embed.addFields(fields);

    await interaction.reply({ embeds: [embed] });
    signale.info(`Info command executed by ${interaction.user.tag}`);
}

module.exports = {
    commandData,
    execute
};