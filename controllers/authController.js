const asyncErrorHandler = require("../utils/asyncErrorHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const CustomError = require("../utils/customError");
// const { sendMail } = require("../utils/emailUser");

exports.registerUser = asyncErrorHandler(async (req, res, next) => {
  //create a user

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

exports.loginUser = asyncErrorHandler(async (req, res, next) => {
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

exports.reAuthenticate = asyncErrorHandler(async (req, res, next) => {
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

exports.protected = asyncErrorHandler(async (req, res, next) => {
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
  try {
    const accessToken = generateAccessToken(req.user?.id);
    const responseData = { token: accessToken };
    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
});

// exports.restricted = asyncErrorHandler(async (req, res, next) => {});

exports.checkUserRole = (role) => {
  //if i want to grant permission to different roles, i can modify the parameter to "...role".
  //and then i can say if role.includes(req.user.role || userRole)
  return (req, res, next) => {
    const userRole = req.user.role;
    if (userRole != role) {
      const err = new CustomError(
        "You are not an admin and hence not authorized",
        403
      );
      return next(err);
    } else {
      next();
    }
  };
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

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
