require("dotenv").config();

const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL ||
    "postgres://MainUser:Decollegez1!@localhost:5432/block37_db"
);
const uuid = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT = process.env.JWT || "shhh";

//create tables
const createTables = async () => {
  console.log("Creating tables...");
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
  console.log("Tables created.");
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
  const response = await client.query(SQL, [
    uuid.v4(),
    username,
    await bcrypt.hash(password_hash, 5),
  ]);
  return response.rows[0];
};

const createItem = async ({ name, description, average_rating }) => {
  const SQL = /*sql*/ `
    INSERT INTO items (id, name, description, average_rating)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const response = await client.query(SQL, [
    uuid.v4(),
    name,
    description,
    average_rating,
  ]);
  return response.rows[0];
};

const createReview = async ({ user_id, item_id, rating, review_text }) => {
  const SQL = /*sql*/ `
    INSERT INTO reviews (id, user_id, item_id, rating, review_text)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const response = await client.query(SQL, [
    uuid.v4(),
    user_id,
    item_id,
    rating,
    review_text,
  ]);
  return response.rows[0];
};

const createComment = async ({ review_id, user_id, comment_text }) => {
  const SQL = /*sql*/ `
    INSERT INTO comments (id, review_id, user_id, comment_text)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const response = await client.query(SQL, [
    uuid.v4(),
    review_id,
    user_id,
    comment_text,
  ]);
  return response.rows[0];
};

const getReviewsByItemId = async (item_id) => {
  const SQL = /*sql*/ `
    SELECT * FROM items
    WHERE id = $1;
  `;
  const response = await client.query(SQL, [item_id]);
  return response.rows;
};

// authentication
const authenticateUser = async ({ username, password_hash }) => {
  console.log("Authenticating user function...", username);
  const SQL = /*sql*/ `
    SELECT id, password_hash 
    FROM users 
    WHERE username = $1;
  `;
  const response = await client.query(SQL, [username]);
  if (
    !response.rows.length ||
    (await bcrypt.compare(password_hash, response.rows[0].password_hash)) ===
      false
  ) {
    console.error("Invalid username or password");
    const error = Error("not authorized");
    error.status = 401;
    throw error;
  }

  const token = jwt.sign({ id: response.rows[0].id }, process.env.JWT, {
    algorithm: "HS256",
  });
  console.log("Generated Token:", token);
  return { token };
};

// Fetch items method
const fetchItems = async () => {
  const SQL = `SELECT * FROM items;`;
  const response = await client.query(SQL);
  return response.rows;
};

// Fetch itemId method
const fetchItemId = async (id) => {
  const SQL = `SELECT * FROM items WHERE id = $1;`;
  const response = await client.query(SQL, [id]);
  return response.rows;
};

const findUserByToken = async (token) => {
  try {
    console.log("Received token:", token);
    const payload = jwt.verify(token, process.env.JWT);
    console.log("Decoded payload:", payload);

    const SQL = `SELECT * FROM users WHERE id = $1;`;
    const response = await client.query(SQL, [payload.id]);

    if (!response.rows.length) {
      throw new Error("User not found");
    }
    return response.rows[0];
  } catch (ex) {
    console.error("Error decoding token:", ex.message);
    throw new Error("Not authorized");
  }
};

const findReviewsByMe = async (userId) => {
  try {
    const SQL = `
      SELECT reviews.id AS review_id, reviews.review_text, reviews.rating, reviews.created_at, items.name AS item_name
      FROM reviews
      JOIN items ON reviews.item_id = items.id
      WHERE reviews.user_id = $1;
    `;

    const response = await client.query(SQL, [userId]);

    return response.rows;
  } catch (error) {
    console.error("Error fetching reviews for user:", error);
    throw new Error("Database error");
  }
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
  findReviewsByMe,
  getReviewsByItemId,
};
