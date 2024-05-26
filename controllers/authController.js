const asyncErrorHandler = require("../utils/asyncErrorHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const CustomError = require("../utils/customError");
// const { sendMail } = require("../utils/emailUser");

//register user
export const registerUser = asyncErrorHandler(async (req, res, next) => {
  const newUser = new User(req.body);
  const user = await newUser.save();
  const refreshToken = generateRefreshToken(user._id);
  const accessToken = generateAccessToken(user._id);

  res
    .cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENVIRONMENT === "production",
      sameSite: "none",
    })
    .status(201)
    .json({
      status: "success",
      message: "user created",
      user,
      token: accessToken,
    });
});

//login user
export const loginUser = asyncErrorHandler(async (req, res, next) => {
  console.log("Hitting this end point");
  const { email, password } = req.body;
  if (!email || !password) {
    //check on the right status codes later
    const err = new CustomError("Fill all fields", 400);
    return next(err);
  }
  //check if a user with that mail exists
  const user = await User.findOne({ email });
  if (!user) {
    const err = new CustomError("Invalid credentials", 401);
    return next(err);
  }

  const isPasswordMatch = user.compareDbPassword(password, user.password);
  if (!isPasswordMatch) {
    const err = new CustomError("Invalid credentials", 401);
    return next(err);
  }
  const refreshToken = generateRefreshToken(user._id);
  const accessToken = generateAccessToken(user._id);
  console.log("backend sending details to client");
  res
    .cookie("refresh_token", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENVIRONMENT === "production",
      sameSite: "none",
    })
    .status(201)
    .json({
      status: "success",
      message: "user created",
      user,
      token: accessToken,
    });
});

//reauthenticate user 1
export const reAuthenticate = asyncErrorHandler(async (req, res, next) => {
  const token = req.body.token;
  if (!token) {
    const err = new CustomError("No token!! Not authenticated", 401);
    return next(err);
  }
  //verify or decode token
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decodedToken.id);
  if (!user) {
    const err = new CustomError("User not found", 404);
    return next(err);
  }

  res.status(200).json({
    status: "success",
    user,
  });
});

//check if user is authenticated

export const protect = asyncErrorHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    const err = new CustomError("Log in or sign up", 401);
    return next(err);
  }
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decodedToken.id);
  if (!user) {
    const err = new CustomError("User not found", 404);
    return next(err);
  }
  req.user = user;
  next();
});
export const refreshToken = asyncErrorHandler(async (req, res, next) => {
  //our request is going to have a user property
  const accessToken = generateAccessToken(req.user?.id);
  const responseData = { token: accessToken };
  res.status(200).json(responseData);
});

// exports.restricted = asyncErrorHandler(async (req, res, next) => {});

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY_TIME,
  });
};
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY_TIME,
  });
};
