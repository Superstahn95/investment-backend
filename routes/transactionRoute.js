const express = require("expresss");
const { isAuth } = require("../middlewares/checkAuth");
const { getUserTransaction } = require("../controllers/transactionController");

const router = express.Router();

router.get("/", isAuth, getUserTransaction);

module.exports = router;
