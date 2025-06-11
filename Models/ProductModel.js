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
  stock: { type: Number, required: true },
  showStock: { type: Boolean, default: true, required: true },
  pronouce: { type: String, default: "piece" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  description: { type: String },
  metaTitle: { type: String },
  metaDescription: { type: String },
  wantsCustomerReview: { type: Boolean, default: true, required: true },
  note: { type: String },
  collections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
    },
  ],
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
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
        },
      },
    ],
    default: [],
  },
  variantRules: {
    type: [
      {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    ],
    default: [],
  },
  storeRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
});

const ProductModel = mongoose.model("Product", ProductSchema);

module.exports = { ProductModel };
