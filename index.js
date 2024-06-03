const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const connectDb = require("./config/db");
const globalErrorHandler = require("./controllers/errorController");
const cors = require("cors");
const corsMiddleware = require("./middlewares/cors");
// const { scheduleUserBalanceUpdates } = require("./controllers/userController");
// const corsMiddleware = require("./middlewares/cors");

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

//middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(cookieParser());
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(corsMiddleware);

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
app.use("*", (req, res) => {
  res.status(404).json({
    messaege: "Page not found",
  });
});

//global error handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`server running on our port : ${PORT}`);
  connectDb();
});
