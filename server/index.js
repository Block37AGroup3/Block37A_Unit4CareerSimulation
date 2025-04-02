const {
  client,
  connectDB,
  createTables,
  createItem,
  createUser,
  createReview,
  createComment,
  fetchItems,
  authenticateUser,
  findUserByToken
} = require("./db.js");

const express = require("express");
const app = express();
const port = 3000;
app.use(express.json());

const isLoggedIn = async (req, res, next) => {
  console.log("Authorization Header:", req.headers.authorization);
  try {
    if (!req.headers.authorization) {
      throw new Error("No authorization header");
    }
    const token = req.headers.authorization.split(" ")[1];
    req.user = await findUserByToken(token);
    next();
  } catch (ex) {
    console.error("Error in isLoggedIn:", ex);
    res.status(401).json({ error: "Not authorized" });
  }
};

const init = async () => {
  await connectDB();
  await createTables();
  console.log("Tables created.");

  const [moe, lucy, larry, ethyl] = await Promise.all([
    createUser({ username: "moe", password_hash: "moe_pw" }),
    createUser({ username: "lucy", password_hash: "lucy_pw" }),
    createUser({ username: "larry", password_hash: "larry_pw" }),
    createUser({ username: "ethyl", password_hash: "ethyl_pw" }),
  ]);
  console.log("Users created:", { moe, lucy, larry, ethyl });

  const [widget, gadget] = await Promise.all([
    createItem({
      name: "Widget",
      description: "A useful widget",
      average_rating: 0.0,
    }),
    createItem({
      name: "Gadget",
      description: "A fancy gadget",
      average_rating: 0.0,
    }),
  ]);
  console.log("Items created:", { widget, gadget });

  const [review1, review2] = await Promise.all([
    createReview({
      user_id: moe.id,
      item_id: widget.id,
      rating: 4,
      review_text: "Great widget, highly recommend!",
    }),
    createReview({
      user_id: lucy.id,
      item_id: gadget.id,
      rating: 5,
      review_text: "This gadget changed my life!",
    }),
  ]);
  console.log("Reviews created:", { review1, review2 });

  const [comment1, comment2] = await Promise.all([
    createComment({
      review_id: review1.id,
      user_id: larry.id,
      comment_text: "I agree with this review!",
    }),
    createComment({
      review_id: review2.id,
      user_id: ethyl.id,
      comment_text: "Thanks for the recommendation!",
    }),
  ]);
  console.log("Comments created:", { comment1, comment2 });

  const items = await fetchItems();
  console.log("Items: ", items);

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
app.get('/api/items/:itemId', async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const items = await fetchItemId(itemId);
    if (items.length === 0) {
      return res.status(404).json({ error: 'Item not found'});
    }
    res.json(items);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch product'});
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
app.get('/api/auth/me', isLoggedIn, (req, res, next)=> {
  try {
    res.send(req.user);
  }
  catch(ex){  
    next(ex);
  }
});

init();
