const express = require("express");
const router = express.Router();
const userEjsRouter = require("./userEjsRouter");
const homeEjsRouter = require("./homeRouter");
const adminEjsRouter = require("./adminRouter");
const bookingEjsRouter = require("./bookingEjsRouter");
const reviewEjsRouter = require("./reviewEjsRouter");
const checkAuthentication = require("../../middleware/checkAuthentication");

router.use(checkAuthentication);

router.use(homeEjsRouter);
router.use(userEjsRouter);
router.use(bookingEjsRouter);
router.use(reviewEjsRouter);
router.use("/admin", adminEjsRouter);

module.exports = router;
