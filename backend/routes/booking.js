const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking");

router.post("/booking", bookingController.addbooking);
router.get("/booking/:id", bookingController.getBooking);
router.patch("/booking/:id/status", bookingController.updateBookingStatus);
router.patch("/booking/:id/cancel", bookingController.cancelBooking);

module.exports = router;