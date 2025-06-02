const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Helpers
function arrayLimit(val) {
  return Array.isArray(val) && val.length > 0;
}

function uniqueOptionsValidator(options) {
  const lowered = options.map((opt) => opt.toLowerCase().trim());
  return lowered.length === new Set(lowered).size;
}

const StoreSchema = new Schema(
  {
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    storeName: {
      type: String,
      required: true,
    },
    storeType: {
      type: String,
      required: true,
    },
    subDomain: {
      type: String,
      unique: true,
      required: true,
    },
    customDomain: {
      type: String,
      default: null,
    },
    isDomainVerified: {
      type: Boolean,
      default: false,
    },
    variations: {
      type: [
        {
          name: { type: String, required: true },
          options: {
            type: [String],
            required: true,
            validate: [
              arrayLimit,
              "At least one option is required.",
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
      type: Object,
      required: true,
      default: {},
    },
    discounts: {
      type: [
        {
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

// Ensure subdomain uniqueness and validate fields
StoreSchema.pre("validate", async function (next) {
  // Auto-generate unique subDomain
  if (this.isModified("subDomain") && this.subDomain) {
    const baseSlug = this.subDomain
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    let slug = baseSlug;
    let counter = 1;
    const Store = this.constructor;

    while (await Store.exists({ subDomain: slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    this.subDomain = slug;
  }

  // Validate discount names uniqueness
  const discountNames = this.discounts.map((d) => d.name.toLowerCase().trim());
  if (new Set(discountNames).size !== discountNames.length) {
    return next(new Error("Discount name already exists."));
  }

  // Validate variation names uniqueness
  const variationNames = this.variations.map((v) =>
    v.name.toLowerCase().trim()
  );
  if (new Set(variationNames).size !== variationNames.length) {
    return next(new Error("Variation name already exists."));
  }

  // Validate options uniqueness inside each variation
  for (const variation of this.variations) {
    const options = variation.options.map((opt) =>
      opt.toLowerCase().trim()
    );
    if (new Set(options).size !== options.length) {
      return next(
        new Error(`Options for variation '${variation.name}' must be unique.`)
      );
    }
  }

  next();
});

const StoreModal = mongoose.model("Store", StoreSchema);

module.exports = { StoreModal };
