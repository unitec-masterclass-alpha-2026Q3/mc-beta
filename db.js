const { Pool } = require("pg");

const pool = new Pool({
  user: "mc_user",
  host: "localhost",
  database: "music_collection",
  password: "hola",
  port: 5432,
});

module.exports = pool;