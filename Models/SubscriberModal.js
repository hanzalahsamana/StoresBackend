const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema({
  storeRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  subscribedAt: { type: Date, default: Date.now },
});

const SubscriberModel = mongoose.model("subscribers", subscriberSchema);

module.exports = { SubscriberModel }; 
