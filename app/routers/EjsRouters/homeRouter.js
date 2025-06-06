const express = require("express");
const router = express.Router();
const homeController = require("../../controllers/EjsControllers.js/HomeController");

router.get("/", homeController.homePage);
router.get("/about", homeController.aboutPage);
router.get("/signin",homeController.signinPage);
router.get("/signup",homeController.signupPage);


module.exports = router;
