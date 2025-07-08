const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SectionSchema = new Schema(
  {
    storeRef: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    name: {
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
