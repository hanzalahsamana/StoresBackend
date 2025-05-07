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
          },
          options: {
            type: [String],
            required: true,
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
    Discounts: {
      type: [
        {
          name: { type: String, required: true }, // e.g., "NEWYEAR2025"
          description: { type: String },

          // Type of discount trigger
          discountType: {
            type: String,
            enum: ["coupon", "auto"],
            required: true,
          },

          // Who can use this discount
          access: {
            type: String,
            enum: ["all", "subscription", "non-subscription"],
            default: "all",
          },

          // Value of discount
          amountType: {
            type: String,
            enum: ["fixed", "percent"], // fixed: $10, percent: 10%
            required: true,
          },
          amount: { type: Number, required: true }, // e.g., 10 or 15%

          // Validity period
          startDate: { type: Date, required: true },
          endDate: { type: Date, required: true },

          // Usage limits
          usageLimit: { type: Number }, // Max number of times this discount can be used
          usageCount: { type: Number, default: 0 }, // Internal tracking

          // Minimum cart value for discount to apply
          minCartValue: { type: Number, default: 0 },

          // Whether the discount is active
          isActive: { type: Boolean, default: true },
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
