const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: { type: String, required: true },
  vendor: { type: String },
  price: { type: Number, required: true },
  comparedAtPrice: { type: Number },
  displayImage: { type: String, required: true },
  gallery: [String],
  collections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
    },
  ],
  stock: { type: Number, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  description: { type: String },
  metaTitle: { type: String },
  metaDescription: { type: String },
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
        },
      },
    ],
    default: [],
    validate: {
      validator: function (variations) {
        const names = variations.map((v) => v.name.toLowerCase().trim());
        return names.length === new Set(names).size;
      },
      message: "Each variation name must be unique.",
    },
  },
  variants: {
    type: [
      {
        sku: { type: String, required: true },
        options: {
          type: Map,
          of: String, // Example: { Color: 'Red', Size: 'M' }
          required: true,
        },
        stock: { type: Number, required: true },
        price: { type: Number, required: true },
        image: { type: String }, // Optional: image specific to variant
      },
    ],
    default: [],
  },
  storeRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  wantsCustomerReview: { type: Boolean, default: true, required: true },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
});

const ProductModel = mongoose.model("Product", ProductSchema);

module.exports = { ProductModel };
