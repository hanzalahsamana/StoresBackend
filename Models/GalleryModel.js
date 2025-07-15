const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    key: {
      type: String,
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    format: {
      type: String,
      default: 'unknown',
    },
    size: {
      type: Number, // in bytes
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    storeRef: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Store',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const GalleryModel = mongoose.model('Gallery', GallerySchema);
module.exports = { GalleryModel };
