const { client, connectDB, createTables } = require("./db.js");

const express = require("express");
const app = express();

const port = 3000;

const init = async () => {
  await connectDB();
  await createTables();
  // let tableSQL = `` -- Create tables in the db
  // await client.query(SQL)
  // console.log('tables created')

  // let seedDataSQL = `` -- Seed data
  // await client.query(SQL)
  // console.log('data seeded')

  app.listen(port, () => console.log(`listening on PORT ${port}`));
};

init();
