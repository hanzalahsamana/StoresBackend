const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const CartSchema = new Schema({
  cartId: {
    type: String,
    default: uuidv4,
    unique: true,
  },
  products: [
    {
      type: Object,
      required: true,
    },
    {
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
});

const CartModal = mongoose.model("carts", CartSchema);

module.exports = { CartModal };
