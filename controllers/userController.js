const cron = require("node-cron");
const User = require("../models/User");
const Plan = require("../models/Plan");
const CustomError = require("../utils/customError");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const cloudinary = require("../utils/cloudinary");

//handle referral => to be done
exports.getUsers = asyncErrorHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    users,
  });
});

//getting a user
exports.getUser = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    const err = new CustomError("User not found", 404);
    return next(err);
  }
  res.status(200).json({
    status: "success",
    user,
  });
});

//deleting a user by admin
exports.deleteUser = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    const err = new CustomError("User not found", 404);
    return next(err);
  }
  await User.findByIdAndDelete(id);
  res.status(200).json({
    status: "success",
    message: `${user.name} has been deleted`,
  });
});

//debit or credit user's balance by admin
exports.debitOrCreditUser = asyncErrorHandler(async (req, res, next) => {
  const { id, action, field, amount } = req.body;
  const user = await User.findById(id);
  if (!user) {
    const err = new CustomError("User not found", 404);
    return next(err);
  }
  if (action === "debit") {
    user[field] -= amount;
  } else if (action === "credit") {
    user[field] += amount;
  } else {
    const err = new CustomError("This action is not recognized", 400);
    return next(err);
  }
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
    message: `${user.name}'s intended balance has been ${action}`,
  });
});

exports.authorizeUserLogin = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    const err = new CustomError("User not found", 404);
    return next(err);
  }

  user.isAuthorized = !user.isAuthorized;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
    message: user.isAuthorized
      ? "User has been granted access"
      : "User access has been revoked",
    user,
  });
});

//update user profile
exports.updateUser = asyncErrorHandler(async (req, res, next) => {
  //user id should be present in the req.user

  const user = await User.findById(req.user._id);

  const { file } = req;

  if (!user) {
    const err = new CustomError("No user found", 404);
    return next(err);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: req.body },
    { new: true }
  );

  if (file) {
    if (user.profilePhoto) {
      const { public_id: imageId } = user.profilePhoto;
      await cloudinary.uploader.destroy(`investment/${imageId}`);
    }
    const { secure_url: url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { folder: "investment" }
    );

    updatedUser.profilePhoto = { url, public_id };
  }
  await updatedUser.save();
  res.status(200).json({
    status: "success",
    user: updatedUser,
    message: "Details updated",
  });
});

//change password
exports.changeUserPassword = asyncErrorHandler(async (req, res, next) => {
  //get the user from req.user
  const user = await User.findById(req.user._id);
  //old password and new password should be part of the req.body
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const isPasswordMatch = await user.compareDbPassword(
    oldPassword,
    user.password
  );
  if (isPasswordMatch === false) {
    const err = new CustomError("Incorrect password", 400);
    return next(err);
  }
  if (newPassword !== confirmPassword) {
    const err = new CustomError("Passwords do not match", 400);
    return next(err);
  }

  user.password = newPassword;
  user.confirmPassword = newPassword;

  await user.save();
  res.status(200).json({
    status: "sucess",
    message: "Password has been changed",
  });
});

//toggle withdrawal status by admin
exports.changeWithdrawalStatus = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    const err = new CustomError("User not found", 404);
    return next(err);
  }
  user.isRestrictedFromWithdrawal = !user.isRestrictedFromWithdrawal;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
    message: "Withdrawal status has been changed",
  });
});

const calculateCronExpression = (frequency, startDate) => {
  //parsing startDate into date object
  const startDateObj = new Date(startDate);

  //determining cron expression based on frequency
  switch (frequency) {
    case "daily":
      //this cron expression signifies zero hour and 0 minute which is midnight(0:00)
      return "0 0 * * *";
    case "weekly":
      const weekDay = startDateObj.getDay();
      const hourOfTheDay = startDateObj.getHours();
      const minuteOfTheDay = startDateObj.getMinutes();
      const secondOfTheDay = startDateObj.getSeconds();

      return `${secondOfTheDay} ${minuteOfTheDay} ${hourOfTheDay} * * ${weekDay}`;
    case "monthly":
      const dayOfTheMonth = startDateObj.getDate();
      return `0 0 ${dayOfTheMonth} * *`;
    default:
      //using weekly as default
      return `${secondOfTheDay} ${minuteOfTheDay} ${hourOfTheDay} * * ${weekDay}`;
  }
};

const updateUserBalancePerSubscription = asyncErrorHandler(
  async (user, subscription) => {
    //the subscription here is each individual plan that the user belongs to
    //we are taking the user into this function.
    const plan = await Plan.findById(subscription.plan);
    if (!plan) {
      const err = new CustomError("Plan not found", 404);
      return new err();
    }
    //calculate increase in the user balance based on percentage and cost of the enrolled plan
    //plan.topUpAmount refers to the percentage increase for now at least
    const topUp = (plan.topUpAmount / 100) * subscription.cost;
    await User.findByIdAndUpdate(
      user.id,
      { $inc: { investedFundsAndReturns: topUp } },
      { new: true, runValidators: true }
    );
  }
);

//we need to take note of the money invested on each plans by the various users at every point in time
exports.scheduleUserBalanceUpdates = asyncErrorHandler(async () => {
  const users = await User.find();
  for (const user of users) {
    for (const subscription of user.subscriptions) {
      //check frequency and calculate cron expression
      const cronExpression = calculateCronExpression(
        subscription.frequency,
        subscription.startDate
      );

      //schedule task
      cron.schedule(
        cronExpression,
        updateUserBalancePerSubscription(user, subscription)
      );
    }
  }
});

// no need calculating con expression, since this is likely to update every day
