const express = require("express");
const { getDashboardSummary } = require("../controllers/dashboard");
const { isAuth } = require("../middlewares/checkAuth");
const { checkUserRole } = require("../middlewares/checkRole");
const { protected, checkUserRole } = require("../controllers/authController");
const router = express.Router();

router.get("/", isAuth, checkUserRole("admin"), getDashboardSummary);
module.exports = router;
