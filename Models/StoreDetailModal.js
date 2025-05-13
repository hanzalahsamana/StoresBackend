const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const storeDetailSchema = new Schema(
  {
    brandName: {
      type: String,
      required: true,
      unique: true,
    },
    brand_Id: {
      type: String,
      required: true,
      unique: true,
    },
    variations: {
      type: [
        {
          name: {
            type: String,
            required: true,
            unique: true,
          },
          options: {
            type: [String],
            required: true,
            unique: true,
            validate: [arrayLimit, "At least one option is required."],
          },
        },
      ],
      required: true,
      default: [],
      validate: {
        validator: function (variations) {
          const names = variations.map((v) => v.name.toLowerCase().trim());
          return names.length === new Set(names).size;
        },
        message: "Each variation name must be unique.",
      },
    },
    theme: {
      required: true,
      type: Object,
      default: {},
    },
    discounts: {
      type: [
        {
          name: { type: String, required: true, unique: true }, // e.g., "NEWYEAR2025"

          // Type of discount trigger
          discountType: {
            type: String,
            enum: ["coupon", "global"],
            required: true,
          },

          // Who can use this discount
          access: {
            type: String,
            enum: ["all", "subscription"],
            default: "all",
          },
          

          // Value of discount
          amountType: {
            type: String,
            enum: ["fixed", "percent"], // fixed: $10, percent: 10%
            required: true,
          },
          amount: { type: Number, required: true }, // e.g., 10 or 15%

          // Whether the discount is active
          isActive: { type: Boolean, default: true },

          expiryDate: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // default to one week from now
          },
        },
      ],
      default: [],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

function arrayLimit(val) {
  return val.length > 0;
}

const StoreDetailModal = mongoose.model("storeDetail", storeDetailSchema);

module.exports = { StoreDetailModal };
