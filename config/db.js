const mongoose = require("mongoose");

const connectDb = async () => {
  const connectionString =
    process.env.NODE_ENV === "production"
      ? MONGODB_CONNECTION_STRING
      : MONGODB_CONNECTION_STRING;
  try {
    const conn = await mongoose.connect(connectionString);
    console.log(`connected to database ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDb;
