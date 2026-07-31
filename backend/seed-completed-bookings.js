const mongoose = require("mongoose");
const Booking = require("./models/booking");

const DB_URL = "mongodb://127.0.0.1:27017/tedbus-server";

async function seed() {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connected to DB for seeding...");

    const testCustomerId = "6049b8a97501a24470b9a526";

    const dummyBooking = {
      customerId: testCustomerId,
      passengerDetails: [
        { name: "John Doe", gender: "Male", age: 28 }
      ],
      email: "john.doe@example.com",
      phoneNumber: "9876543210",
      fare: 450,
      status: "Completed",
      bookingDate: "2026-07-20",
      busId: "6049b8a97501a24470b9a526",
      seats: [12],
      departureDetails: {
        city: "Delhi",
        time: 10,
        date: "2026-07-20"
      },
      arrivalDetails: {
        city: "Jaipur",
        time: "16:00",
        date: "2026-07-20"
      },
      duration: "6 hours"
    };

    const existing = await Booking.findOne({ customerId: testCustomerId, status: "Completed" });
    if (!existing) {
      await Booking.create(dummyBooking);
      console.log("Dummy completed booking created for testing!");
    } else {
      console.log("Dummy completed booking already exists.");
    }
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    process.exit(0);
  }
}

seed();
