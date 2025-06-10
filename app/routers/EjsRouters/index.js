const express = require("express");
const router = express.Router();
const userEjsRouter = require("./userEjsRouter");
const homeEjsRouter = require("./homeRouter");
const adminEjsRouter = require("./adminRouter");
const authenticationToken = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/rbacMiddleware");

router.use(authenticationToken);

router.use("/user", userEjsRouter);
router.use("/tour", homeEjsRouter);
router.use("/admin", checkPermission("admin_record"), adminEjsRouter);

module.exports = router;
