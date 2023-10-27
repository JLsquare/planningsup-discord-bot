const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');const axios = require('axios');
const signale = require('signale');
const PlanningSupEmbedBuilder = require('../utils/embed');
require('dotenv').config();

let planning = [];

async function fetchData() {
    try {
        const response = await axios.get(`${process.env.PLANNINGSUP_URL}urls`);
        planning = response.data;
    } catch (error) {
        signale.error("Error fetching data:", error);
    }
}
fetchData();

function getPlanningData(...titles) {
    let currentData = planning;
    for (let title of titles) {
        if (!title) break;
        currentData = currentData.find(data => data.title === title);
        if (!currentData) return [];
        if (title !== titles[titles.length - 1]) currentData = currentData.edts || [];
    }
    return currentData;
}

async function fetchPlanningById(id) {
    try {
        const response = await axios.get(`${process.env.PLANNINGSUP_URL}calendars?p=${id}`);
        return response.data;
    } catch (error) {
        return null;
    }
}

const getWeekRange = (weekOffset = 0) => {
    const now = new Date();
    const currentDay = now.getDay();
    const startDay = (7 * weekOffset) - currentDay;
    const endDay = (7 * weekOffset) + 7 - currentDay;

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + startDay);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + endDay);
    endOfWeek.setHours(0, 0, 0, 0);

    return { start: startOfWeek, end: endOfWeek };
};

const createPlanningEmbed = (planning, titles, weekOffset) => {
    planning.events.sort((a, b) => new Date(a.start) - new Date(b.start));

    const embed = new PlanningSupEmbedBuilder()
        .setTitle(titles.join(' / '))
        .setDescription('Planning de la semaine');
    const fields = createEventFields(planning, weekOffset);
    embed.addFields(fields);

    return embed;
};

const createChoicesEmbed = (titles) => {
    const emojies = '🏭 🏢 🏬 🏣 🏤 🏥 🏦 🏨 🏪 🏫 🏩 💒 🏛 🕌 🕍 🛕 🕋 ⛩'.split(' ');

    const embed = new PlanningSupEmbedBuilder()
        .setTitle('Plannings')
        .setDescription('Liste des planning disponibles');

    const choices = getPlanningData(...titles).map(data => data.title);
    let values = ""
    for (let i = 0; i < choices.length; i++) {
        values += `${emojies[i]}: ${choices[i]}\n`;
    }
    if (values === "") {
        values = "Aucun planning disponible.";
    }
    const fields = [{ name: 'Choix', value: values }];
    embed.addFields(fields);

    return embed;
}

const addChoicesReactionsEmoji = (titles, response) => {
    const emojies = '🏭 🏢 🏬 🏣 🏤 🏥 🏦 🏨 🏪 🏫 🏩 💒 🏛 🕌 🕍 🛕 🕋 ⛩'.split(' ');

    const choices = getPlanningData(...titles).map(data => data.title);
    for (let i = 0; i < choices.length; i++) {
        response.react(emojies[i]);
    }
}

const createEventFields = (planning, weekOffset) => {
    if (!planning.events || planning.events.length === 0) {
        return [{ name: 'Événements', value: 'Aucun événement prévu.' }];
    }

    let fields = [];
    let currentDate = "";
    let eventsForDate = "";
    const colorToEmoji = {
        "#d4fbcc": ":green_square:",
        "#efd6d8": ":red_square:",
        "#bbe0ff": ":blue_square:",
        "#EDDD6E": ":yellow_square:"
    };

    const isTodaySunday = new Date().getDay() === 6;
    const { start, end } = getWeekRange((isTodaySunday ? 1 : 0) + weekOffset);

    const filteredEvents = planning.events.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate >= start && eventDate < end;
    });

    for (let event of filteredEvents) {
        const eventDateObj = new Date(event.start);
        const day = eventDateObj.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase();
        const numericDate = eventDateObj.toLocaleDateString('fr-FR', { day: 'numeric' });

        const eventDate = `${day} ${numericDate}`;

        if (currentDate !== eventDate) {
            if (eventsForDate) {
                fields.push({ name: currentDate, value: eventsForDate });
            }
            currentDate = eventDate;
            eventsForDate = "";
        }

        const emoji = colorToEmoji[event.color] || ":grey_question:";
        const formatFrenchTime = (date) => new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const time = `\`${formatFrenchTime(event.start)}\` \`${formatFrenchTime(event.end)}\``;
        const location = `\`${event.location}\``;
        const name = event.name.length > 40 ? event.name.substring(0, 38) + "..." : event.name;

        eventsForDate += `${emoji} ${time} ${location} ${name}\n`;
    }

    if (eventsForDate) {
        fields.push({ name: currentDate, value: eventsForDate });
    }

    return fields;
};

