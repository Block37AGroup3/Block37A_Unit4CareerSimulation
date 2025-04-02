require("dotenv").config();

const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL || "postgres://localhost:5432/block37_db");
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT = process.env.JWT || "shhh";

//create tables
const createTables = async () => {
  // Hopefully the right order to prevent foreign key issue
  const SQL = /*sql*/ `
  DROP TABLE IF EXISTS comments;
  DROP TABLE IF EXISTS reviews;
  DROP TABLE IF EXISTS items;
  DROP TABLE IF EXISTS users;
  CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
      );
  CREATE TABLE items (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    average_rating NUMERIC(2, 1) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
    );
  CREATE TABLE reviews (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON Delete CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON Delete CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
    );
  CREATE TABLE comments (
    id UUID PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES reviews(id) ON Delete CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON Delete CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
    );
      `;
  await client.query(SQL);
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

const createUser = async ({ username, password_hash }) => {
  const SQL = /*sql*/ `
    INSERT INTO users (id, username, password_hash)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const response = await client.query(SQL, [uuid.v4(), username, await bcrypt.hash(password_hash, 5)]);
  return response.rows[0];
};
const createItem = async ({ name, description, average_rating }) => {
  const SQL = /*sql*/ `
    INSERT INTO items (id, name, description, average_rating)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const response = await client.query(SQL, [uuid.v4(), name, description, average_rating]);
  return response.rows[0];
};
const createReview = async ({ user_id, item_id, rating, review_text }) => {
  const SQL = /*sql*/ `
    INSERT INTO reviews (id, user_id, item_id, rating, review_text)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const response = await client.query(SQL, [uuid.v4(), user_id, item_id, rating, review_text]);
  return response.rows[0];
};
const createComment = async ({ review_id, user_id, comment_text }) => {
  const SQL = /*sql*/ `
    INSERT INTO comments (id, review_id, user_id, comment_text)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const response = await client.query(SQL, [uuid.v4(), review_id, user_id, comment_text]);
  return response.rows[0];
};

// authentication
const authenticateUser = async ({ username, password_hash }) => {
  console.log("Authenticating user fucntion...", username);
  const SQL = /*sql*/ `
    SELECT id, password_hash 
    FROM users 
    WHERE username = $1;
  `;
  const response = await client.query(SQL, [username]);
  if (!response.rows.length || (await bcrypt.compare(password_hash, response.rows[0].password_hash)) === false) {
    const error = Error("not authorized");
    error.status = 401;
    throw error;
  }
  const token = await jwt.sign({ id: response.rows[0].id }, JWT);
  return { token };
};

const findUserByToken = async (token) => {
  let id;
  try {
    const payload = await jwt.verify(token, JWT);
    id = payload.id;
  } catch (ex) {
    const error = Error("not authorized");
    error.status = 401;
    throw error;
  }
  const SQL = `
    SELECT id, username
    FROM users
    WHERE id = $1
  `;
  const response = await client.query(SQL, [id]);
  if (!response.rows.length) {
    const error = Error("not authorized");
    error.status = 401;
    throw error;
  }
  return response.rows[0];
};

// Fetch items method
const fetchItems = async () => {
  const SQL = `SELECT * FROM items;`;
  const response = await client.query(SQL);
  return response.rows;
};

module.exports = {
  client,
  connectDB,
  createTables,
  createUser,
  createItem,
  createReview,
  createComment,
  fetchItems,
  authenticateUser,
};
