  const mongoose = require("mongoose");
  const Schema = mongoose.Schema;

  const SectionSchema = new Schema(
    {
      type: {
        type: String,
        required: true,
        // enum: ["hero", "product_catalog", "rich_text", "collection_card"], // Optional: Restrict to known types
      },
      sectionName:{
        type: String,
        required: true,
      },
      order: {
        type: Number,
        required: true,
      },
      visibility: {
        type: Boolean,
        default: true, // Section is visible by default
      },
      content: {
        type: Object, // Flexible field for different section data
        required: true,
        default: {}, // Prevents undefined errors
      },
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt
  );

  module.exports = { SectionSchema };
