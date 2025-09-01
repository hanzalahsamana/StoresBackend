
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema(
    {
        storeRef: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: true,
        },
        status: {
            type: String,
            default: "trial",
            enum: ["pending", "trial", "trial expired", "active", "cancelled"]
        },
        billingCycle: {
            type: String,
            default: null
        },
        subsStart: {
            type: Date,
            default: null
        },
        subsEnd: {
            type: Date,
            default: null
        },

    },
    {
        timestamps: true,
    }
);


const SubscriptionModel = mongoose.model('Subscriptions', SubscriptionSchema);

module.exports = { SubscriptionModel };