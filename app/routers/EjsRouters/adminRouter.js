const express = require("express");
const tourController = require("../../controllers/ApiControllers/tourController");
const tourEjsController = require("../../controllers/EjsControllers.js/tourEjsController");
const { checkPermission } = require("../../middleware/rbacMiddleware");
const adminEjsController = require("../../controllers/EjsControllers.js/adminEjsController");
const hotelEjsController = require("../../controllers/EjsControllers.js/hotelEjsController");
const foodEjsController = require("../../controllers/EjsControllers.js/foodEjsController");
const adminCheckauthenticationToken = require("../../middleware/adminAuth");
const tourImageUpload = require("../../helper/tourImage");
const router = express.Router();

router.get("/hotelbooking-history", hotelEjsController.getHotelBooking);
router.get("/", (req, res) => {
  res.render("adminLogin");
});

router.post("/login", adminEjsController.login);

router.use(adminCheckauthenticationToken);
router.use(checkPermission("admin_record"));

router.get("/logout", adminEjsController.logout);

router.get("/dashboard", adminEjsController.dashboard);
router.get("/tourtable", adminEjsController.tourTable);
router.get("/foodtable", adminEjsController.foodTable);
router.get("/hoteltable", adminEjsController.hotelTable);

router.get("/adminEditForm/", adminEjsController.adminEditForm);
router.get("/adminProfile/", adminEjsController.adminProfile);
router.post("/adminEdit/:id", adminEjsController.adminEdit);
router.get("/touraddform", tourEjsController.tourAddForm);
router.post(
  "/tourAdd",
  tourImageUpload.array("image"),
  tourEjsController.addPlace
);
router.get("/tourEditPage/:id", tourEjsController.tourEditPage);
router.post(
  "/tourEdit/:id",
  tourImageUpload.array("image", 6),
  tourEjsController.tourEdit
);
router.get("/tourDelete/:id", tourEjsController.deleteTour);
router.get("/tourList", tourEjsController.tourList);

router.get("/hoteladdform", hotelEjsController.addHotelForm);
router.get("/gethotel", hotelEjsController.getHotel);
router.post(
  "/hotelAdd",
  tourImageUpload.array("image"),
  hotelEjsController.addHotel
);
router.get("/hotelEditPage/:id", hotelEjsController.hotelEditPage);
router.post(
  "/hotelEdit/:id",
  tourImageUpload.array("image"),
  hotelEjsController.hotelEdit
);
router.get("/hotelDelete/:id", hotelEjsController.deleteHotel);
router.get("/hotelList", hotelEjsController.hotelList);

router.get("/foodaddform", foodEjsController.addFoodForm);
router.post("/addFood", foodEjsController.addFood);
router.get("/foodEditPage/:id", foodEjsController.foodEditPage);
router.post("/foodEdit/:id", foodEjsController.foodEdit);
router.get("/foodDelete/:id", foodEjsController.deleteFood);
router.get("/foodList", foodEjsController.foodList);

module.exports = router;
