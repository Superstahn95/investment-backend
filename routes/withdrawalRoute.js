const express = require("express");
const { isAuth } = require("../middlewares/checkAuth");
const { checkUserRole } = require("../middlewares/checkRole");
const {
  approveWithdrawal,
  createWithdrawalRequest,
  deleteWithdrawalRequest,
  getIndividualWithdrawalHistory,
  getWithdrawals,
} = require("../controllers/withdrawalController");

const router = express.Router();

//admin only route for getting all withdrawals
router.get("/", isAuth, checkUserRole("admin"), getWithdrawals);

//protected route for getting a user's withdrawal history
router.get("/mywithdrawals", isAuth, getIndividualWithdrawalHistory);

//admin only router for approving a withdrawal
router.patch("/:id", isAuth, checkUserRole("admin"), approveWithdrawal);

//admin only route for deleting withdrawal
router.delete("/:id", isAuth, checkUserRole("admin"), deleteWithdrawalRequest);

//protected route for creating a new withdrawal request
router.post("/", isAuth, createWithdrawalRequest);

module.exports = router;
