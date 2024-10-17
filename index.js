const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const connectDb = require("./config/db");
const globalErrorHandler = require("./controllers/errorController");
const cron = require("node-cron");
const corsMiddleware = require("./middlewares/cors");
const User = require("./models/User.js");
const Plan = require("./models/Plan.js");

process.on("uncaughtException", (err) => {
  process.exit(1);
});

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

//middlewares
// app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(corsMiddleware);

app.use(express.static("dist"));

app.get("/test", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "This is functional right now and working",
  });
});

app.use("/api/v1/auth", require("./routes/authRoute"));
app.use("/api/v1/deposit", require("./routes/depositRoute"));
app.use("/api/v1/plan", require("./routes/planRoute"));
app.use("/api/v1/users", require("./routes/userRoute"));
app.use("/api/v1/dashboard-summary", require("./routes/dashboardStatsRoute"));
app.use("/api/v1/withdrawal", require("./routes/withdrawalRoute"));
app.use("/api/v1/transaction", require("./routes/transactionRoute"));
// app.use("/api/v1/message", require("./routes/messageRoute"));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "dist", "index.html"));
// });
app.use("*", express.static("dist"));
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Page not found",
  });
});

cron.schedule("0 0 * * *", async () => {
  const users = await User.find();
  for (const user of users) {
    for (const subscription of user.subscriptions) {
      const plan = await Plan.findById(subscription.plan);
      if (!plan) {
        continue;
      }
      const topUpAmount = (plan.topUpAmount / 100) * subscription.cost;
      user.investedFundsAndReturns = user.investedFundsAndReturns + topUpAmount;
      user.totalProfit = user.totalProfit + topUpAmount;
      await user.save({ validateBeforeSave: false });
    }
  }
});

//global error handler
app.use(globalErrorHandler);

const server = app.listen(PORT, () => {
  console.log(`server running on our port : ${PORT}`);
  connectDb();
});

process.on("unhandledRejection", (err) => {
  server.close(() => {
    process.exit(1);
  });
});
