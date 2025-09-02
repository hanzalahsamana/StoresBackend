const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema(
    {
        subscriptionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        imageUrl: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true },
);

const PaymentHistoryModel = mongoose.model("Payment History", paymentHistorySchema);
module.exports = { PaymentHistoryModel };
