const { createUser, createItem, createReview, createComment}  = require("./db.js");

const seedData = async () => {
  console.log("Seeding data...");

  // user seeding
  const [
    moe,
    lucy,
    larry,
    ethyl,
    alice,
    bob,
    charlie,
    dave,
    eve,
    frank,
    grace,
    henry,
    isabel,
    jack,
    kate,
    leo,
    mia,
    nate,
    olivia,
    peter,
    quinn,
    rachel,
    sam,
    tina,
  ] = await Promise.all([
    createUser({ username: "moe", password_hash: "moe_pw" }),
    createUser({ username: "lucy", password_hash: "lucy_pw" }),
    createUser({ username: "larry", password_hash: "larry_pw" }),
    createUser({ username: "ethyl", password_hash: "ethyl_pw" }),
    createUser({ username: "alice", password_hash: "alice_pw" }),
    createUser({ username: "bob", password_hash: "bob_pw" }),
    createUser({ username: "charlie", password_hash: "charlie_pw" }),
    createUser({ username: "dave", password_hash: "dave_pw" }),
    createUser({ username: "eve", password_hash: "eve_pw" }),
    createUser({ username: "frank", password_hash: "frank_pw" }),
    createUser({ username: "grace", password_hash: "grace_pw" }),
    createUser({ username: "henry", password_hash: "henry_pw" }),
    createUser({ username: "isabel", password_hash: "isabel_pw" }),
    createUser({ username: "jack", password_hash: "jack_pw" }),
    createUser({ username: "kate", password_hash: "kate_pw" }),
    createUser({ username: "leo", password_hash: "leo_pw" }),
    createUser({ username: "mia", password_hash: "mia_pw" }),
    createUser({ username: "nate", password_hash: "nate_pw" }),
    createUser({ username: "olivia", password_hash: "olivia_pw" }),
    createUser({ username: "peter", password_hash: "peter_pw" }),
    createUser({ username: "quinn", password_hash: "quinn_pw" }),
    createUser({ username: "rachel", password_hash: "rachel_pw" }),
    createUser({ username: "sam", password_hash: "sam_pw" }),
    createUser({ username: "tina", password_hash: "tina_pw" }),
  ]);
  console.log("Users created.");

  // item seeding
  const [
    widget,
    gadget,
    smartphone,
    laptop,
    headphones,
    smartwatch,
    blender,
    vacuumCleaner,
    coffeeMaker,
    gamingConsole,
    electricScooter,
    airFryer,
    yogaMat,
    deskChair,
    bookshelf,
    wirelessCharger,
    portableSpeaker,
    fitnessTracker,
    robotVacuum,
    standingDesk,
  ] = await Promise.all([
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
    createItem({
      name: "Smartphone",
      description: "A high-performance smartphone with a sleek design",
      average_rating: 0.0,
    }),
    createItem({
      name: "Laptop",
      description: "A lightweight laptop with powerful features",
      average_rating: 0.0,
    }),
    createItem({
      name: "Headphones",
      description: "Noise-canceling headphones for immersive sound",
      average_rating: 0.0,
    }),
    createItem({
      name: "Smartwatch",
      description: "A stylish smartwatch with fitness tracking capabilities",
      average_rating: 0.0,
    }),
    createItem({
      name: "Blender",
      description: "A high-speed blender for smoothies and shakes",
      average_rating: 0.0,
    }),
    createItem({
      name: "Vacuum Cleaner",
      description: "A powerful vacuum cleaner for deep cleaning",
      average_rating: 0.0,
    }),
    createItem({
      name: "Coffee Maker",
      description: "A programmable coffee maker for fresh brews",
      average_rating: 0.0,
    }),
    createItem({
      name: "Gaming Console",
      description: "A next-gen gaming console for ultimate entertainment",
      average_rating: 0.0,
    }),
    createItem({
      name: "Electric Scooter",
      description: "A foldable electric scooter for convenient commuting",
      average_rating: 0.0,
    }),
    createItem({
      name: "Air Fryer",
      description: "A compact air fryer for healthy cooking",
      average_rating: 0.0,
    }),
    createItem({
      name: "Yoga Mat",
      description: "A non-slip yoga mat for your daily practice",
      average_rating: 0.0,
    }),
    createItem({
      name: "Desk Chair",
      description: "An ergonomic desk chair for comfortable seating",
      average_rating: 0.0,
    }),
    createItem({
      name: "Bookshelf",
      description: "A modern bookshelf for organizing your books",
      average_rating: 0.0,
    }),
    createItem({
      name: "Wireless Charger",
      description: "A fast wireless charger for your devices",
      average_rating: 0.0,
    }),
    createItem({
      name: "Portable Speaker",
      description: "A waterproof portable speaker with great sound quality",
      average_rating: 0.0,
    }),
    createItem({
      name: "Fitness Tracker",
      description: "A fitness tracker to monitor your health and activity",
      average_rating: 0.0,
    }),
    createItem({
      name: "Robot Vacuum",
      description: "A smart robot vacuum for automated cleaning",
      average_rating: 0.0,
    }),
    createItem({
      name: "Standing Desk",
      description: "An adjustable standing desk for a healthier workspace",
      average_rating: 0.0,
    }),
  ]);
  console.log("Items created.");

  //review seeding
  const [
    review1,
    review2,
    review3,
    review4,
    review5,
    review6,
    review7,
    review8,
    review9,
    review10,
    review11,
    review12,
    review13,
    review14,
    review15,
    review16,
    review17,
    review18,
    review19,
    review20,
  ] = await Promise.all([
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
    createReview({
      user_id: larry.id,
      item_id: smartphone.id,
      rating: 3,
      review_text: "Decent smartphone, but could be better.",
    }),
    createReview({
      user_id: ethyl.id,
      item_id: laptop.id,
      rating: 5,
      review_text: "Amazing laptop, perfect for work and gaming!",
    }),
    createReview({
      user_id: alice.id,
      item_id: headphones.id,
      rating: 4,
      review_text: "Great sound quality, but a bit pricey.",
    }),
    createReview({
      user_id: bob.id,
      item_id: smartwatch.id,
      rating: 5,
      review_text: "Stylish and functional smartwatch!",
    }),
    createReview({
      user_id: charlie.id,
      item_id: blender.id,
      rating: 4,
      review_text: "Blends everything perfectly, but a bit loud.",
    }),
    createReview({
      user_id: dave.id,
      item_id: vacuumCleaner.id,
      rating: 5,
      review_text: "Powerful vacuum cleaner, makes cleaning easy!",
    }),
    createReview({
      user_id: eve.id,
      item_id: coffeeMaker.id,
      rating: 5,
      review_text: "Best coffee maker I've ever owned!",
    }),
    createReview({
      user_id: frank.id,
      item_id: gamingConsole.id,
      rating: 5,
      review_text: "Incredible gaming experience, highly recommend!",
    }),
    createReview({
      user_id: grace.id,
      item_id: electricScooter.id,
      rating: 4,
      review_text: "Convenient and fun to ride!",
    }),
    createReview({
      user_id: henry.id,
      item_id: airFryer.id,
      rating: 5,
      review_text: "Healthy cooking made easy!",
    }),
    createReview({
      user_id: isabel.id,
      item_id: yogaMat.id,
      rating: 4,
      review_text: "Comfortable and non-slip, great for yoga.",
    }),
    createReview({
      user_id: jack.id,
      item_id: deskChair.id,
      rating: 5,
      review_text: "Super comfortable for long work hours.",
    }),
    createReview({
      user_id: kate.id,
      item_id: bookshelf.id,
      rating: 4,
      review_text: "Stylish and sturdy bookshelf.",
    }),
    createReview({
      user_id: leo.id,
      item_id: wirelessCharger.id,
      rating: 5,
      review_text: "Charges my devices quickly and efficiently.",
    }),
    createReview({
      user_id: mia.id,
      item_id: portableSpeaker.id,
      rating: 5,
      review_text: "Great sound quality and portable design.",
    }),
    createReview({
      user_id: nate.id,
      item_id: fitnessTracker.id,
      rating: 4,
      review_text: "Tracks my workouts accurately.",
    }),
    createReview({
      user_id: olivia.id,
      item_id: robotVacuum.id,
      rating: 5,
      review_text: "Keeps my floors spotless with no effort!",
    }),
    createReview({
      user_id: peter.id,
      item_id: standingDesk.id,
      rating: 5,
      review_text: "Perfect for a healthier workspace.",
    }),
  ]);
  console.log("Reviews created.");

  // comment seeding
  const [
    comment1,
    comment2,
    comment3,
    comment4,
    comment5,
    comment6,
    comment7,
    comment8,
    comment9,
    comment10,
    comment11,
    comment12,
    comment13,
    comment14,
    comment15,
    comment16,
    comment17,
    comment18,
    comment19,
    comment20,
  ] = await Promise.all([
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
    createComment({
      review_id: review3.id,
      user_id: alice.id,
      comment_text: "This is very helpful, thank you!",
    }),
    createComment({
      review_id: review4.id,
      user_id: bob.id,
      comment_text: "I had a similar experience with this product.",
    }),
    createComment({
      review_id: review5.id,
      user_id: charlie.id,
      comment_text: "Great review, very detailed!",
    }),
    createComment({
      review_id: review6.id,
      user_id: dave.id,
      comment_text: "I completely agree with your points.",
    }),
    createComment({
      review_id: review7.id,
      user_id: eve.id,
      comment_text: "Thanks for sharing your thoughts!",
    }),
    createComment({
      review_id: review8.id,
      user_id: frank.id,
      comment_text: "This review convinced me to buy it.",
    }),
    createComment({
      review_id: review9.id,
      user_id: grace.id,
      comment_text: "I had the opposite experience, unfortunately.",
    }),
    createComment({
      review_id: review10.id,
      user_id: henry.id,
      comment_text: "Very insightful review, thanks!",
    }),
    createComment({
      review_id: review11.id,
      user_id: isabel.id,
      comment_text: "I found this review very helpful.",
    }),
    createComment({
      review_id: review12.id,
      user_id: jack.id,
      comment_text: "I disagree with this review, but it's well-written.",
    }),
    createComment({
      review_id: review13.id,
      user_id: kate.id,
      comment_text: "This review helped me make my decision.",
    }),
    createComment({
      review_id: review14.id,
      user_id: leo.id,
      comment_text: "I appreciate the honesty in this review.",
    }),
    createComment({
      review_id: review15.id,
      user_id: mia.id,
      comment_text: "This product sounds amazing based on your review!",
    }),
    createComment({
      review_id: review16.id,
      user_id: nate.id,
      comment_text: "I had a similar experience, great review!",
    }),
    createComment({
      review_id: review17.id,
      user_id: olivia.id,
      comment_text: "This review was very informative, thank you.",
    }),
    createComment({
      review_id: review18.id,
      user_id: peter.id,
      comment_text: "I appreciate the detailed feedback in this review.",
    }),
    createComment({
      review_id: review19.id,
      user_id: quinn.id,
      comment_text: "This review helped me avoid a bad purchase.",
    }),
    createComment({
      review_id: review20.id,
      user_id: rachel.id,
      comment_text: "Thanks for the recommendation, I love this product too!",
    }),
  ]);
  console.log("Comments created.");

  console.log("Finished seeding data.");
};

module.exports = {
  seedData
}