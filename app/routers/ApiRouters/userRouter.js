const express = require("express");
const router = express.Router();
const userController = require("../../controllers/ApiControllers/userController");
const authenticationToken = require("../../middleware/auth");



router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/token", userController.createNewToken);

router.get("/dashboard", authenticationToken, userController.dashboard);

module.exports = router;
