const Joi = require("joi");
const joiObjectid = require("joi-objectid")(Joi);

const reviewValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  message: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required().strict(),
  reviewTitle: Joi.string().optional().allow(""),
});

const validateReview = (req, res, next) => {
  const { productId } = req.query;

  if (!productId || joiObjectid().validate(productId).error) {
    return res
      .status(400)
      .json({ error: "Invalid or missing product ID in query" });
  }

  const { error } = reviewValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = validateReview;
