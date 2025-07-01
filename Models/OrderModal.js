const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Schema = mongoose.Schema;

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    selectedVariant: { type: Object }, // Add if variants exist (e.g. size, color)
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

const paymentInfoSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'failed', 'refunded'],
      default: 'unpaid',
    },
    transactionId: {
      type: String,
      required: true,
      default: uuidv4,
    },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    customerInfo: addressSchema,

    orderItems: {
      type: [orderItemSchema],
      required: true,
    },

    paymentInfo: paymentInfoSchema,

    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },

    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    trackingInfo: {
      carrier: { type: String },
      trackingNumber: { type: String },
      estimatedDelivery: { type: Date },
    },

    notes: { type: String },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    storeRef: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel = mongoose.model('Order', OrderSchema);
module.exports = { OrderModel };
