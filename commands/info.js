const { SlashCommandBuilder } = require('discord.js');
const signale = require('signale');
const PlanningSupEmbedBuilder = require('../utils/embed');
require('dotenv').config();

const commandData = new SlashCommandBuilder()
    .setName('info')
    .setDescription('Affiche des informations sur le bot.');

async function execute(interaction) {
    const embed = new PlanningSupEmbedBuilder()
        .setTitle('Information')
        .setDescription('Ce bot a été créé par [JL](https://github.com/JLsquare), et utilise [PlanningSup](https://planningsup.app) créé par [Kernoeb](https://github.com/kernoeb).')
        .addFields([
            { name: 'Github du bot', value: 'Soon', inline: false },
            { name: 'Github de PlanningSup', value: 'https://github.com/kernoeb/planningsup', inline: false },
            { name: 'Soutenez PlanningSup!', value: 'https://www.paypal.com/paypalme/kernoeb', inline: false },
        ]);

    await interaction.reply({ embeds: [embed] });

    signale.info(`Info command executed by ${interaction.user.tag}`);
}

module.exports = {
    data: commandData,
    execute
};