const Joi = require("joi");
const JoiObjectId = require("joi-objectid")(Joi);

const orderValidationSchema = Joi.object({
  userId: Joi.string().optional(),

  customerInfo: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    country: Joi.string().required(),
    city: Joi.string().required(),
    postalCode: Joi.string().optional(),
    address: Joi.string().required(),
    apartment: Joi.string().optional(),
  }).required(),

  cartId: JoiObjectId().required(),

  orderStatus: Joi.string()
    .valid("pending", "processing", "shipped", "delivered", "cancelled")
    .optional(),

  paymentInfo: Joi.object({
    method: Joi.string().required(),
    status: Joi.string()
      .valid("pending", "paid", "failed", "refunded")
      .optional(),
    transactionId: Joi.string().optional(),
  }).required(),

  // These are now server-calculated, so removed from payload validation
  // tax: Joi.number().min(0).optional(),
  // shipping: Joi.number().min(0).optional(),
  // discount: Joi.number().min(0).optional(),
  // totalAmount: Joi.number().min(0).required(),

  trackingInfo: Joi.object({
    carrier: Joi.string().optional(),
    trackingNumber: Joi.string().optional(),
    estimatedDelivery: Joi.date().optional(),
  }).optional(),

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
