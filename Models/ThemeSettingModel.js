const mongoose = require('mongoose');

const ThemeSettingSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Store' },
  mode: { type: String, enum: ['draft', 'published'], default: 'draft' },
  version: { type: Number, default: 1 },
  updatedAt: { type: Date, default: Date.now },

  layout: { type: String, enum: ['boxed', 'full-width'], default: 'full-width' },
  font: { type: String, default: 'Poppins' },
  colors: {
    primary: { type: String, default: '#000000' },
    secondary: { type: String, default: '#ffffff' },
    background: { type: String, default: '#f8f8f8' },
    text: { type: String, default: '#333333' },
  },
  logo: {
    url: { type: String },
    alt: { type: String },
  },
  favicon: { type: String },
  customCss: { type: String },
  customJs: { type: String },
});

ThemeSettingSchema.index({ storeId: 1, mode: 1 }, { unique: true });

const ThemeSettingModel = mongoose.model('ThemeSetting', ThemeSettingSchema);
module.exports = { ThemeSettingModel };
