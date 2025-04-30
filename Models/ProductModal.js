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
  description: { type: String },

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
          validate: [
            (val) => val.length > 0,
            "At least one option is required.",
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

  // ✅ Specific variant combinations (e.g., Red / M)
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
});

module.exports = { productSchema };
