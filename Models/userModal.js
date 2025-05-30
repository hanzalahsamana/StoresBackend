const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    otp: {
      type: String,
    },

    otpExpiration: {
      type: Date,
    },

    lastOtpSentAt: {
      type: Date,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    method: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },
  },
  {
    timestamps: true,
  }
);

const UserModal = mongoose.model("users", userSchema);

module.exports = { UserModal };
