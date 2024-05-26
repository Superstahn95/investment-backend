const Deposit = require("../models/Deposit");
const User = require("../models/User");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const cloudinary = require("../utils/cloudinary");
const CustomError = require("../utils/customError");
// const sendMail = require("../utils/emailUser");

//get all deposits for admin
exports.getDepositHistory = asyncErrorHandler(async (req, res, next) => {
  const deposits = await Deposit.find()
    .populate("user")
    .sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    deposits,
  });
});

// get an individual deposit by an id
exports.getIndividualUserDeposits = asyncErrorHandler(
  async (req, res, next) => {
    //we are getting the user in the req.user from our protected middleware
    const deposits = await Deposit.find({ user: req.user._id });
    res.status(200).json({
      status: "success",
      deposits,
    });
  }
);

// make deposit
exports.makeDeposit = asyncErrorHandler(async (req, res, next) => {
  const { amount } = req.body;
  //we have the user trying to make a deposit from the protected middleware already
  const deposit = new Deposit({
    user: req.user._id,
    amount,
  });
  //upload file to cloudinary
  const { file } = req;
  if (file) {
    const { secure_url: url, public_id } = await cloudinary.uploader.upload(
      file.path
    );
    deposit.receipt = { url, public_id };
  }
  await deposit.save();
  //go to the user and update the pending balance
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { pendingDeposit: amount },
  });

  //send mail to confirm deposit

  //   sendMail(
  //     req.user,
  //     "Placed Deposit",
  //     `Your deposit of $${deposit.amount} has been made and pending approval`
  //   );

  res.status(201).json({
    status: "success",
    message: `deposit of $${amount} received pending approval`,
  });
});

//patch request
//private route to be accessed by admin only
exports.approveDeposit = asyncErrorHandler(async (req, res, next) => {
  //the id of that deposit should be in the body of our request
  const { id } = req.body;
  const deposit = await Deposit.findById(id);

  // throw error if deposit doesn't exist
  if (!deposit) {
    const err = new CustomError("No deposit found", 404);
    return next(err);
  }
  // throw error if deposit has already been approved
  if (deposit.approved) {
    const err = new CustomError("Deposit has already been approved", 402);
    return next(err);
  }
  //change the approved state of the deposit field to true
  const updateDeposit = await Deposit.findByIdAndUpdate(
    id,
    { approved: true },
    { new: true, runValidators: true }
  );
  //get the user reference of the deposit field, locate the user with that id, decrease and increase appropriate fields
  await User.findByIdAndUpdate(deposit.user, {
    $inc: {
      pendingDeposit: -deposit.amount,
      approvedBalance: deposit.amount,
      totalDeposit: deposit.amount,
    },
  });

  //send mail showing it has been approved

  //   sendMail(
  //     req.user,
  //     "Approved Deposit",
  //     `Your deposit of $${deposit.amount} has been approved. You can now invest in a plan of your choice`
  //   );
  //send back response
  //try firing a mail here to the user=> solve this
  //for deposit approval, we will be using nodemailer
  res.status(200).json({
    status: "success",
    message: `$${deposit.amount} has been approved`,
  });
});

//decline and delete deposit after
exports.declineDeposit = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  //when we decline deposit, we want to delete the record of that deposit from the user
  const deposit = await Deposit.findById(id);
  if (!deposit) {
    const err = new CustomError("Deposit not found", 404);
    return next(err);
  }
  await User.findByIdAndUpdate(
    id,
    {
      $inc: {
        pendingDeposit: -deposit.amount,
      },
    },
    { new: true }
  );
  await Deposit.findByIdAndDelete(id);
  //after declining deposit, i believe we should take it off the users pending deposit or balance because that can just be a forged transaction
  res.status(200).json({
    status: "success",
    message: `$${deposit.amount} has been declined and deleted`,
  });
});

// delete deposit entry
exports.deleteDeposit = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const deposit = await Deposit.findById(id);
  if (!deposit) {
    const err = new CustomError("Deposit not found", 404);
    return next(err);
  }
  await Deposit.findByIdAndDelete(id);
  res.status(200).json({
    status: "success",
    message: `Deposit deleted successfully`,
  });
});
