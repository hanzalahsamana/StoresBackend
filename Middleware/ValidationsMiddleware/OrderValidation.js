const orderValidationSchema = Joi.object({
  userId: Joi.string().optional(),

  customer: Joi.object({
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

  shippingAddress: Joi.object().required(), // assume same as customer schema

  orderItems: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        name: Joi.string().required(),
        image: Joi.string().optional(),
        quantity: Joi.number().min(1).required(),
        price: Joi.number().required(),
        variant: Joi.object().optional(),
      })
    )
    .min(1)
    .required(),

  paymentMethod: Joi.string()
    .valid("credit_card", "paypal", "cash_on_delivery", "bank_transfer")
    .required(),

  paymentStatus: Joi.string()
    .valid("pending", "paid", "failed", "refunded")
    .optional(),

  orderStatus: Joi.string()
    .valid("pending", "processing", "shipped", "delivered", "cancelled")
    .optional(),

  taxAmount: Joi.number().min(0).optional(),
  shippingFee: Joi.number().min(0).optional(),
  discount: Joi.number().min(0).optional(),
  totalAmount: Joi.number().min(0).required(),

  trackingInfo: Joi.object({
    carrier: Joi.string().optional(),
    trackingNumber: Joi.string().optional(),
    estimatedDelivery: Joi.date().optional(),
  }).optional(),

  notes: Joi.string().optional(),
});

const validateOrder = (req, res, next) => {
  const { error } = orderValidationSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: "Validation Error",
      details: error.details.map((d) => d.message),
    });
  }

  next();
};
