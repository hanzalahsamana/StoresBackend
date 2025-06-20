const Joi = require("joi");

const paymentMethodSchema = {
  cod: Joi.object({
    isEnabled: Joi.boolean().required(),
    credentials: Joi.object().default({}),
  }),

  jazzcash: Joi.object({
    isEnabled: Joi.boolean().required(),
    credentials: Joi.object({
      merchantId: Joi.string().required().label("Merchant ID"),
      pp_Password: Joi.string().required().label("Password"),
      integritySalt: Joi.string().required().label("Integrity Salt"),
    }).required(),
  }),

  easypaisa: Joi.object({
    isEnabled: Joi.boolean().required(),
    credentials: Joi.object({
      merchantId: Joi.string().required().label("Merchant ID"),
      apiKey: Joi.string().required().label("API Key"),
    }).required(),
  }),
};

const validatePaymentMethod = (req, res, next) => {
  const { method, data } = req.body;

  if (!method || typeof method !== "string") {
    return res.status(400).json({ message: "Payment method name is required" });
  }

  const schema = paymentMethodSchema[method];

  if (!schema) {
    return res.status(400).json({ message: "Unsupported payment method" });
  }

  const { error } = schema.validate(data, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map((e) => e.message).join(", ");
    return res.status(400).json({ message: errorMessage });
  }

  next();
};

module.exports = { validatePaymentMethod };
