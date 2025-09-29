const Joi = require('joi');
const JoiObjectId = require('joi-objectid')(Joi);
const { CollectionModel } = require('../../Models/CollectionModel');
const { ProductModel } = require('../../Models/ProductModel');

// 🧠 Helper: Validate variants against variations
const validateVariantsAgainstVariations = (variants, helpers) => {
  const { variations = [] } = helpers.state.ancestors[0] || {};

  const variationMap = {};
  for (const v of variations) {
    variationMap[v.name] = v.options;
  }

  for (const variant of variants || []) {
    const keys = Object.keys(variant.options || {});
    for (const key of keys) {
      if (!variationMap[key]) {
        return helpers.error('any.invalid', {
          message: `Variant option key "${key}" is not defined in variations.`,
        });
      }
      if (!variationMap[key].includes(variant.options[key])) {
        return helpers.error('any.invalid', {
          message: `Variant option "${variant.options[key]}" is not valid for "${key}".`,
        });
      }
    }
  }

  return variants;
};

// ✅ Joi Schema: Add Product
const addProductValidationSchema = Joi.object({
  name: Joi.string().required(),
  pronounce: Joi.string().allow('').optional(),
  vendor: Joi.string().allow('').optional(),
  price: Joi.number().required(),
  comparedAtPrice: Joi.number().optional(),
  displayImage: Joi.string().uri().allow('').optional(),
  gallery: Joi.array().items(Joi.string().uri().allow('')).optional(),
  collections: Joi.array().items(JoiObjectId()).optional(),
  trackInventory: Joi.boolean().default(false).optional(),
  stock: Joi.number().integer().min(0).allow(null),
  showStockCount: Joi.boolean().optional(),
  continueSelling: Joi.boolean().default(false).optional(),
  status: Joi.string().valid('active', 'inactive').optional(),
  pronouce: Joi.string().allow('').optional(),
  wantsCustomerReview: Joi.boolean().optional(),
  description: Joi.string().allow('').optional(),
  metaTitle: Joi.string().allow('').optional(),
  metaDescription: Joi.string().allow('').optional(),
  note: Joi.string().allow('').optional(),
  relatedProducts: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .optional(),
  variations: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        options: Joi.array().items(Joi.string()).min(1).required(),
      })
    )
    .unique((a, b) => a.name.toLowerCase().trim() === b.name.toLowerCase().trim())
    .optional(),

  variants: Joi.array()
    .items(
      Joi.object({
        sku: Joi.string().required(),
        options: Joi.object().pattern(Joi.string(), Joi.string()).required(),
        stock: Joi.number().min(0).allow(null).optional(),
        price: Joi.number().min(0).allow(null).required(),
        image: Joi.string().uri().allow(null).required(),
      })
    )
    .custom(validateVariantsAgainstVariations)
    .optional(),

  ratings: Joi.object({
    average: Joi.number(),
    count: Joi.number(),
  }).optional(),
});

// ✅ Joi Schema: Edit Product = All optional but at least one required
const editProductValidationSchema = addProductValidationSchema
  .fork(Object.keys(addProductValidationSchema.describe().keys), (schema) => schema.optional())
  .min(1)
  .required();

// ✅ Validation Middleware
const validateProduct = (isEdit = false) => {
  return async (req, res, next) => {
    const { storeId } = req.params;
    const productID = req.query.id;

    // Validate ID for edit
    if (isEdit) {
      if (!productID || JoiObjectId().validate(productID).error) {
        return res.status(400).json({ message: 'Invalid or missing product ID in query' });
      }
    }
    const schema = isEdit ? editProductValidationSchema : addProductValidationSchema;

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        message: `Error occuring: ${error.details[0]?.message}`,
      });
    }

    // ✅ Validate collections if provided
    if (value.collections && value.collections.length > 0) {
      const validCollections = await CollectionModel.find({
        _id: { $in: value.collections },
        storeRef: storeId,
      }).select('_id');

      const validIds = validCollections.map((col) => col._id.toString());
      const invalidIds = value.collections.filter((id) => !validIds.includes(id.toString()));

      if (invalidIds.length > 0) {
        return res.status(400).json({
          message: `Invalid collection ID(s): ${invalidIds.join(', ')}`,
        });
      }
    }

    next();
  };
};

module.exports = validateProduct;
