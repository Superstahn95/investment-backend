const CustomError = require("../utils/customError");
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
