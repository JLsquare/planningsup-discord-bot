const config = require('./config.json');
const database = require('./utils/database');
const signale = require('signale');
const fs = require('fs');

(async () => {
    try {
        await fs.unlinkSync(config.database);
    } catch (error) {
        signale.warn('Database not found');
    }
});
database.createUsersTable();
signale.success('Database reset successfully');