const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const userSchema = new Schema(
  {
    brandName: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: async function (value) {
          if (this.isNew || this.isModified("brandName")) {
            const existingBrand = await this.constructor.findOne({
              brandName: { $regex: new RegExp(`^${value}$`, "i") },
            });
            return !existingBrand;
          }
          return true;
        },
        message: "Brand name already exists",
      },
    },

    
    subDomain: {
      type: String,
      unique: true,
      required: true,
    },

    customDomain: {
      type: String,
      default: null,
    },

    
    isDomainVerified: {
      type: Boolean,
      default: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    brand_Id: {
      type: String,
      default: uuidv4,
      unique: true,
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
  },
  {
    timestamps: true,
  }
);

const UserModal = mongoose.model("users", userSchema);

module.exports = { UserModal };
