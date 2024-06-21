const asyncErrorHandler = (func) => {
  return (req, res, next) => {
    console.log("Entering asyncErrorHandler");
    func(req, res, next).catch((err) => {
      console.log("error caught in asyncErrorHandler", err);
      next(err);
    });
  };
};

module.exports = asyncErrorHandler;
