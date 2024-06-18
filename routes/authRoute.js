const express = require("express");
const {
  refreshToken,
  loginUser,
  registerUser,
  logOut,
  getNewAccessToken,
} = require("../controllers/authController");
const { refreshTokenCheck } = require("../middlewares/checkAuth");
const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/refreshToken", refreshTokenCheck, refreshToken);
router.post("/generate-token", refreshTokenCheck, getNewAccessToken);
router.post("/logout", logOut);
// router.get(
//   "/check-role",
//   isAuth,
//   checkUserRole("admin"),
//   (req, res, next) => {
//     res.status(200).json({
//       status: "success",
//       message: "You are an admin and hence can access this endpoint",
//     }//   }
// );

module.exports = router;
