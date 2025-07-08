const express = require("express");
const bookingEjsController = require("../../controllers/EjsControllers.js/bookingEjsController");
const userCheckauthenticationToken = require("../../middleware/auth");
const router = express.Router();

// ❌ Old hotel-based route — keep if still needed for legacy or admin
// router.get("/hotel/search/:id", hotelEjsController.getAvailableHotels);

// ✅ Updated booking page — based on Tour and selected schedule
router.get(
  "/booking/:tourId",
  userCheckauthenticationToken,
  bookingEjsController.bookingPage
);

// ✅ Booking POST — create booking for selected schedule
router.post(
  "/book/:tourId",
  userCheckauthenticationToken,
  bookingEjsController.book
);

router.post(
  "/cancelBooking/:id",
  userCheckauthenticationToken,
  bookingEjsController.cancelBooking
);

module.exports = router;
