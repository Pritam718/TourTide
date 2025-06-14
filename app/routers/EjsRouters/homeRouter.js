const express = require("express");
const router = express.Router();
const homeController = require("../../controllers/EjsControllers.js/HomeController");
const checkAuthentication = require("../../middleware/checkAuthentication");

router.get("/", homeController.homePage);
router.get("/about", homeController.aboutPage);

module.exports = router;
