const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const storeDetailSchema = new Schema(
  {
    brandName: {
      type: String,
      required: true,
      unique: true,
    },
    brand_Id: {
      type: String,
      unique: true,
    },
    variations: {
      type: [
        {
          name: {
            type: String,
            required: true,
          },
          options: {
            type: [String],
            required: true,
            validate: [arrayLimit, "At least one option is required."],
          },
        },
      ],
      required: true,
      default: [],
      validate: {
        validator: function (variations) {
          const names = variations.map((v) => v.name.toLowerCase().trim());
          return names.length === new Set(names).size;
        },
        message: "Each variation name must be unique.",
      },
    },
    theme: {
      required: true,
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

function arrayLimit(val) {
  return val.length > 0;
}

const StoreDetailModal = mongoose.model("storeDetail", storeDetailSchema);

module.exports = { StoreDetailModal };
