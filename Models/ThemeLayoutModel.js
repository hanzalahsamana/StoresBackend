const mongoose = require('mongoose');

const ThemeLayoutSchema = new mongoose.Schema({
  storeRef: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Store' },
  mode: { type: String, enum: ['draft', 'published'], default: 'published' },
  name: { type: String, required: true }, //header , footter
  data: mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now },
});

ThemeLayoutSchema.index({ storeId: 1, name: 1, mode: 1 }, { unique: true });

const ThemeLayoutModel = mongoose.model('ThemeLayout', ThemeLayoutSchema);
module.exports = { ThemeLayoutModel };
