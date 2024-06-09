const express = require("express");
const { isAuth } = require("../middlewares/checkAuth");
const { checkUserRole } = require("../middlewares/checkRole");
const {
  getUserTransaction,
  getAllTransactions,
} = require("../controllers/transactionController");

const router = express.Router();

router.get("/", isAuth, getUserTransaction);

router.get("/all", isAuth, checkUserRole("admin"), getAllTransactions);

module.exports = router;
