// models/CheckoutModel.js
const mongoose = require('mongoose');

const CheckoutSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true }, // UUID or JWT
    cartItems: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        variantSku: { type: String },
        quantity: { type: Number, required: true },
      },
    ],
    storeRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    status: { type: String, enum: ['active', 'expired'], default: 'active' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

CheckoutSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB TTL index auto-deletes expired sessions

const CheckoutModel = mongoose.model('Checkout', CheckoutSchema);
module.exports = { CheckoutModel };
