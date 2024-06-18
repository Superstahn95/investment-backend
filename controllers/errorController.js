const CustomError = require("../utils/customError");
const devErrors = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    stack: err.stackTrace,
    message: err.message,
  });
};
//complete error handling
const prodErrors = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(err.statusCode).json({
      status: "error",
      message: "Something went wrong with server",
    });
  }
};
const validationError = (err) => {
  const error = Object.values(err.errors).map((val) => {
    return val.message;
  });
  const errorMessages = error.join(". ");
  const message = `Invalid input data: ${errorMessages}`;
  return new CustomError(message, 400);
};

const duplicateKeyError = (err) => {
  const message = `The ${Object.keys(err.keyValue)} already exists`;
  return new CustomError(message, 400);
};
const castErrorHandler = (err) => {
  const message = `Invalid  ${err.path} value`;
  return new CustomError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === "development") {
    return devErrors(err, res);
  } else if (process.env.NODE_ENV === "production") {
    if (err.name === "ValidationError") err = validationError(err);
    if (err.code === 11000) err = duplicateKeyError(err);
    if (err.name === "CastError") err = castErrorHandler(err);
    return prodErrors(err, res);
  }
};
