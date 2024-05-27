const cors = require("cors");
const CustomError = require("../utils/customError");
const allowedOrigins = require("../config/allowedOrigins");

const corsOptions = {
  origin: (origin, callback) => {
    console.log(allowedOrigins);
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      const err = new CustomError("Not allowed by cors", 403);
      console.log("cors error");
      callback(err);
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
};
module.exports = cors(corsOptions);
