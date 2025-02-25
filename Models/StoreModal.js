const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    brandName: {
      type: String,
      required: true,
      unique: true,
    },
    subDomain: {
      type: String,
      required: true,
    },
    customDomain: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const UserModal = mongoose.model("users", userSchema);

module.exports = { UserModal };