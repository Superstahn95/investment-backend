const express = require("express");
const {
  deleteUser,
  getUser,
  getUsers,
} = require("../controllers/userController");
const { isAuth } = require("../middlewares/checkAuth");
const { checkUserRole } = require("../middlewares/checkRole");
const router = express.Router();

//protected for just admin
router.get("/", isAuth, checkUserRole("admin"), getUsers);
router.get("/:id", isAuth, checkUserRole("admin"), getUser);
router.delete("/", isAuth, checkUserRole("admin"), deleteUser);
//manually crediting a user route should be handled

module.exports = router;
