const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const signale = require('signale');
const PlanningSupEmbedBuilder = require('../utils/embed');
require('dotenv').config();

const commandData = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Displays bot and PlanningSup latencies.');

async function execute(interaction) {
    const processStart = Date.now();

    const embed = new PlanningSupEmbedBuilder()
        .setTitle('Ping')
        .setDescription('Calculating bot latency...');

    await interaction.reply({ embeds: [embed] });

    const discordLatency = Date.now() - processStart;
    const planningsupStart = Date.now();

    try {
        await axios.get(`${process.env.PLANNINGSUP_URL}urls`);

        const planningsupLatency = Date.now() - planningsupStart;

        const updatedEmbed = new PlanningSupEmbedBuilder()
            .setTitle('Pong')
            .setDescription('Bot latency details:')
            .addFields([
                { name: 'Discord Latency', value: `${discordLatency}ms`, inline: false },
                { name: 'PlanningSup Latency', value: `${planningsupLatency}ms`, inline: false }
            ]);

        signale.info(`Ping command executed by ${interaction.user.tag} : ${discordLatency}ms (Discord) / ${planningsupLatency}ms (PlanningSup)`);
        await interaction.editReply({ embeds: [updatedEmbed] });
    } catch (error) {
        signale.error(error);
        await interaction.followUp('Error occurred while fetching PlanningSup latency.');
    }
}

module.exports = {
    data: commandData,
    execute
};