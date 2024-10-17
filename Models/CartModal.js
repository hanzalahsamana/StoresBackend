const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const CartSchema = new Schema({
  cartId: {
    type: String,
    default: uuidv4,
    unique: true,
  },
});

const CartModal = mongoose.model("Cart", CartSchema);

module.exports = { CartModal };
