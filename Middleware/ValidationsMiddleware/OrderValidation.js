const Joi = require("joi");
const JoiObjectId = require("joi-objectid")(Joi);

const orderValidationSchema = Joi.object({
  customerInfo: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    country: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().optional(),
    address: Joi.string().required(),
    apartment: Joi.string().optional(),
  }).required(),

  couponCode: Joi.string().optional(),

  paymentInfo: Joi.object({
    method: Joi.string().required(),
    status: Joi.string()
      .valid("pending", "paid", "failed", "refunded")
      .optional(),
    transactionId: Joi.string().optional(),
  }).required(),

  notes: Joi.string().optional(),
});

const validateOrder = (req, res, next) => {
  const { error, value } = orderValidationSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation Error",
      details: error.details.map((d) => d.message),
    });
  }
  req.body = value;
  next();
};

module.exports = { validateOrder };
