const express = require("express");
const router = express.Router();
const homeController = require("../../controllers/EjsControllers.js/HomeController");
const tourEjsController = require("../../controllers/EjsControllers.js/tourEjsController");
const contactEjsController = require("../../controllers/EjsControllers.js/contactEjsController");
const userCheckauthenticationToken = require("../../middleware/auth");

router.get("/", homeController.homePage);
router.get("/about", homeController.aboutPage);
router.get("/tour", tourEjsController.tourPackagePage);

// router.get("/tourdetails", homeController.tourdetails);
router.get(
  "/tourdetails/:id",
  userCheckauthenticationToken,
  tourEjsController.specificTourDetails
);
router.get("/contact", homeController.contactPage);
router.post("/addContact", contactEjsController.addContact);
router.get("/explore/:city", homeController.exploreTopDestination);
router.get("/search", tourEjsController.searchTour);
// router.get("/:city", tourEjsController.searchCity);

module.exports = router;
