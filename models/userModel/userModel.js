const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // primary key

    userName: { type: String},
    email: { type: String, unique: true, required: true },
    password: { type: String },
    otp: {
      type: String,
      default: "",
    },
    profileImg: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    autoCreate: true,
  }
);

module.exports = mongoose.model("userData", userSchema);
