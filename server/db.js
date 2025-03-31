require("dotenv").config();

const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost:5432/block37_db');

const connectDB = async () => {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database.');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = {
  client,
  connectDB
}