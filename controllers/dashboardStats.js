const asyncErrorHandler = require("../utils/asyncErrorHandler");
const Deposit = require("../models/Deposit");
const User = require("../models/User");
const Plan = require("../models/Plan");

exports.getDashboardSummary = asyncErrorHandler(async (req, res, next) => {
  const totalDeposits = await Deposit.aggregate([
    { $match: { approved: true } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const pendingDeposits = await Deposit.aggregate([
    { $match: { approved: false } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalUsers = await User.countDocuments();
  const totalPlans = await Plan.countDocuments();
  res.status(200).json({
    status: "success",
    totalDeposits: totalDeposits[0]?.total || 0,
    pendingDeposits: pendingDeposits[0]?.total || 0,
    totalUsers,
    totalPlans,
  });
});
