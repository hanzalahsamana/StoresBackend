const Joi = require("joi");
const JoiObjectId = require("joi-objectid")(Joi);
const { CollectionModel } = require("../../Models/CollectionModel");

// Add product schema
const addProductValidationSchema = Joi.object({
  name: Joi.string().required(),
  vendor: Joi.string().allow("").optional(),
  price: Joi.number().required(),
  comparedAtPrice: Joi.number().optional(),
  displayImage: Joi.string().required(),
  gallery: Joi.array().items(Joi.string()).optional(),
  collections: Joi.array().items(JoiObjectId()).optional(),
  stock: Joi.number().required(),
  status: Joi.string().valid("active", "inactive").optional(),
  description: Joi.string().allow("").optional(),
  metaTitle: Joi.string().allow("").optional(),
  metaDescription: Joi.string().allow("").optional(),
  variations: Joi.array()
    .items(
      Joi.object({
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
        stock: Joi.number().required(),
        price: Joi.number().required(),
        image: Joi.string().optional(),
      })
    )
    .optional(),
  ratings: Joi.object({
    average: Joi.number(),
    count: Joi.number(),
  }).optional(),
  wantsCustomerReview: Joi.boolean().optional(),
});

// Edit product schema (all optional, but at least one field required)
const editProductValidationSchema = addProductValidationSchema.fork(
  Object.keys(addProductValidationSchema.describe().keys),
  (schema) => schema.optional()
).min(1);

const validateProduct = (isEdit = false) => {
  return async (req, res, next) => {
    const { storeId } = req.params;
    const productID = req.query.id;

    if (isEdit) {
      if (!productID || JoiObjectId().validate(productID).error) {
        return res
          .status(400)
          .json({ error: "Invalid or missing product ID in query" });
      }
    }

    const schema = isEdit ? editProductValidationSchema : addProductValidationSchema;

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res
        .status(400)
        .json({ errors: error.details.map((e) => e.message) });
    }

    // Validate collections if provided
    if (value.collections && value.collections.length > 0) {
      const validCollections = await CollectionModel.find({
        _id: { $in: value.collections },
        storeRef: storeId,
      }).select("_id");

      const validIds = validCollections.map((col) => col._id.toString());

      const invalidIds = value.collections.filter(
        (id) => !validIds.includes(id.toString())
      );

      if (invalidIds.length > 0) {
        return res.status(400).json({
          error: `Invalid collection ID(s): ${invalidIds.join(", ")}`,
        });
      }
    }

    next();
  };
};

module.exports = validateProduct;
