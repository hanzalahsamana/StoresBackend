const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SectionSchema = new Schema(
  {
    storeRef: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    type: {
      type: String,
      required: true,
      // enum: ["hero", "product_catalog", "rich_text", "collection_card"],
    },
    sectionName: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    visibility: {
      type: Boolean,
      default: true,
    },
    content: {
      type: Object,
      required: true,
      default: {},
    },
  },
  { timestamps: true },
);

SectionSchema.index({ order: 1, storeRef: 1 }, { unique: true });

const SectionModel = mongoose.model("Section", SectionSchema);

module.exports = { SectionModel };
