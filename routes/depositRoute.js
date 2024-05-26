const express = require("express");
const { isAuth } = require("../middlewares/checkAuth");
const { checkUserRole } = require("../middlewares/checkRole");
const {
  approveDeposit,
  declineDeposit,
  deleteDeposit,
  getDepositHistory,
  getIndividualUserDeposits,
  makeDeposit,
} = require("../controllers/depositController");
const multer = require("../middlewares/multer");
const router = express.Router();

//deposit history
//should be restricted for admin only
router.get("/", isAuth, getDepositHistory);

//get individual user deposit
router.get("/mydeposits", isAuth, getIndividualUserDeposits);

//payment evidence should be uploaded and fired to mail here
router.post("/", isAuth, multer.single("receipt"), makeDeposit);

//this route is to be changed to an admin only route later on
router.patch("/", isAuth, checkUserRole("admin"), approveDeposit);

//declining and deleting a deposit
router.delete("/decline/:id", checkUserRole("admin"), declineDeposit);

//deleting deposit
router.delete("/:id", isAuth, checkUserRole("admin"), deleteDeposit);

module.exports = router;
