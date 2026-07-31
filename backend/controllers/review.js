const Review = require("../models/review");
const Booking = require("../models/booking");
const Customer = require("../models/customer");

// ─── CREATE REVIEW ─────────────────────────────────────────────────────────────
exports.createReview = async (req, res) => {
  try {
    const { customerId, bookingId, rating, review } = req.body;

    if (!customerId || !bookingId || !rating || !review) {
      return res.status(400).json({ success: false, message: "Missing required review fields." });
    }

    const cleanReview = String(review).trim();
    if (cleanReview.length < 30) {
      return res.status(400).json({
        success: false,
        message: "Review text must be at least 30 characters long.",
      });
    }

    // 1. Booking Exists Check
    let booking = await Booking.findById(bookingId).catch(() => null);
    if (!booking) {
      const userBookings = await Booking.find({ customerId });
      booking = userBookings.find(
        (b) => String(b._id) === String(bookingId) || String(b.id) === String(bookingId)
      );
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Confirmed booking not found for this user.",
      });
    }

    // 2. Booking Completed Check (status === 'Completed' OR departure date has passed)
    const isCompletedStatus = String(booking.status || "").toLowerCase() === "completed";
    const depDateStr = booking.departureDetails?.date || booking.bookingDate;
    let isDatePassed = false;
    if (depDateStr) {
      const depDate = new Date(depDateStr);
      if (!isNaN(depDate.getTime())) {
        isDatePassed = new Date().getTime() >= depDate.getTime();
      }
    }

    const isCompleted = isCompletedStatus || isDatePassed;
    if (!isCompleted) {
      return res.status(400).json({
        success: false,
        message: "Journey has not completed.",
      });
    }

    // 3. One Review per Booking Check
    const existingReview = await Review.findOne({ bookingId: String(bookingId) });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Review already exists for this booking.",
      });
    }

    // Fetch customer name
    const customer = await Customer.findById(customerId).catch(() => null);
    const customerName = customer?.name || booking.passengerDetails?.[0]?.name || "Verified Traveler";

    const newReview = await Review.create({
      customerId: String(customerId),
      customerName,
      bookingId: String(bookingId),
      routeId: booking.busId || "",
      busId: String(booking.busId),
      operatorName: booking.operatorName || "Tedbus Partner",
      departure: booking.departureDetails?.city || "",
      arrival: booking.arrivalDetails?.city || "",
      rating: Number(rating),
      review: cleanReview,
    });

    // Automatically generate Phase 2 notification: Review Submitted
    const notificationService = require("../services/notification.service");
    const userEmail = customer?.email || booking?.email || req.get("x-user-email");
    if (userEmail) {
      await notificationService.notifyReviewSubmitted(userEmail, newReview);
    }

    res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review: newReview,
    });
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET REVIEWS BY BUS ────────────────────────────────────────────────────────
exports.getReviewsByBus = async (req, res) => {
  try {
    const { busId } = req.params;
    let query = {};
    if (busId && busId !== "all") {
      query = { $or: [{ busId: String(busId) }, { routeId: String(busId) }] };
    }

    const reviews = await Review.find(query).sort({ createdAt: -1 }).exec();
    res.json({
      success: true,
      reviews,
    });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CHECK ELIGIBILITY / EXISTING REVIEW ───────────────────────────────────────
exports.checkEligibility = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const existingReview = await Review.findOne({ bookingId: String(bookingId) });
    res.json({
      hasReview: Boolean(existingReview),
      review: existingReview || null,
    });
  } catch (err) {
    res.status(500).json({ hasReview: false, review: null });
  }
};
