const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true },
  alt: { type: String, required: true },
  brand: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  discount: { type: Number, required: true },
  images: [String],
  collectionName: { type: String, required: true },
  status: { type: Boolean, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
});

module.exports = { productSchema };

