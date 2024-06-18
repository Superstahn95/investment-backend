const express = require("express");
const {
  createMessage,
  getMessages,
} = require("../controllers/messageController");
const { isAuth } = require("../middlewares/checkAuth");
const { checkUserRole } = require("../middlewares/checkRole");

const router = express.Router();

router.get("/", isAuth, checkUserRole("admin"), getMessages);

router.post("/", createMessage);

module.exports = router;
