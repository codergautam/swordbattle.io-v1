const postgres = require("postgres");
require("dotenv").config();
if(process.env.DATABASE_URL) {
const sql = postgres(process.env.DATABASE_URL, {max: 5, idle_timeout:30, ssl: {rejectUnauthorized:false}});
console.log("Connected to database");
module.exports = {sql: sql};
} else {
  throw new Error("Hmm, looks like you haven't run the setup wizard yet.\nPlease run `node setup` to get everything up & running\n\n");
}