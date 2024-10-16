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
  imageUrl: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return urlRegex.test(v);
      },
      message: (props) => `${props.value} is not a valid URL!`,
    },
  },
  imageUrl2: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return urlRegex.test(v);
      },
      message: (props) => `${props.value} is not a valid URL!`,
    },
  },
  collectionName: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
});

const ProductModal = mongoose.model("products", productSchema);

module.exports = { ProductModal };
