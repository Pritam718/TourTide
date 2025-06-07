const express = require("express");
const router = express.Router();
const userEjsController = require("../../controllers/EjsControllers.js/userEjsController");
const authenticationToken = require("../../middleware/auth");

router.get("/signin", userEjsController.signinPage);
router.get("/signup", userEjsController.signupPage);
router.post("/register", userEjsController.register);
router.get("/verifyOtp", userEjsController.otpPage);
router.post("/verifyOtp", userEjsController.verifyOtp);
router.post("/login", userEjsController.login);
router.get("/logout", userEjsController.logout);

router.get("/", authenticationToken, userEjsController.dashboard);

module.exports = router;
