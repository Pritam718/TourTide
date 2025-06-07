const express = require("express");
const router = express.Router();
const homeController = require("../../controllers/EjsControllers.js/HomeController");
const authenticationToken = require("../../middleware/auth");

router.get("/",authenticationToken, homeController.homePage);
router.get("/about", homeController.aboutPage);



module.exports = router;
