const axios = require("axios");
const config = require("../config.json");
const signale = require("signale");

let planningUrls = [];

(async () => {
    try {
        const response = await axios.get(`${config.planningSupUrl}urls`);
        planningUrls = response.data;
    } catch (error) {
        signale.error("Error fetching data:", error);
    }
})();

async function fetchPlanningById(id) {
    try {
        const res = await axios.get(`${config.planningSupUrl}calendars?p=${id}`)
        return res.data;
    } catch (error) {
        return null;
    }
}

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

function getWeekRange(weekOffset = 0) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + (7 * weekOffset) - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 * weekOffset) + 7 - now.getDay());
    endOfWeek.setHours(0, 0, 0, 0);

    return { start: startOfWeek, end: endOfWeek };
}

function formatEventDate(date) {
    const eventDateObj = new Date(date);
    const day = eventDateObj.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase();
    const numericDate = eventDateObj.toLocaleDateString('fr-FR', { day: 'numeric' });
    return `${day} ${numericDate}`;
}
function formatEvent(event) {
    const formattedStartTime = new Date(event.start).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const formattedEndTime = new Date(event.end).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const formattedLocation = `\`${event.location}\``;
    const formattedName = event.name.length > 40 ? event.name.substring(0, 38) + "..." : event.name;

    return `\`${formattedStartTime}\` \`${formattedEndTime}\` ${formattedLocation} ${formattedName}`;
}

module.exports = {
    planningUrls,
    fetchPlanningById,
    getPlanningData,
    getWeekRange,
    formatEventDate,
    formatEvent
}