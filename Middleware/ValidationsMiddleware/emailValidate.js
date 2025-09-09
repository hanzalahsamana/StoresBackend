const Joi = require("joi");

const validateEmailTemplate = (req, res, next) => {
  const schema = Joi.object({
    html: Joi.string().required(),
    subject: Joi.string().required(),
    audience: Joi.string()
      .valid(
        "All Users",
        "Trial Users",
        "Trial Expired Users",
        "Suspended Users",
        "Active Users",
        "Specific Users"
      )
      .required(),
    users: Joi.alternatives().conditional("audience", {
      is: "Specific Users",
      then: Joi.array().items(Joi.string()).min(1).required(),
      otherwise: Joi.forbidden(),
    }),
    isAction: Joi.boolean().required(),
    actionLink: Joi.alternatives().conditional("isAction", {
      is: true,
      then: Joi.string().uri().required(),
      otherwise: Joi.forbidden(),
    }),
    actionText: Joi.alternatives().conditional("isAction", {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.forbidden(),
    }),
  });

  const { error } = schema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = { validateEmailTemplate };
