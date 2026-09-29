const fs = require("fs");
const { Pool } = require("pg");

require("dotenv").config();

const configPath = "/app/config/database.json";

let fileConfig = {};

if (fs.existsSync(configPath)) {
  try {
    fileConfig = JSON.parse(
      fs.readFileSync(configPath, "utf8")
    );
  } catch (error) {
    console.error(
      "Failed to read database configuration file:",
      error.message
    );
  }
}

const pool = new Pool({
  host: fileConfig.host || process.env.DB_HOST,
  port: Number(fileConfig.port || process.env.DB_PORT),
  database: fileConfig.database || process.env.DB_NAME,
  user: fileConfig.user || process.env.DB_USER,
  password: process.env.DB_PASSWORD || undefined,
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL");
});

pool.on("error", (error) => {
  console.error(
    "Unexpected PostgreSQL error:",
    error.message
  );
});

module.exports = pool;