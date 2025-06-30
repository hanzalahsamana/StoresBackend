const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/* ========== Variation Schema ========== */
const VariationSchema = new Schema({
  name: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: [
      {
        validator: function (options) {
          return options.length > 0;
        },
        message: "At least one option is required.",
      },
      {
        validator: function (options) {
          return (
            new Set(options.map((o) => o.trim().toLowerCase())).size ===
            options.length
          );
        },
        message: "Options must be unique.",
      },
    ],
  },
});

/* ========== Theme Schema ========== */
const ThemeSchema = new Schema(Object);

/* ========== Discount Schema ========== */
const DiscountSchema = new Schema({
  name: { type: String, required: true },
  discountType: {
    type: String,
    enum: ["coupon", "global"],
    required: true,
  },
  access: {
    type: String,
    enum: ["all", "subscription"],
    default: "all",
  },
  amountType: {
    type: String,
    enum: ["fixed", "percent"],
    required: true,
  },
  amount: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  expiryDate: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  usageLimit: { type: Number, default: null },
  usagePerUser: { type: Number, default: null },
  headline: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

/* ========== Payment Method Schema ========== */
const PaymentMethodSchema = new Schema({
  method: { type: String, required: true }, // e.g. "jazzcash", "easypaisa"
  label: { type: String, required: true, default: "Online Payment" },
  isEnabled: { type: Boolean, default: false },
  credentials: {
    type: Map,
    of: String, // Allows dynamic key-value pairs like merchantId, secretKey, etc.
    default: {},
  },
});

/* ========== Configuration Schema ========== */
const ConfigurationSchema = new Schema(
  {
    storeRef: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      unique: true,
    },

    theme: {
      type: ThemeSchema,
      required: true,
      default: {},
    },

    variations: {
      type: [VariationSchema],
      required: true,
      default: [],
    },

    discounts: {
      type: [DiscountSchema],
      required: true,
      default: [],
    },

    paymentMethods: {
      type: [PaymentMethodSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const ConfigurationModel = mongoose.model("Configuration", ConfigurationSchema);
module.exports = { ConfigurationModel };
