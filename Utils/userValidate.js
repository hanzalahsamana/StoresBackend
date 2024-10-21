const Joi = require("joi");

const userRegisterValidate = (req, res, next) => {
  const schema = Joi.object({
    brandName: Joi.string().min(3).max(100).required().regex(/^\S+$/).messages({
      "string.pattern.base": "brandName must not contain spaces",
    }),
    name: Joi.string().min(3).max(100).required().regex(/^\S+$/).messages({
      "string.pattern.base": "adminName must not contain spaces",
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
      message: errorMessages[0],
    });
  }
  next();
};

const userLoginValidate = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(2).alphanum().required(),
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
