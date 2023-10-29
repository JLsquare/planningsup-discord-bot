const config = require('../config.json');
const sqlite3 = require('better-sqlite3');
const db = sqlite3(config.database);

function createUsersTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS Users (
            discord_id TEXT PRIMARY KEY,
            planning_id TEXT
        );
    `);
}

function insertOrUpdateUser(discordId, planningId) {
    const stmt = db.prepare(`
        INSERT INTO Users (discord_id, planning_id)
        VALUES (?, ?)
        ON CONFLICT (discord_id) DO UPDATE SET planning_id = ?;
    `);
    stmt.run(discordId, planningId, planningId);
}

function getUser(discordId) {
    const stmt = db.prepare(`
        SELECT * FROM Users
        WHERE discord_id = ?;
    `);
    return stmt.get(discordId);
}

module.exports = {
    createUsersTable,
    insertOrUpdateUser,
    getUser
}
