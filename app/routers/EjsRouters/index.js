const express = require("express");
const router = express.Router();
const userEjsRouter = require("./userEjsRouter");
const homeEjsRouter = require("./homeRouter");
const adminEjsRouter = require("./adminRouter");
const checkAuthentication = require("../../middleware/checkAuthentication");

router.use(checkAuthentication);

router.use(homeEjsRouter);
router.use(userEjsRouter);
router.use("/admin", adminEjsRouter);

module.exports = router;
