const { EmbedBuilder } = require('discord.js');

class PlanningSupEmbedBuilder extends EmbedBuilder {
    constructor() {
        super();
        this.setColor('161616');
        this.setAuthor({
            name: 'PlanningSup',
            iconURL: 'https://i.imgur.com/ZD9gBoj.png',
            url: 'https://planningsup.app'
        });
        this.setFooter({
            text: 'PlanningSup',
            iconURL: 'https://i.imgur.com/ZD9gBoj.png'
        });
        this.setTimestamp(Date.now());
    }
}

module.exports = PlanningSupEmbedBuilder;