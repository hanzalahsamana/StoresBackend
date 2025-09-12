const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema(
  {
    storeRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscriptions",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "failed", "paid"],
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const PaymentHistoryModel = mongoose.model(
  "Payment History",
  paymentHistorySchema
);
module.exports = { PaymentHistoryModel };
