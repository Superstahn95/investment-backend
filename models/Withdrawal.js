const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "amount is required"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "user id is required"],
    },
    address: {
      type: String,
      required: [true, "Wallet address is required"],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Withdrawal", withdrawalSchema);
