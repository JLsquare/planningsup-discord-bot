const { SlashCommandBuilder } = require('discord.js');
const signale = require('signale');
const PlanningSupEmbedBuilder = require('../utils/embed');
const database = require('../utils/database');
const config = require('../config.json');
const axios = require("axios");

let planningUrls = [];

(async () => {
    try {
        const response = await axios.get(`${config.planningSupUrl}urls`);
        planningUrls = response.data;
    } catch (error) {
        signale.error("Error fetching data:", error);
    }
})();

function getPlanningData(...titles) {
    let currentData = planningUrls;
    for (let index = 0; index < titles.length; index++) {
        const title = titles[index];

        if (!title) break;
        currentData = currentData.find(data => data.title === title);

        if (!currentData) return [];

        if (index !== titles.length - 1) {
            currentData = currentData.edts || [];
        }
    }
    return currentData;
}

function commandData() {
    let command = new SlashCommandBuilder()
        .setName(config.savePlanning.command)
        .setDescription(config.savePlanning.commandDescription);

    for (const commandOption of config.planning.commandOptions) {
        command.addStringOption(option =>
            option.setName(commandOption.name)
                .setDescription(commandOption.description)
                .setAutocomplete(true)
                .setRequired(true)
        );
    }

    return command;
}

async function execute(interaction) {
    const titles = config.planning.commandOptions.map(option => interaction.options.getString(option.name));
    const planningId = getPlanningData(...titles).fullId;

    if(!planningId) {
        const embed = new PlanningSupEmbedBuilder()
            .setTitle(config.savePlanning.errorEmbedName)
            .setDescription(config.savePlanning.errorEmbedDescription)

        await interaction.reply({ embeds: [embed] });
        return;
    }

    database.insertOrUpdateUser(interaction.user.id, titles.join('.'), planningId);

    let embed = new PlanningSupEmbedBuilder()
        .setTitle(titles.join(' / '))
        .setDescription(config.savePlanning.embedDescription)

    await interaction.reply({ embeds: [embed] });

    signale.info(`SavePlanning command executed by ${interaction.user.tag} : ${titles.join(' / ')}`);
}

async function autocomplete(interaction) {
    const titles = config.planning.commandOptions.map(option => interaction.options.getString(option.name));

    const choices = getPlanningData(...titles).map(data => data.title)
    const focusedOption = interaction.options.getFocused(true);
    const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));

    await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
}

module.exports = {
    commandData,
    execute,
    autocomplete
};