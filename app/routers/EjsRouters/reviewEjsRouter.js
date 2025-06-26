const express = require("express");
const reviewEjsController = require("../../controllers/EjsControllers.js/reviewEjsController");
const userCheckauthenticationToken = require("../../middleware/auth");
const router = express.Router();

router.post(
  "/addReview",
  userCheckauthenticationToken,
  reviewEjsController.createReview
);

module.exports = router;
