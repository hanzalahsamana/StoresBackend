const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const CartSchema = new Schema(
  {
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
        selectedVariant: {
          type: Object,
          default: {},
        },
      },
    ],
    storeRef: { type: Schema.Types.ObjectId, ref: "Store", required: true },
  },
  { timestamps: true },
);

const CartModel = mongoose.model("Cart", CartSchema);

module.exports = { CartModel };
