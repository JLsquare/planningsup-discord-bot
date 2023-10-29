const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const signale = require('signale');
const PlanningSupEmbedBuilder = require('../utils/embed');
const config = require('../config.json');

function commandData() {
    return new SlashCommandBuilder()
        .setName(config.ping.command)
        .setDescription(config.ping.commandDescription);
}

async function execute(interaction) {
    const processStart = Date.now();

    const embed = new PlanningSupEmbedBuilder()
        .setTitle(config.ping.pingEmbedName)
        .setDescription(config.ping.pingEmbedDescription);

    await interaction.reply({ embeds: [embed] });

    const discordLatency = Date.now() - processStart;
    const planningsupStart = Date.now();

    try {
        await axios.get(`${config.planningSupUrl}urls`);

        const planningsupLatency = Date.now() - planningsupStart;

        const updatedEmbed = new PlanningSupEmbedBuilder()
            .setTitle(config.ping.pongEmbedName)
            .setDescription(config.ping.pongEmbedDescription)
            .addFields([
                { name: config.ping.discordFieldName, value: `${discordLatency}ms`, inline: false },
                { name: config.ping.planningSupFieldName, value: `${planningsupLatency}ms`, inline: false }
            ]);

        signale.info(`Ping command executed by ${interaction.user.tag} : ${discordLatency}ms (Discord) / ${planningsupLatency}ms (PlanningSup)`);
        await interaction.editReply({ embeds: [updatedEmbed] });
    } catch (error) {
        signale.error(error);
        await interaction.followUp(config.ping.errorMessage);
    }
}

module.exports = {
    commandData,
    execute
};