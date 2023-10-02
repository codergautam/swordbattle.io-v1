const postgres = require("postgres");
require("dotenv").config();
if(process.env.DATABASE_URL) {
const sql = postgres(process.env.DATABASE_URL, {max: 3, idle_timeout:30, ssl: {rejectUnauthorized:false}});
console.log("Connected to database");
module.exports = {sql: sql};
} else {
  module.exports = {sql: () => {
    console.log("Error: calling sql() when database is not connected");
  }};
  // throw new Error("Hmm, looks like you haven't run the setup wizard yet.\nPlease run `node setup` to get everything up & running\n\n");
}