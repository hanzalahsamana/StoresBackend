const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    variant: { type: Object }, // Add if variants exist (e.g. size, color)
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String },
    address: { type: String, required: true },
    apartment: { type: String },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    }, // Optional for guest checkout

    customer: addressSchema,
    shippingAddress: addressSchema,

    orderItems: {
      type: [orderItemSchema],
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["credit_card", "paypal", "cash_on_delivery", "bank_transfer"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    taxAmount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    trackingInfo: {
      carrier: { type: String },
      trackingNumber: { type: String },
      estimatedDelivery: { type: Date },
    },

    notes: { type: String },

    storeRef: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel = mongoose.model("Order", OrderSchema);
module.exports = { OrderModel };
