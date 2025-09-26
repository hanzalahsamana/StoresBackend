const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const contactSchema = new Schema({
  storeRef: {
    type: Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
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

const ContactModel = mongoose.model("contacts", contactSchema);
module.exports = { ContactModel };
