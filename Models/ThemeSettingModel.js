const mongoose = require('mongoose');

const ThemeCustomizationSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Store' },
  mode: { type: String, enum: ['draft', 'published'], default: 'draft' },
  updatedAt: { type: Date, default: Date.now },

  layout: { type: String, enum: ['boxed', 'full-width'], default: 'full-width' },
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  font: { type: String, default: 'Assistant' },
  colors: {
    pri: { type: String, default: '#FFFFFF' },
    sec: { type: String, default: '#121212' },
    acc: { type: String, default: '#F3F3F3' },
    txt: { type: String, default: '#000000' },
    ltxt: { type: String, default: '#4b4949' },
    wtxt: { type: String, default: '#ffffff' },
  },

  customCss: { type: String, required: false },
  customJs: { type: String, required: false },
});

ThemeCustomizationSchema.index({ storeId: 1, mode: 1 }, { unique: true });

const ThemeCustomizationModel = mongoose.model('ThemeSetting', ThemeCustomizationSchema);
module.exports = { ThemeCustomizationModel };
