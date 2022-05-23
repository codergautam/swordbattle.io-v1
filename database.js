const postgres = require("postgres");

const sql = postgres(process.env.DATABASE_URL, {max: 5, idle_timeout:30, ssl: {rejectUnauthorized:false}});
console.log("Connected to database");
module.exports = {sql: sql};