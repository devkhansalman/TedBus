const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  bookingId: { type: String, required: true, unique: true },
  routeId: { type: String, required: false },
  busId: { type: String, required: true },
  operatorName: { type: String, required: true },
  departure: { type: String, required: false },
  arrival: { type: String, required: false },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true, minlength: 30 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", reviewSchema);
