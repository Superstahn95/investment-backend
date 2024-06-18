const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: Number,
      required: [true, "Name is required"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Mobile number is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
