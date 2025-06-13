const express = require("express");
const tourController = require("../../controllers/ApiControllers/tourController");
const tourImage = require("../../helper/tourImage")
const router = express.Router();

router.post("/", tourController.addPlace);
router.get("/",tourImage.array("image"), tourController.getPlace);

module.exports = router;
