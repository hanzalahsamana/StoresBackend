const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const contactSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically adds current time
  },
});

module.exports = { contactSchema };
