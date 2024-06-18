const Transaction = require("../models/Transaction");
const asyncErrorHandler = require("../utils/asyncErrorHandler");

exports.getUserTransaction = asyncErrorHandler(async (req, res, next) => {
  const transactions = await Transaction.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).json({
    status: "success",
    transactions,
  });
});

exports.getAllTransactions = asyncErrorHandler(async (req, res, next) => {
  const transactions = await Transaction.find()
    .populate("user")
    .sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    transactions,
  });
});
