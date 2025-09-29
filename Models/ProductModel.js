const { required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const variantSchema = new mongoose.Schema(
  {
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
      type: Number || null,
      required: true,
      default: null,
    },
    price: {
      type: Number || null,
      required: true,
      default: null,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

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
    pronouce: { type: String, default: 'piece' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    slug: { type: String, required: true },
    totalSold: { type: Number, default: 0 },
    description: { type: String, default: '' },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    wantsCustomerReview: { type: Boolean, default: true, required: true },
    note: { type: String },
    collections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection',
      },
    ],
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    variations: {
      type: [
        new mongoose.Schema(
          {
            id: { type: String, required: true },
            name: { type: String, required: true },
            options: { type: [String], required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
    },

    variants: {
      type: [variantSchema],
      default: [],
    },
    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    storeRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
    },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model('Product', ProductSchema);

module.exports = { ProductModel };
