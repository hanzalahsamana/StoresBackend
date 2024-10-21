const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

// user schema
const userSchema = new Schema({
  brandName: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: async function (value) {
        const existingBrand = await this.constructor.findOne({
          brandName: { $regex: new RegExp(`^${value}$`, "i") },
        });
        return !existingBrand;
      },
      message: "Brand name already exists (case insensitive)",
    },
  },

  name: {
    type: String,
    required: true,
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
});

const UserModal = mongoose.model("users", userSchema);

module.exports = { UserModal };
