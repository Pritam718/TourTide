const express = require("express");
const router = express.Router();
const userEjsRouter = require("./userEjsRouter");
const homeEjsRouter = require("./homeRouter");

router.use("/user", userEjsRouter);
router.use("/tour", homeEjsRouter);

module.exports = router;
