const express = require("express");
const HotelController = require("../../controllers/ApiControllers/hotelController");
const router = express.Router();

router.post("/hotelAdd", HotelController.addHotel);
router.get("/hotelGet",HotelController.getHotel);

module.exports = router;