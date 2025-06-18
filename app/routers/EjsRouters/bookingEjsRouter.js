const express = require("express");
const bookingEjsController = require("../../controllers/EjsControllers.js/bookingEjsController");
const userCheckauthenticationToken = require("../../middleware/auth");
const router = express.Router();

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
