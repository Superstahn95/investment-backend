const Withdrawal = require("../models/Withdrawal");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/customError");

//get all withdrawal request for admin
exports.getWithdrawals = asyncErrorHandler(async (req, res, next) => {
  const withdrawals = await Withdrawal.find();
  res.status(200).json({
    status: "success",
    withdrawals,
  });
});

//get a user's withdrawal history
exports.getIndividualWithdrawalHistory = asyncErrorHandler(
  async (req, res, next) => {
    const withdrawals = await Withdrawal.find({ user: req.user._id });
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
  //send mail to user saying request has been received
  res.status(200).json({
    status: "success",
    message: `Your withdrawal request of ${amount} has been received and is currently being processed`,
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
  //grab user and carry out routine increment and decrement from pending and paid withdrawal

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
