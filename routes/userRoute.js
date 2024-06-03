const express = require("express");
const {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
  changeUserPassword,
  changeWithdrawalStatus,
  debitOrCreditUser,
} = require("../controllers/userController");
const { isAuth } = require("../middlewares/checkAuth");
const { checkUserRole } = require("../middlewares/checkRole");
const multer = require("../middlewares/multer");
const router = express.Router();

//protected for just admin
router.get("/", isAuth, checkUserRole("admin"), getUsers);
//route for updating user details
router.patch("/update", isAuth, multer.single("profilePhoto"), updateUser);
router.get("/:id", isAuth, checkUserRole("admin"), getUser);
router.delete("/", isAuth, checkUserRole("admin"), deleteUser);
//manually crediting a user route should be handled

//change user password
router.patch("/change-password", isAuth, changeUserPassword);

//toggle withdrawal status
router.patch(
  "/toggle/:id",
  isAuth,
  checkUserRole("admin"),
  changeWithdrawalStatus
);

//fund user
router.patch("/fund", isAuth, checkUserRole("admin"), debitOrCreditUser);

module.exports = router;
