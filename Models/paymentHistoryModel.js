const mongoose = require("mongoose");

const paymentHistorySchema = new mongoose.Schema(
    {
        paymentId: {
            type: String,
            required: true,
        },
        plan: {
            type: String,
            required: true,
        },
        period: {
            type: String,
            required: true,
        },
        startPeriod: {
            type: Date,
            required: true,
        },
        endPeriod: {
            type: Date,
            required: true,
        },
        paidAt: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true,
        },
        storeRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true,
        },
    },
    { timestamps: true },
);

const PaymentHistoryModel = mongoose.model("Payment History", paymentHistorySchema);
module.exports = { PaymentHistoryModel };
