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
      // This will now store the full product data
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

const CartModal = mongoose.model("Cart", CartSchema);

module.exports = { CartModal };
