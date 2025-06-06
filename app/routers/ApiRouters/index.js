const express = require("express");
const router = express.Router();
const userRouter = require("./userRouter");
const tourRouter = require("./tourRouter");

// nnn
router.use("/user", userRouter);
router.use("/tour", tourRouter);

module.exports = router;
