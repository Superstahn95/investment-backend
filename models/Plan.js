const mongoose = require("mongoose");

//plan structure
//name, gift bonus, minimum price, maximum price, minimum return (not needed for now), maximum return (not needed for now), top up interval(duration),
//top up type (percentage or amount) , top up amount (percentage or amount), investment duration
const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "Enter plan name"],
    },
    minimumPrice: {
      type: Number,
      required: [true, "Enter minimum price for the plan"],
    },
    maximumPrice: {
      type: Number,
      required: [true, "Enter a minimum price for the plan"],
    },
    topUpMode: {
      type: String,
      // required: [true, "Select a top up mode"],
    },
    topUpAmount: {
      type: Number, //when in use, we are going to take this as percentage
      required: [true, "Enter a top up amount"],
    },
    duration: {
      type: Number,
      required: [true, "Enter plan duration"],
    },
    topUpInterval: {
      type: String, //daily, weekly, monthly, yearly
      // required: [true, "Enter top up interval"],
    },
    giftBonus: {
      type: Number,
    },
  },
  { timestamps: true }
);

//automated presave function to convert possibly all strings to integers in our backend

module.exports = mongoose.model("Plan", planSchema);
