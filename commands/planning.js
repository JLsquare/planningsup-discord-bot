const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const signale = require('signale');
const config = require('../config.json');
const PlanningSupEmbedBuilder = require('../utils/embed');
const database = require('../utils/database');
const { getPlanningData, fetchPlanningById, getWeekRange, formatEvent, formatEventDate } = require('../utils/planning');

function createPlanningEmbed(planning, titles, weekOffset) {
    planning.events.sort((a, b) => new Date(a.start) - new Date(b.start));

    return new PlanningSupEmbedBuilder()
        .setTitle(titles.join(' / '))
        .setDescription(config.planning.planningEmbedDescription)
        .addFields(createEventFields(planning, weekOffset));
}

function createChoicesEmbed(titles) {
    const choices = getPlanningData(...titles).map(data => data.title);
    const values = choices.map((choice, index) => `${config.planning.choiceEmojis[index]}: ${choice}`).join('\n') || config.planning.noChoiceEmbedFieldValue;
    return new PlanningSupEmbedBuilder()
        .setTitle(config.planning.choiceEmbedName)
        .setDescription(config.planning.choiceEmbedDescription)
        .addFields([{
            name: config.planning.choiceEmbedFieldName,
            value: values
        }]);
}

async function addChoicesReactionsEmoji(titles, response) {
    const choices = getPlanningData(...titles).map(data => data.title);
    for (let i = 0; i < choices.length; i++) {
        await response.react(config.planning.choiceEmojis[i]);
    }
}

function createEventFields(planning, weekOffset) {
    if (!planning.events || planning.events.length === 0) {
        return [{
            name: config.planning.noEventEmendFieldName,
            value: config.planning.noEventEmbedFieldValue
        }];
    }

    const { start, end } = getWeekRange(new Date().getDay() === 6 ? 1 : 0 + weekOffset);
    const filteredEvents = planning.events.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate >= start && eventDate < end;
    });

    let fields = [];
    let currentDate = "";
    let eventsForDate = "";

    for (let event of filteredEvents) {
        const eventDate = formatEventDate(event.start);

        if (currentDate !== eventDate) {
            if (eventsForDate) {
                fields.push({ name: currentDate, value: eventsForDate });
            }
            currentDate = eventDate;
            eventsForDate = "";
        }

        const emoji = config.planning.colorEmojis[event.color.toLowerCase()] || config.planning.defaultColorEmoji;
        eventsForDate += `${emoji} ${formatEvent(event)}\n`;
    }

    if (eventsForDate) {
        fields.push({ name: currentDate, value: eventsForDate });
    }

    return fields;
}

async function handleEmojiReaction(interaction, response, titles, emojiCollector, reaction) {
    const choices = getPlanningData(...titles).map(data => data.title);
    const emojiIndex = config.planning.choiceEmojis.indexOf(reaction.emoji.name);
    if (emojiIndex !== -1 && emojiIndex < choices.length) {
        const option = titles.findIndex(title => !title) || 0;
        titles[option] = choices[emojiIndex];
        emojiCollector.stop();
        await response.reactions.removeAll();
        await processPlanning(titles, interaction, false);
    }
}

async function handleButtonInteraction(interaction, i, planningData, titles, weekOffset) {
    const change = i.customId === 'previous' ? -1 : 1;
    weekOffset += change;
    const planningEmbed = createPlanningEmbed(planningData.plannings[0], titles, weekOffset);
    await interaction.editReply({embeds: [planningEmbed]});
    await i.deferUpdate();
    return weekOffset;
}

async function processPlanning(titles, interaction, first = true, weekOffset = 0) {
    for (let i = 0; i < titles.length; i++) {
        if (titles[i] === config.planning.allChoice) {
            titles[i] = null;
        }
    }

    signale.info(`Planning command executed by ${interaction.user.tag} : ${titles.join(' / ')}`);

    const planningId = getPlanningData(...titles).fullId;
    const planningData = await fetchPlanningById(planningId);

    if (!planningData || !planningData.plannings || planningData.plannings.length === 0) {
        const embed = createChoicesEmbed(titles);
        const response = first ?
            await interaction.reply({ embeds: [embed], fetchReply: true }) :
            await interaction.editReply({ embeds: [embed], fetchReply: true });

        await addChoicesReactionsEmoji(titles, response);

        const emojiCollector = response.createReactionCollector({ time: config.planning.collectorTime });
        emojiCollector.on('collect', async (reaction, user) => {
            if (user.id === interaction.user.id) {
                await handleEmojiReaction(interaction, response, titles, emojiCollector, reaction);
            }
        });
        emojiCollector.on('end', async () => {
            await response.reactions.removeAll()
        });
        return;
    }

    const planningEmbed = createPlanningEmbed(planningData.plannings[0], titles, 0);
    const previous = new ButtonBuilder().setCustomId('previous').setLabel('<').setStyle(ButtonStyle.Secondary);
    const next = new ButtonBuilder().setCustomId('next').setLabel('>').setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder().addComponents(previous, next);

    const response = first ?
        await interaction.reply({ embeds: [planningEmbed], components: [row] }) :
        await interaction.editReply({ embeds: [planningEmbed], components: [row] });

    const buttonCollector = response.createMessageComponentCollector({time: config.planning.collectorTime });
    buttonCollector.on('collect', async i => {
        weekOffset = await handleButtonInteraction(interaction, i, planningData, titles, weekOffset);
    });
    buttonCollector.on('end', async () => {
        await interaction.editReply({components: []});
    });
}

function commandData() {
    let command = new SlashCommandBuilder()
        .setName(config.planning.command)
        .setDescription(config.planning.commandDescription)

    for (const commandOption of config.planning.commandOptions) {
        command.addStringOption(option =>
            option.setName(commandOption.name)
                .setDescription(commandOption.description)
                .setAutocomplete(true));
    }

    return command;
}

async function execute(interaction) {
    let titles = config.planning.commandOptions.map(option => interaction.options.getString(option.name));

    if (titles.every(title => !title)) {
        const user = await database.getUser(interaction.user.id);
        if (user) {
            titles = user.planning_id.split('.');
        }
    }

    await processPlanning(titles, interaction);
}

async function autocomplete(interaction) {
    const titles = config.planning.commandOptions.map(option => interaction.options.getString(option.name));

    let choices = [config.planning.allChoice];
    choices.push(...getPlanningData(...titles).map(data => data.title));
    const focusedOption = interaction.options.getFocused(true);
    const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));

    await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
}

module.exports = {
    commandData,
    execute,
    autocomplete
};
