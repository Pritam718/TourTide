const express = require("express");
const tourController = require("../../controllers/ApiControllers/tourController");
const router = express.Router();

router.post("/", tourController.addPlace);
router.get("/", tourController.getPlace);

module.exports = router;
