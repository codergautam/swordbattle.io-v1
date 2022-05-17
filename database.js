const postgres = require("postgres");

const sql = postgres(process.env.DATABASE_URL, {ssl: {rejectUnauthorized: false}});

module.exports = {sql: sql};