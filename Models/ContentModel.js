const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contentSchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  text: { type: String, default: "" },
  buttonText: { type: String, default: "" },
  image: {
    type: String,
    default:
      "https://res.cloudinary.com/duaxitxph/image/upload/v1736247980/cjzl4ivq2lduxqbtnfj1.webp",
  },
  faqs: [{ Q: String, A: String }],
  video: { type: String, default: "" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },

  storeRef: { type: Schema.Types.ObjectId, ref: "Store", required: true },
  updatedAt: { type: Date, default: Date.now },
});

const ContentModel = mongoose.model("Content", contentSchema);

module.exports = { ContentModel };
