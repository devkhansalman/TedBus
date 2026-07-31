const mongoose = require("mongoose");
const Booking = require("./models/booking");

const DB_URL = "mongodb://127.0.0.1:27017/tedbus-server";

async function seed() {
  try {
    await mongoose.connect(DB_URL);

    const testCustomerId = "6049b8a97501a24470b9a526";

    const existing = await Booking.findOne({ email: "demo@tedbus.com", status: "Completed" });
    if (!existing) {
      await Booking.create({
        name: "Demo Customer",
        email: "demo@tedbus.com",
        phone: 9876543210,
        age: 28,
        gender: "Male",
        seatno: ["A1", "A2"],
        passengerDetails: [
          { name: "Demo Customer", age: 28, gender: "Male", seatno: "A1" }
        ],
        fare: 1250,
        routeId: "delhi-jaipur",
        busId: "bus-1",
        status: "Completed",
        bookingDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
      });
    }
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    process.exit(0);
  }
}

seed();
