const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const urlRegex = /^(https?:\/\/[^\s]+)/;

const productSchema = new Schema({
  name: { type: String, required: true },
  alt: { type: String, required: true },
  brand: { type: String, required: true },
  originalPrice: { type: String, required: true },
  discountedPrice: { type: String, required: true },
  discount: { type: String, required: true },
  // Make 'image' an array of strings to store multiple image URLs
  images: { type: [String], required: true }, // Array of image paths

  collectionName: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
});

const ProductModal = mongoose.model("products", productSchema);

module.exports = { ProductModal };
