const express = require("express");
const tourController = require("../../controllers/ApiControllers/tourController");
const tourImage = require("../../helper/tourImage");
const tourEjsController = require("../../controllers/EjsControllers.js/tourEjsController");
const { checkPermission } = require("../../middleware/rbacMiddleware");
const adminEjsController = require("../../controllers/EjsControllers.js/adminEjsController");
const authenticationToken = require("../../middleware/auth");
const hotelEjsController = require("../../controllers/EjsControllers.js/hotelEjsController");
const foodEjsController = require("../../controllers/EjsControllers.js/foodEjsController");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("adminLogin");
});

router.post("/login", adminEjsController.login);

router.use(authenticationToken);
router.use(checkPermission("admin_record"));

router.get("/dashboard", (req, res) => {
  res.render("adminDashboard");
});

router.get("/touraddform", (req, res) => {
  res.render("tourAddForm");
});
router.post("/tourAdd", tourImage.array("image"), tourEjsController.addPlace);

router.get("/hoteladdform", (req, res) => {
  res.render("hotelAddForm");
});
router.post("/hotelAdd", tourImage.array("image"), hotelEjsController.addHotel);

router.get("/foodaddform", (req, res) => {
  res.render("foodAddForm");
});
router.post("/addFood", foodEjsController.addFood);

router.get("/table", (req, res) => {
  res.render("adminTable");
});

module.exports = router;
