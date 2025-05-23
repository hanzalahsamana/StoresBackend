const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    customerInfo: {
      email: {
        type: String,
        required: true,
      },
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      method: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      postalCode: {
        type: Number,
      },
      appartment: {
        type: String,
      },
    },
    orderData: {
      type: [
        {
          type: Object,
          required: true,
        },
      ],
      required: true,
    },
    orderInfo: {
      tax: {
        type: Number,
        default: 0,
      },
      shipping: {
        type: Number,
        default: 0,
      },
      discount: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        default: "pending",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = {orderSchema};
