const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SectionSchema = new Schema(
  {
    pageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Page",
      required: true,
    }, // Connect section to a page
    type: {
      type: String,
      required: true,
      enum: ["banner", "rich_text", "product_feature"],
    },
    order: { type: Number, required: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

module.exports = { SectionSchema };
