const express = require("express");
const router = express.Router();
const userRouter = require("./userRouter");
const tourRouter = require("./tourRouter");

router.use(userRouter);
router.use(tourRouter);

module.exports = router;
