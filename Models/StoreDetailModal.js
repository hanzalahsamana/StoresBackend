const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Custom validator to ensure array has at least one element
function arrayLimit(val) {
  return val.length > 0;
}

// Custom validator to check unique values inside options array (case insensitive)
function uniqueOptionsValidator(options) {
  if (!Array.isArray(options)) return false;
  const lowered = options.map((opt) => opt.toLowerCase().trim());
  return lowered.length === new Set(lowered).size;
}

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
            // unique removed here — will validate manually below
          },
          options: {
            type: [String],
            required: true,
            validate: [arrayLimit, "At least one option is required."],
            validate: [
              uniqueOptionsValidator,
              "Options must be unique inside each variation.",
            ],
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
          name: {
            type: String,
            required: true,
            // unique removed here — validate manually
          },
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
          amount: {
            type: Number,
            required: true,
          },
          minOrderAmount: {
            type: Number,
            default: 0,
          },
          isActive: {
            type: Boolean,
            default: true,
          },
          expiryDate: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          usageLimit: {
            type: Number,
            default: null,
          },
          usagePerUser: {
            type: Number,
            default: null,
          },
          headline: {
            type: String,
            default: "",
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
          updatedAt: {
            type: Date,
            default: Date.now,
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

// Pre-save middleware to validate uniqueness of discount names and variation names
storeDetailSchema.pre("save", function (next) {
  // Validate discount names uniqueness (case insensitive)
  const discountNames = this.discounts.map((d) => d.name.toLowerCase().trim());
  if (new Set(discountNames).size !== discountNames.length) {
    return next(new Error("Discount name already exist."));
  }

  // Validate variation names uniqueness (case insensitive)
  const variationNames = this.variations.map((v) =>
    v.name.toLowerCase().trim()
  );
  if (new Set(variationNames).size !== variationNames.length) {
    return next(new Error("Variation name already exist."));
  }

  // Validate options uniqueness inside each variation (extra check)
  for (const variation of this.variations) {
    const options = variation.options.map((opt) => opt.toLowerCase().trim());
    if (new Set(options).size !== options.length) {
      return next(
        new Error(
          `Options for variation '${variation.name}' must be unique.`
        )
      );
    }
  }

  next();
});

const StoreDetailModal = mongoose.model("storeDetail", storeDetailSchema);

module.exports = { StoreDetailModal };
