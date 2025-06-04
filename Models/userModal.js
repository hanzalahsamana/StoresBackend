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

    lastOpenedStore: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const UserModal = mongoose.model("User", userSchema);

module.exports = { UserModal };
