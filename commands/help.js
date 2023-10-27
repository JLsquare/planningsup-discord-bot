const { SlashCommandBuilder } = require('discord.js');
const signale = require('signale');
const PlanningSupEmbedBuilder = require('../utils/embed');
require('dotenv').config();

const commandData = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Affiche la liste des commandes.');

async function execute(interaction) {
    const embed = new PlanningSupEmbedBuilder()
        .setTitle('Aide')
        .setDescription('Liste des commandes disponibles.')
        .addFields([
            { name: '/planning <etablissement> <edt1> <edt2> <edt3> <edt4>', value: 'Affiche le planning de la semaine.', inline: false },
            { name: '/planning <moins de filtres>', value: 'Affiche les plannings disponibles.', inline: false },
            { name: '/ping', value: 'Affiche la latence du bot et de PlanningSup.', inline: false },
            { name: '/info', value: 'Affiche des informations sur le bot.', inline: false },
            { name: '/help', value: 'Affiche la liste des commandes.', inline: false },
        ]);

    await interaction.reply({ embeds: [embed] });

    signale.info(`Help command executed by ${interaction.user.tag}`);
}

module.exports = {
    data: commandData,
    execute
};