const {
  client,
  connectDB,
  createTables,
  createItem,
  createUser,
  createReview,
  createComment,
  fetchItems,
  fetchItemId,
  authenticateUser,
  findUserByToken,
} = require("./db.js");

const { seedData } = require("./seed.js");

const express = require("express");
const app = express();
const port = 3000;
app.use(express.json());

const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Token is required" });
    }

    req.user = await findUserByToken(token);
    next();
  } catch (ex) {
    console.error("Error in isLoggedIn middleware:", ex);
    next(ex);
  }
};

const init = async () => {
  await connectDB();
  await createTables();
  await seedData();

  console.log("----------");
  console.log("Helpful CURL commands to test:");
  console.log(`curl -X GET http://localhost:${port}/api/items`);
  console.log(`curl -X GET http://localhost:${port}/api/items/[ITEM_ID]`);
  console.log(
    `curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"username": "test.test", "password": "securepassword"}'`
  );
  console.log(
    `curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username": "test.test", "password_hash": "securepassword"}'`
  );
  console.log(`curl -X GET http://localhost:3000/api/auth/me -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"`);
  console.log(
    `curl -X POST http://localhost:3000/api/items/{ITEM_ID}/reviews -H "Authorization: Bearer YOUR_ACCESS_TOKEN" -H "Content-Type: application/json" -d '{"rating": 5, "review_text": "Great product!"}'`
  );

  // TODO:
  // Add CURL command for GET items/itemid/reviews
  // ADD CURL command for GET items/itemid/reviews/reviewid
  // ADD CURL command for GET reviews/me

  app.listen(port, () => console.log(`listening on PORT ${port}`));
};

// GET /api/items route
app.get("/api/items", async (req, res) => {
  try {
    const items = await fetchItems();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET items by id
app.get("/api/items/:itemId", async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const items = await fetchItemId(itemId);
    if (items.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(items);
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// GET /api/auth/me route
app.get("/api/auth/me", isLoggedIn, (req, res, next) => {
  try {
    res.send(req.user);
  } catch (ex) {
    next(ex);
  }
});

// POST/api/auth/login route
app.post("/api/auth/login", async (req, res, next) => {
  try {
    res.send(await authenticateUser(req.body));
  } catch (ex) {
    next(ex);
  }
});

// POST /api/auth/register route
app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    const newUser = await createUser({ username, password_hash: password });
    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === "23505") {
      // Handle unique constraint violation (e.g., duplicate username)
      res.status(409).json({ error: "Username already exists" });
    } else {
      next(error);
    }
  }
});

// GET /api/auth/me route
app.get("/api/auth/me", isLoggedIn, (req, res, next) => {
  try {
    res.send(req.user);
  } catch (ex) {
    next(ex);
  }
});

// POST /api/items/:itemId/reviews
app.post("/api/items/:itemId/reviews", isLoggedIn, async (req, res, next) => {
  try {
    const { rating, review_text } = req.body;
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be a number between 1 and 5." });
    }
    if (!review_text || typeof review_text !== "string" || review_text.trim() === "") {
      return res.status(400).json({ error: "Review text is required." });
    }

    const item = await fetchItemId(req.params.itemId);
    if (item.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const existingReview = await client.query("SELECT * FROM reviews WHERE user_id = $1 AND item_id = $2", [
      req.user.id,
      req.params.itemId,
    ]);

    if (existingReview.rows.length > 0) {
      return res.status(409).json({ error: "You have already reviewed this item." });
    }

    const review = await createReview({
      user_id: req.user.id,
      item_id: req.params.itemId,
      rating: req.body.rating,
      review_text: req.body.review_text,
    });
    res.status(201).json(review);
  } catch (ex) {
    next(ex);
  }
});

//Define PUT /api/users/:userId/reviews/:reviewId route

app.put("/api/users/:userId/reviews/:reviewId", isLoggedIn, async (req, res, next) => {
  try {
    const { rating, review_text } = req.body;
    const { userId, reviewId } = req.params;
    // pulled from the post review request for error handling we need to check the same things.
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be a number between 1 and 5." });
    }
    // pulled from the post review request for error handling we need to check the same things.
    if (!review_text || typeof review_text !== "string" || review_text.trim() === "") {
      return res.status(400).json({ error: "Review text is required." });
    }
    // this checks that the user is logged in.
    if (userId !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to update this review." });
    }
    const SQL = /*sql*/ `
      UPDATE reviews SET rating = $1, review_text = $2, updated_at = NOW()
      WHERE id = $3, user_id = $4
      RETURNING *;
      `;
  } catch (error) {}
});

init();
