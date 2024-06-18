const jwt = require("jsonwebtoken");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const User = require("../models/User.js");
const CustomError = require("../utils/customError.js");

// middleware for protected routes
exports.isAuth = asyncErrorHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization; //Bearer Token
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return next(new CustomError("Unauthorized", 401));
  }
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    // if (!decodedToken) {
    //   return next(new CustomError("Unauthorized", 401));
    // }
    const user = await User.findOne({ _id: decodedToken.id });
    if (!user) {
      return next(new CustomError("Unauthorized", 401));
    }
    //trying to assign a value to req.user but getting a flag that property user does not exist on the req object
    req.user = user;
    next();
  } catch (error) {
    //specifying a specific error type should be cool here
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      const err = new CustomError("Forbidden", 403);
      return next(err);
    }
    next(error);
  }
});

// middleware to hit before trying to reauthenticate user when client refreshes
exports.refreshTokenCheck = asyncErrorHandler(async (req, res, next) => {
  const refreshToken = req.cookies["refresh_token"];
  if (!refreshToken) {
    return next(new CustomError("Unauthorized", 401));
  }
  try {
    //verify refresh token
    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET_KEY
    );
    // if (!decodedToken) {
    //   return next(new CustomError("Unauthorized", 401));
    // }
    const user = await User.findOne({ _id: decodedToken.id }).populate(
      "subscriptions.plan"
    );
    if (!user) {
      return next(new CustomError("User not found", 404));
    }
    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return next(new CustomError("Auth expired", 405));
    }
    next(error);
  }
});
