const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StoreSchema = new Schema(
  {
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    orderCounter: {
      type: Number,
      default: 0,
    },
    storeStatus: {
      type: String,
      required: true,
      default: "active",
      enum: ["active", "suspended"],
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscriptions",
    },
    promoCode: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaImage: { type: String },
    refferals: {
      type: Number,
      default: 0,
    },
    branding: {
      logo: { type: String, default: null },
      favicon: { type: String, default: null },
      description: { type: String, default: "" },
      font: { type: String, default: "Arial, sans-serif" },
      theme: {
        type: String,
        default: "Light",
        enum: ["Light", "Modern Dark", "Milt Blue", "Soft Breeze"],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure subdomain uniqueness and validate fields
// StoreSchema.pre("validate", async function (next) {
//   if (this.isModified("subDomain") && this.subDomain) {
//     const baseSlug = this.subDomain
//       .trim()
//       .toLowerCase()
//       .replace(/\s+/g, "-")
//       .replace(/[^a-z0-9-]/g, "");

//     let slug = baseSlug;
//     let counter = 1;
//     const Store = this.constructor;

//     while (await Store.exists({ subDomain: slug })) {
//       slug = `${baseSlug}-${counter++}`;
//     }

//     this.subDomain = slug;
//   }
//   next();
// });

const StoreModal = mongoose.model("Store", StoreSchema);

module.exports = { StoreModal };
