const express = require("express");
const router = express.Router();
const homeController = require("../../controllers/EjsControllers.js/HomeController");
const tourEjsController = require("../../controllers/EjsControllers.js/tourEjsController");

router.get("/", homeController.homePage);
router.get("/about", homeController.aboutPage);
router.get("/tour", tourEjsController.tourPackagePage);
// router.get("/tourdetails", homeController.tourdetails);
router.get("/tourdetails/:id", tourEjsController.specificTourDetails);
router.get("/search", tourEjsController.searchTour);

module.exports = router;
