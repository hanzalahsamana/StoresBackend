const Joi = require("joi");
const joiObjectid = require("joi-objectid")(Joi);

// Base schema
const discountValidationSchema = Joi.object({
  name: Joi.string().required(),
  discountType: Joi.string().valid("coupon", "global").required(),
  access: Joi.string().valid("all", "subscription").default("all"),
  amountType: Joi.string().valid("fixed", "percent").required(),
  amount: Joi.number().positive().required(),
  minOrderAmount: Joi.number().min(0).default(0),
  isActive: Joi.boolean().default(true),
  expiryDate: Joi.date().greater("now").required(),
  usageLimit: Joi.number().integer().min(1).allow(null),
  usagePerUser: Joi.number().integer().min(1).allow(null),
  headline: Joi.string().allow("").optional(),
});

// Edit schema: all optional, but at least one must be provided
// const editDiscountValidationSchema = discountValidationSchema
//   .fork(Object.keys(discountValidationSchema.describe().keys), (schema) => schema.optional())
//   .custom((value, helpers) => {
//     if (!value || Object.keys(value).length === 0) {
//       return helpers.error("any.custom", { message: "At least one field is required" });
//     }
//     return value;
//   });

const editDiscountValidationSchema = discountValidationSchema
  .fork(Object.keys(discountValidationSchema.describe().keys), (schema) =>
    schema.optional(),
  )
  .min(1);

// Middleware
const validateDiscount = (isEdit = false) => {
  return async (req, res, next) => {
    const { discountId } = req.query;
    console.log(editDiscountValidationSchema);

    if (isEdit) {
      if (!discountId || joiObjectid().validate(discountId).error) {
        return res.status(400).json({
          message: "Invalid or missing discount ID in query",
        });
      }

      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          message: "At least one field must be provided for update",
        });
      }
    }

    const schema = isEdit
      ? editDiscountValidationSchema
      : discountValidationSchema;

    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        message: "Validation error",
        details: error.details.map((d) => d.message),
      });
    }

    req.body = value;
    next();
  };
};

module.exports = { validateDiscount };
