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
  findReviewById,
  findReviewsByMe,
  findCommentsByMe,
  getReviewsByItemId,
  findCommentById,
  deleteCommentById,
  fetchIndividualReviewByReviewId,
  destroyReviewId
} = require("./db.js");

const { seedData } = require("./seed.js");

const express = require("express");
const app = express();
const port = 3000;
app.use(express.json());

const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.error("No token provided in request headers");
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    req.user = await findUserByToken(token);
    console.log("User authenticated:", req.user);
    next();
  } catch (error) {
    console.error("Error in isLoggedIn middleware:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

const init = async () => {
  await connectDB();
  await createTables();
  await seedData();

  console.log("----------");
  console.log("Helpful CURL commands to test:");

  console.log(
    `curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"username": "test.test", "password": "securepassword"}'`
  );
  console.log(
    `curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username": "test.test", "password_hash": "securepassword"}'`
  );

  console.log(`curl -X GET http://localhost:3000/api/items`);
  console.log(`curl -X GET http://localhost:3000/api/items/ITEM_ID`);
  console.log(`curl -X GET http://localhost:3000/api/items/ITEM_ID/reviews`);
  console.log(`curl -X GET http://localhost:3000/api/items/ITEM_ID/reviews/REVIEW_ID`);
  console.log(`curl -X GET http://localhost:3000/api/auth/me -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"`);
  console.log(
    `curl -X POST http://localhost:3000/api/items/ITEM_ID/reviews -H "Authorization: Bearer YOUR_ACCESS_TOKEN" -H "Content-Type: application/json" -d '{"rating": 5, "review_text": "Great product!"}'`
  );
  console.log(`curl -X GET http://localhost:3000/api/reviews/me -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"`);
  console.log(`TODO: CURL PUT /api/users/:userId/reviews/:reviewId`);

  console.log(
    `curl -X POST http://localhost:3000/api/items/ITEM_ID/reviews/REVIEW_ID/comments -H "Authorization: Bearer YOUR_ACCESS_TOKEN" -H "Content-Type: application/json" -d '{"review_id": REVIEW_ID, "user_id": USER_ID, "comment_text": "Greatest comment ever!"}'`
  );
  console.log(`curl -X GET http://localhost:3000/api/comments/me -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"`);
  console.log(`TODO: PUT /api/users/:userId/comments/:commentId`);
  console.log(`curl -X DELETE http://localhost:3000/api/users/[USER_ID]/comments/COMMENT_ID -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"`);
  console.log(`curl -X DELETE http://localhost:3000/api/users/[USER_ID]/reviews/REVIEW_ID -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"`);

  console.log("----------");

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

// Define PUT /api/users/:userId/reviews/:reviewId route
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
      WHERE id = $3 AND user_id = $4
      RETURNING *;
      `;
    const response = await client.query(SQL, [rating, review_text, reviewId, userId]);
    // this checks that the review exists. it can also be written as response.rows.length === 0
    if (!response.rows.length) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.status(200).json(response.rows[0]);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
});

//GET review for item by review id 
app.get("/api/items/:itemId/reviews/:reviewId", async (req, res, next) => {
  const { itemId, reviewId } = req.params;
  try {
    const item = await fetchItemId(itemId);

    if (item.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const review = await findReviewById(itemId, reviewId);

    if (review) {
      res.json({
        item_id: itemId,
        review_id: review.review_id,
        review_text: review.review_text,
        rating: review.rating,
        username: review.username,
        created_at: review.created_at,
      });
    } else {
      res.status(404).json({ error: "Review not found" });
    }
  } catch (error) {
    console.error("Error fetching review:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Define PUT /api/users/:userId/comments/:commentId route
app.put("/api/users/:userId/comments/:commentId", isLoggedIn, async (req, res, next) => {
  try {
    const { comment_text } = req.body;
    const { userId, commentId } = req.params;

    // this checks that the user is logged in.
    if (userId !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to update this review." });
    }
    if (!comment_text || typeof comment_text !== "string" || comment_text.trim() === "") {
      return res.status(400).json({ error: "Comment text is required." });
    }
    const SQL = /*sql*/ `
      UPDATE comments SET comment_text = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING *;
      `;
    const response = await client.query(SQL, [comment_text, commentId, userId]);
    // this checks that the review exists. it can also be written as response.rows.length === 0
    if (!response.rows.length) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.status(200).json(response.rows[0]);
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Failed to update review" });

  }
});

//GET /api/reviews/me route
app.get("/api/reviews/me", isLoggedIn, async (req, res) => {
  try {
    const reviews = await findReviewsByMe(req.user.id);

    if (reviews.length > 0) {
      res.json(reviews);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

//GET /api/comments/me route
app.get("/api/comments/me", isLoggedIn, async (req, res) => {
  try {
    const comments = await findCommentsByMe(req.user.id);

    if (comments.length > 0) {
      res.json(comments);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Error fetching user comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// GET /api/items/:itemId/reviews
app.get("/api/items/:itemId/reviews", async (req, res) => {
  try {
    const { itemId } = req.params;

    const reviews = await getReviewsByItemId(itemId);

    if (!reviews.length) {
      return res.status(404).json({ message: "No reviews found for this item" });
    }

    return res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /api/users/:userId/comments/:commentId route
app.delete("/api/users/:userId/comments/:commentId", isLoggedIn, async (req, res, next) => {
  const { userId, commentId } = req.params;

  try {
    const comment = await findCommentById(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to delete this comment" });
    }

    const deletedComment = await deleteCommentById(commentId);

    if (!deletedComment) {
      return res.status(500).json({ error: "Failed to delete comment" });
    }

    res.status(200).json({ message: "Comment deleted "});
  } catch (error) {
    console.error("Error deleting comment", error);
    next(error);
  }
});

// DELETE /api/users/:userId/reviews/:reviewId route
app.delete('/api/users/:userId/reviews/:reviewId', isLoggedIn, async (req, res) => {
  try {
    const { userId, reviewId } = req.params;

    // Fetch the review by reviewId
    const review = await fetchIndividualReviewByReviewId(userId, reviewId);
    console.log(`review: `, review);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Ensure the review belongs to the logged-in user
    if (userId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You cannot delete this review' });
    }

    // Delete the review
    const deleted = await destroyReviewId(req.user.id, reviewId);

    if (deleted) {
      return res.status(204).send(); // No content response upon success
    } else {
      return res.status(500).json({ message: 'Failed to delete review' });
    }
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/items/:itemId/reviews/:reviewId/comments route
app.post("/api/items/:itemId/reviews/:reviewId/comments", isLoggedIn, async (req, res, next) => {
  try { 
    const { itemId, reviewId } = req.params;
    const { user_id, comment_text } = req.body;

    if (!user_id || !comment_text) {
      return res.status(400).json({ error: "User ID and comment text are required." });
    }

    // Check if the review exists
    const reviewExists = await client.query(
      "SELECT * FROM reviews WHERE id = $1",
      [reviewId]
    );
    if (reviewExists.rows.length === 0) {
      return res.status(404).json({ error: "Review not found." });
    }

    // Check if the user has already commented on this review
    const existingComment = await client.query(
      "SELECT * FROM comments WHERE review_id = $1 AND user_id = $2",
      [reviewId, user_id]
    );
    if (existingComment.rows.length > 0) {
      return res.status(400).json({ error: "User has already commented on this review." });
    }

    const newComment = await createComment({
      review_id: reviewId,
      user_id: user_id,
      comment_text,
    });

    res.status(201).json(newComment);
  } catch (error) {
    next(error);
  }
});

init();
