const Joi = require("joi");

const userRegisterValidate = (req, res) => {
  const schema = Joi.object({
    brandName: Joi.string().min(3).max(100).required().messages({
      "string.pattern.base": "brandName is required",
    }),
    subDomain: Joi.string().min(3).max(100).required().messages({
      "string.pattern.base": "Subdomain is required",
    }),
    name: Joi.string().min(3).max(100).required().regex(/^\S+$/).messages({
      "string.pattern.base": "Name must not contain spaces",
    }),
    isResend: Joi.boolean().messages({
      "string.pattern.base": "IsResend should be boolean",
    }),
    email: Joi.string().email().required().regex(/^\S+$/).messages({
      "string.pattern.base": "email must not contain spaces",
    }),
    password: Joi.string()
      .min(6)
      .required()
      .regex(/^[\w!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]+$/)
      .messages({
        "string.pattern.base":
          "Password must not contain spaces and should include special characters if needed",
      }),
  });

  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map((err) => err.message);
    return res.status(400).json({
      message: errorMessages[0], // Return the first error message
    });
  }

  return null; // If no error, return null
};

const userLoginValidate = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(2).required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    const errorMessages = error.details.map((err) => err.message);
    return res.status(400).json({
      message: errorMessages[0],
    });
  }
  next();
};

module.exports = { userRegisterValidate, userLoginValidate };
