const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const connectDb = require("./config/db");
const globalErrorHandler = require("./controllers/errorController");
// const cors = require("cors");
const corsMiddleware = require("./middlewares/cors");

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

app.use((req, res, next) => {
  let connectSrc = "'self'";
  if (process.env.NODE_ENV === "production") {
    // Replace 'example.com' with your actual domain
    connectSrc = "'self' https://investment-backend-1.onrender.com";
  } else {
    // For development, allow connections to localhost
    connectSrc += " http://localhost:5000";
  }
  res.setHeader(
    "Content-Security-Policy",
    `default-src 'self' https://api.coingecko.com; connect-src 'self' https://investment-backend-1.onrender.com https://api.coingecko.com; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: *;`
  );
  next();
});

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

//global error handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`server running on our port : ${PORT}`);
  connectDb();
});
