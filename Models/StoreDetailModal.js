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
            enum: ["fixed", "percent"], // fixed: ₹100, percent: 10%
            required: true,
          },
          amount: { type: Number, required: true }, // e.g., 100 or 15%

          // Optional: Max discount cap (only applies to percent discounts)

          // Minimum order value to apply this discount
          minOrderAmount: { type: Number, default: 0 }, // in rupees

          // Discount validity
          isActive: { type: Boolean, default: true },

          expiryDate: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // default to 1 week
          },

          // Usage limits
          usageLimit: { type: Number, default: null }, // total uses allowed
          usagePerUser: { type: Number, default: null }, // limit per user

          // Optional: Notes
          description: { type: String, default: "" },

          createdAt: { type: Date, default: Date.now },
          updatedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
      required: true,
    },

    // announcements:{

    // }
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
