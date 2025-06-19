const express = require("express");
const bookingEjsController = require("../../controllers/EjsControllers.js/bookingEjsController");
const userCheckauthenticationToken = require("../../middleware/auth");
const hotelEjsController = require("../../controllers/EjsControllers.js/hotelEjsController");
const router = express.Router();

router.get("/hotel/search/:id", hotelEjsController.getAvailableHotels);

router.get(
  "/booking/:id",
  userCheckauthenticationToken,
  bookingEjsController.bookingPage
);
router.post(
  "/book/:id",
  userCheckauthenticationToken,
  bookingEjsController.book
);

module.exports = router;
