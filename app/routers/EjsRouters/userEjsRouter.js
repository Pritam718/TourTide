const express = require("express");
const router = express.Router();
const userEjsController = require("../../controllers/EjsControllers.js/userEjsController");
const authenticationToken = require("../../middleware/auth");
const checkAuthentication = require("../../middleware/checkAuthentication");
const userCheckauthenticationToken = require("../../middleware/auth");

router.get("/signin", userEjsController.signinPage);
router.get("/signup", userEjsController.signupPage);
router.post("/register", userEjsController.register);
router.get("/verifyOtp", userEjsController.otpPage);
router.post("/verifyOtp", userEjsController.verifyOtp);
router.post("/login", userEjsController.login);
router.get("/logout", userEjsController.logout);
router.get("/forgot-password", userEjsController.forgotPasswordEmailForm);
router.post("/forgot-password", userEjsController.forgotPassword);
router.get("/reset-password", userEjsController.confirmPasswordForm);
router.post("/reset-password", userEjsController.confirmPassword);

router.get(
  "/userEditForm/",
  userCheckauthenticationToken,
  userEjsController.userEditForm
);
router.post("/userEdit/:id", userEjsController.userEdit);

module.exports = router;
