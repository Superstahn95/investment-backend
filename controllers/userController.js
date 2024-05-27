const cron = require("node-cron");
const User = require("../models/User");
const Plan = require("../models/Plan");
const CustomError = require("../utils/customError");
const asyncErrorHandler = require("../utils/asyncErrorHandler");

//handle referral => to be done
exports.getUsers = asyncErrorHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    users,
  });
});

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

//admin
exports.debitOrCreditUser = asyncErrorHandler(async (req, res, next) => {});

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
    console.log("A user balance has been updated");
  }
);
