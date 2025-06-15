const express = require("express");
const tourController = require("../../controllers/ApiControllers/tourController");
const tourImage = require("../../helper/tourImage");
const tourEjsController = require("../../controllers/EjsControllers.js/tourEjsController");
const { checkPermission } = require("../../middleware/rbacMiddleware");
const adminEjsController = require("../../controllers/EjsControllers.js/adminEjsController");
const hotelEjsController = require("../../controllers/EjsControllers.js/hotelEjsController");
const foodEjsController = require("../../controllers/EjsControllers.js/foodEjsController");
const adminCheckauthenticationToken = require("../../middleware/adminAuth");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("adminLogin");
});

router.post("/login", adminEjsController.login);

router.use(adminCheckauthenticationToken);
router.use(checkPermission("admin_record"));
router.get("/logout", adminEjsController.logout);

router.get("/dashboard", (req, res) => {
  res.render("adminDashboard");
});

router.get("/touraddform", (req, res) => {
  res.render("tourAddForm");
});
router.post("/tourAdd", tourImage.array("image"), tourEjsController.addPlace);

router.get("/hoteladdform", hotelEjsController.addHotelForm);
router.get("/gethotel", hotelEjsController.getHotel);
router.post("/hotelAdd", tourImage.array("image"), hotelEjsController.addHotel);

router.get("/foodaddform", (req, res) => {
  res.render("foodAddForm");
});
router.post("/addFood", foodEjsController.addFood);

router.get("/table", (req, res) => {
  res.render("adminTable");
});

module.exports = router;
