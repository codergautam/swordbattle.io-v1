const postgres = require("postgres");

const sql = postgres(process.env.DATABASE_URL, {ssl: true});

module.exports = {sql: sql};