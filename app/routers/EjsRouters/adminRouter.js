const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("adminDashboard");
});
router.get("/form", (req, res) => {
  res.render("adminForm");
});
router.get("/table", (req, res) => {
  res.render("adminTable");
});

module.exports = router;