const processPlanning = async (titles, interaction, first = true) => {
    signale.info(`Planning command executed by ${interaction.user.tag} : ${titles.join(' / ')}`);
    const planningId = getPlanningData(...titles).fullId;
    const planningData = await fetchPlanningById(planningId);

    if (!planningData || !planningData.plannings || planningData.plannings.length === 0) {
        const embed = createChoicesEmbed(titles);
        let response;
        if (first) {
            response = await interaction.reply({ embeds: [embed], fetchReply: true });
        } else {
            response = await interaction.editReply({ embeds: [embed], fetchReply: true });
        }

        addChoicesReactionsEmoji(titles, response);

        const emojiCollector = response.createReactionCollector({ time: 60000 });

        emojiCollector.on('collect', async (reaction, user) => {
            if (user.id === interaction.user.id) {
                const emojies = '🏭 🏢 🏬 🏣 🏤 🏥 🏦 🏨 🏪 🏫 🏩 💒 🏛 🕌 🕍 🛕 🕋 ⛩'.split(' ');
                const choices = getPlanningData(...titles).map(data => data.title);
                for (let i = 0; i < choices.length; i++) {
                    if (reaction.emoji.name === emojies[i]) {
                        let option = 0;
                        for (let j = 0; j < titles.length; j++) {
                            if (!titles[j]) {
                                option = j;
                                break;
                            }
                        }
                        titles[option] = choices[i];
                        emojiCollector.stop();
                        response.reactions.removeAll();
                        await processPlanning(titles, interaction, false);
                        break;
                    }
                }
            }
        });

        emojiCollector.on('end', async collected => {
            response.reactions.removeAll();
        });

        return;
    }

    const planningEmbed = createPlanningEmbed(planningData.plannings[0], titles, 0);

    const previous = new ButtonBuilder()
        .setCustomId('previous')
        .setLabel('<')
        .setStyle(ButtonStyle.Secondary);

    const next = new ButtonBuilder()
        .setCustomId('next')
        .setLabel('>')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder()
        .addComponents(previous, next);

    let response;
    if (first) {
        response = await interaction.reply({ embeds: [planningEmbed], components: [row] });
    } else {
        response = await interaction.editReply({ embeds: [planningEmbed], components: [row] });
    }

    let weekOffset = 0;
    const buttonCollector = response.createMessageComponentCollector({time: 60000});

    buttonCollector.on('collect', async i => {
        if (i.customId === 'previous') {
            weekOffset--;
            const planningEmbed = createPlanningEmbed(planningData.plannings[0], titles, weekOffset);
            await interaction.editReply({embeds: [planningEmbed]});
        } else if (i.customId === 'next') {
            weekOffset++;
            const planningEmbed = createPlanningEmbed(planningData.plannings[0], titles, weekOffset);
            await interaction.editReply({embeds: [planningEmbed]});
        }
        await i.deferUpdate();
    });

    buttonCollector.on('end', async collected => {
        await interaction.editReply({components: []});
    });
}

const commandData = new SlashCommandBuilder()
    .setName('planning')
    .setDescription('Liste des planning')
    .addStringOption(option => option.setName('etablissement').setDescription('Etablissement').setAutocomplete(true))
    .addStringOption(option => option.setName('edt1').setDescription('Formation/Année/Groupe').setAutocomplete(true))
    .addStringOption(option => option.setName('edt2').setDescription('Formation/Année/Groupe').setAutocomplete(true))
    .addStringOption(option => option.setName('edt3').setDescription('Formation/Année/Groupe').setAutocomplete(true))
    .addStringOption(option => option.setName('edt4').setDescription('Formation/Année/Groupe').setAutocomplete(true));

async function execute(interaction) {
    const titles = [
        'etablissement', 'edt1', 'edt2', 'edt3', 'edt4'
    ].map(name => interaction.options.getString(name));

    await processPlanning(titles, interaction);
}

async function autocomplete(interaction) {
    const titles = [
        'etablissement', 'edt1', 'edt2', 'edt3', 'edt4'
    ].map(name => interaction.options.getString(name));

    const choices = getPlanningData(...titles).map(data => data.title);
    const focusedOption = interaction.options.getFocused(true);
    const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));

    await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
}

module.exports = {
    data: commandData,
    execute,
    autocomplete
};
