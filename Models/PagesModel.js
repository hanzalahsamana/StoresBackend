const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },

  text: { type: String, default: "" },
  buttonText: { type: String, default: "" },
  image: { type: String, default: "" },
  faqs: [{ Q: String, A: String }],
  video: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },

  updatedAt: { type: Date, default: Date.now },
});

const Page = mongoose.model("Page", pageSchema);

module.exports = Page;
