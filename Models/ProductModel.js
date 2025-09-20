const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const variantSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
  },
  options: {
    type: Map,
    of: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    vendor: { type: String },
    price: { type: Number, required: true },
    comparedAtPrice: { type: Number },
    displayImage: { type: String },
    gallery: [String],
    trackInventory: { type: Boolean, default: false, required: true },
    stock: { type: Number },
    showStock: { type: Boolean },
    pronouce: { type: String, default: "piece" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    slug: { type: String, required: true },
    description: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaImage: { type: String },
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
    variants: {
      type: [variantSchema],
      default: [],
    },
    storeRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Product", ProductSchema);

module.exports = { ProductModel };
