const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

//i need to make a subscription schema
const subscriptionSchema = new mongoose.Schema({
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  frequency: {
    type: String,
    required: true,
  },
  startDate: Date,
});

//there should be a reference to a plan as part of the userSchema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please enter your email"],
    validate: [validator.isEmail, "Enter a valid email address"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Please enter your phone number"],
  },
  profilePhoto: {
    type: Object,
    secure_url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  approvedBalance: {
    type: Number,
    default: 0, //how do i actually restrict this information from being sent to my backend from the frontend?
  },
  totalDeposit: {
    type: Number,
    default: 0,
  },
  pendingDeposit: {
    type: Number,
    default: 0,
  },
  investedFundsAndReturns: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isRestrictedFromWithdrawal: {
    type: Boolean,
    default: false,
  },
  withdrawableFunds: {
    type: String,
    default: 0,
  },
  subscriptions: [subscriptionSchema], //We are actually using a schema here without creating a collection in our db
  password: {
    type: String,
    required: [true, "Please enter your password"],
  },
  isAuthorized: {
    type: Boolean,
    default: false,
  },
  confirmPassword: {
    type: String,
    validate: {
      validator: function (val) {
        // Check if the password field is being modified
        if (this.isModified("password")) {
          return val === this.password;
        }
        // If password field is not being modified, no validation needed
        return true;
      },
      message: "Password confirmation do not match",
    },
    // Make confirmPassword required only during user creation
    required: function () {
      return this.isNew || this.isModified("password");
    },
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.confirmPassword = undefined;
});

userSchema.methods.compareDbPassword = async (password, dbPassword) => {
  return await bcrypt.compare(password, dbPassword);
};

module.exports = new mongoose.model("User", userSchema);
