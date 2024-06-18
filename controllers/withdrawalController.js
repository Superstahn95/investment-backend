const Withdrawal = require("../models/Withdrawal");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/customError");

//get all withdrawal request for admin
exports.getWithdrawals = asyncErrorHandler(async (req, res, next) => {
  const withdrawals = await Withdrawal.find()
    .populate("user")
    .sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    withdrawals,
  });
});

//get a user's withdrawal history
exports.getIndividualWithdrawalHistory = asyncErrorHandler(
  async (req, res, next) => {
    const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({
      status: "success",
      withdrawals,
    });
  }
);

//create a new withdrawal request
exports.createWithdrawalRequest = asyncErrorHandler(async (req, res, next) => {
  //get validated data from the body of the request
  const { amount, address } = req.body;
  const newRequest = new Withdrawal({ amount, address, user: req.user });
  await newRequest.save();
  //grab user and carry out neccessary deductions from the respective user fields
  const user = await User.findById(newRequest.user);
  user.withdrawableFunds = user.withdrawableFunds - amount;
  await user.save({ validateBeforeSave: false });
  //send mail to user saying request has been received
  res.status(200).json({
    status: "success",
    message: `Your withdrawal request of ${amount} has been received and is currently being processed`,
    amountRequested: amount,
  });
});

exports.approveWithdrawal = asyncErrorHandler(async (req, res, next) => {
  //getting withdrawal id from the params
  const { id } = req.params;
  const withdrawal = await Withdrawal.findById(id);
  if (!withdrawal) {
    const err = new CustomError("Withdrawal request not found", 404);
    return next(err);
  }

  const user = await User.findById(withdrawal.user);
  if (!user) {
    const err = new CustomError(
      "User with this withdrawal request not found",
      404
    );
    return next(err);
  }

  const updatedWithdrawal = await Withdrawal.findByIdAndUpdate(
    id,
    {
      $set: {
        isPaid: true,
      },
    },
    { new: true }
  );
  //send email to user updating them on withdrawal
  await Transaction.create({
    amount: withdrawal.amount,
    type: "withdrawal",
    user: withdrawal.user,
  });
  //grab user and carry out routine increment and decrement from pending and paid withdrawal
  // after payout, decrease investedFundsAndReturns and top up totalWithdrawals
  await User.findByIdAndUpdate(withdrawal.user, {
    $inc: {
      totalWithdrawal: withdrawal.amount,
      investedFundsAndReturns: -withdrawal.amount,
    },
  });
  res.status(200).json({
    status: "success",
    message: `withdrawal of $${updatedWithdrawal.amount} has been paid`,
  });
});
exports.deleteWithdrawalRequest = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const deletedWithdrawal = await Withdrawal.findByIdAndDelete(id);
  if (!deletedWithdrawal) {
    const err = new CustomError("Withdrawal not found", 404);
    return next(err);
  }
});
