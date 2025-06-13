const express = require("express");
const router = express.Router();
const homeController = require("../../controllers/EjsControllers.js/HomeController");
const authenticationToken = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/rbacMiddleware");

router.get("/", homeController.homePage);
router.get(
  "/about",
  authenticationToken,
  checkPermission("create_record"),
  homeController.aboutPage
);

module.exports = router;
