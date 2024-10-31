const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true },
  alt: { type: String, required: true },
  brand: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  discount: { type: Number },
  images: [String],
  collectionName: { type: String, required: true },
  stock: { type: Number, required: true },
  type: { type: String },
  size: [String],
  discription: { type: String },
});

module.exports = { productSchema };
