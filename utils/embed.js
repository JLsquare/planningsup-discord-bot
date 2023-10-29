const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

class PlanningSupEmbedBuilder extends EmbedBuilder {
    constructor() {
        super();
        this.setColor(config.embedInfo.color);
        this.setAuthor({
            name: config.embedInfo.name,
            iconURL: config.embedInfo.iconUrl,
            url: config.embedInfo.url
        });
        this.setFooter({
            text: config.embedInfo.name,
            iconURL: config.embedInfo.iconUrl
        });
        this.setTimestamp(Date.now());
    }
}

module.exports = PlanningSupEmbedBuilder;