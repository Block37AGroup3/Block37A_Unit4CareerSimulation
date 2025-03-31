require("dotenv").config();

const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL || "postgres://localhost:5432/block37_db");

//create tables
const createTables = async () => {
  // Hopefully the right order to prevent foreign key issue
  const SQL = /*sql*/ `
  DROP TABLE IF EXISTS Comments;
  DROP TABLE IF EXISTS Reviews;
  DROP TABLE IF EXISTS Items;
  DROP TABLE IF EXISTS Users;
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL

      );
      `;
};

const connectDB = async () => {
  try {
    console.log("Connecting to database...");
    await client.connect();
    console.log("Connected to database.");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

module.exports = {
  client,
  connectDB,
};
