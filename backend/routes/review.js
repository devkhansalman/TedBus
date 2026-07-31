const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review");

router.post("/reviews", reviewController.createReview);
router.get("/reviews/bus/:busId", reviewController.getReviewsByBus);
router.get("/reviews/check/:bookingId", reviewController.checkEligibility);

module.exports = router;
