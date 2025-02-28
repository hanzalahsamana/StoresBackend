const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const pageSchema = new Schema(
//   {
//     title: { type: String, required: true }, // Page title (e.g., Home, About)
//     slug: { type: String, required: true, unique: true }, // Unique identifier (e.g., "home", "about-us")
//   },
//   { timestamps: true }
// );



const pageSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },

  text: { type: String, default: "" },
  buttonText: { type: String, default: "" },
  image: { type: String, default: "https://res.cloudinary.com/duaxitxph/image/upload/v1736247980/cjzl4ivq2lduxqbtnfj1.webp" },
  faqs: [{ Q: String, A: String }],
  video: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },

  updatedAt: { type: Date, default: Date.now },
});

// const PageModel = mongoose.model("Page", pageSchema);

module.exports = { pageSchema };
