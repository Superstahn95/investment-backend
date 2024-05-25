const jwt = require("jsonwebtoken");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const User = require("../models/User.js");
const CustomError = require("../utils/customError.js");

// middleware for protected routes
export const isAuth = asyncErrorHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization; //Bearer Token
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return next(CustomError("Forbidden", 403));
  }
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
    if (!decodedToken) {
      return next(CustomError("Unauthorized", 401));
    }
    const user = await User.findOne({ _id: decodedToken.id });
    if (!user) {
      return next(CustomError("User not found", 404));
    }
    //trying to assign a value to req.user but getting a flag that property user does not exist on the req object
    req.user = user;
    next();
  } catch (error) {
    //specifying a specific error type should be cool here
    console.log(`we caught an error with this ${error.name}`);
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return next(CustomError("Unauthorized", 401));
    }
    next(error);
  }
});

// middleware to hit before trying to reauthenticate user when client refreshes
export const refreshTokenCheck = asyncErrorHandler(async (req, res, next) => {
  const refreshToken = req.cookies["refresh_token"];
  if (!refreshToken) {
    console.log("There is an absence of refresh token");
    return next(CustomError("Unauthenticated", 401));
  }
  try {
    //verify refresh token
    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET_KEY
    );
    if (!decodedToken) {
      return next(CustomError("Unauthorized", 401));
    }
    const user = await User.findOne({ _id: decodedToken.id });
    if (!user) {
      return next(CustomError(401, "Unauthorized"));
    }
    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return next(CustomError(401, "Unauthorized"));
    }
    next(error);
  }
});
