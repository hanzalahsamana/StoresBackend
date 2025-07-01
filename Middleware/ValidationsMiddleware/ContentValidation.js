const Joi = require('joi');
const joiObjectid = require('joi-objectid')(Joi);

// Joi schema
const contentValidationSchema = Joi.object({
  title: Joi.string().optional(),
  type: Joi.string().optional(),
  text: Joi.string().allow('').optional(),
  buttonText: Joi.string().allow('').optional(),
  image: Joi.string().uri().optional().default('https://res.cloudinary.com/duaxitxph/image/upload/v1736247980/cjzl4ivq2lduxqbtnfj1.webp'),
  faqs: Joi.array()
    .items(
      Joi.object({
        Q: Joi.string().required(),
        A: Joi.string().required(),
      })
    )
    .optional(),
  video: Joi.string().allow('').optional(),
  email: Joi.string().email().allow('').optional(),
  phone: Joi.string().allow('').optional(),
  address: Joi.string().allow('').optional(),
}).min(1);

// Middleware function
const validateContent = (req, res, next) => {
  const { contentId } = req.query;

  if (!contentId || joiObjectid().validate(contentId).error) {
    return res.status(400).json({ message: 'Invalid contentId id OR id is not defined' });
  }

  const { error, value } = contentValidationSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      message: error.details.map((detail) => detail.message).join(', '),
    });
  }

  req.body = value;

  next();
};

module.exports = validateContent;
