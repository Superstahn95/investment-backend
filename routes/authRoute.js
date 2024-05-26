const express = require("express");
const { isAuth, refreshTokenCheck } = require("../middlewares/checkAuth");
const {
  refreshToken,
  loginUser,
  registerUser,
} = require("../controllers/authController");
const { isAuth, refreshTokenCheck } = require("../middlewares/checkAuth");
const { checkUserRole } = require("../middlewares/checkRole");
const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/refreshToken", refreshToken);
// router.get(
//   "/check-role",
//   isAuth,
//   checkUserRole("admin"),
//   (req, res, next) => {
//     res.status(200).json({
//       status: "success",
//       message: "You are an admin and hence can access this endpoint",
//     });
//   }
// );

module.exports = router;
