const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  image: { type: String, required: true, unique: true },
  link: { type: String, required: true, unique: true },
});

module.exports = { categorySchema };
