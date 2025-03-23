const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const storeSchema = new Schema(
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
    colorTheme: {
      type: Object,
      required: true,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const UserModal = mongoose.model("store", userSchema);

module.exports = { UserModal };
