const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  type: { type: String, required: true }, // "hero", "banner", etc.
  name: { type: String, required: true }, // Display name
  order: { type: Number, required: true },
  sectionData: mongoose.Schema.Types.Mixed, // Flexible per section type
});

const PageSchema = new mongoose.Schema({
  storeRef: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Store' },
  type: { type: String, enum: ['system', 'custom'], default: 'custom' },
  mode: { type: String, enum: ['draft', 'published'], default: 'draft' },
  isHeaderFooter: { type: Boolean, default: true },
  slug: { type: String, required: true }, // "/about", "/"
  name: { type: String, required: true }, // "About Us"
  isEnabled: { type: Boolean, default: true },
  sections: [SectionSchema],

  updatedAt: { type: Date, default: Date.now },
});

PageSchema.index({ storeId: 1, slug: 1, mode: 1 }, { unique: true });

const PageModel = mongoose.model('Page', PageSchema);
module.exports = { PageModel };
