// to be changed in production
// const allowedOrigins =
//   process.env.NODE_ENV === "development"
//     ? ["http://localhost:5173"]
//     : ["nothing yet"];

const devAllowedOrigins = ["http://localhost:5173"];
const prodAllowedOrigins = ["https://investment-build-client.onrender.com"];

// to be handled better

module.exports = prodAllowedOrigins;
