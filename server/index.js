const { client, connectDB, createTables, createItem, createUser, createReview, createComment } = require("./db.js");

const express = require("express");
const app = express();

const port = 3000;

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

  // let tableSQL = `` -- Create tables in the db
  // await client.query(SQL)
  // console.log('tables created')

  // let seedDataSQL = `` -- Seed data
  // await client.query(SQL)
  // console.log('data seeded')

  app.listen(port, () => console.log(`listening on PORT ${port}`));
};

init();
