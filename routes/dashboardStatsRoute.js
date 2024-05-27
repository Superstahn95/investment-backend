const express = require("express");
const { getDashboardSummary } = require("../controllers/dashboardStats");
const { isAuth } = require("../middlewares/checkAuth");
const { checkUserRole } = require("../middlewares/checkRole");
const router = express.Router();

router.get("/", isAuth, checkUserRole("admin"), getDashboardSummary);
module.exports = router;
