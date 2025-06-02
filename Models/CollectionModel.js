const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const collectionSchema = new Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    slug: { type: String, required: true, },
    storeRef: { type: Schema.Types.ObjectId, ref: "Store", required: true },
  },
  { timestamps: true }
);

collectionSchema.index({ name: 1, storeRef: 1 }, { unique: true });

const CollectionModel = mongoose.model("Collection", collectionSchema);

module.exports = { CollectionModel };
