const mongoose = require("mongoose");
const Booking = require("./models/booking");

const DB_URL = "mongodb://127.0.0.1:27017/tedbus-server";

async function seed() {
  try {
    await mongoose.connect(DB_URL);
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    process.exit(0);
  }
}

seed();
