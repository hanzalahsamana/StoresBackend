const Joi = require("joi");
const { ProductModel } = require("../../Models/ProductModel");
const JoiObjectId = require("joi-objectid")(Joi);

const collectionValidationSchema = Joi.object({
  name: Joi.string().required(),
  image: Joi.string().required(),
  products: Joi.array().items(JoiObjectId()).optional(),
});

const validateCollection = (isEdit = false) => {
  return async (req, res, next) => {
    const { storeId } = req.params;
    const collectionId = req.query.collectionId;

    if (isEdit) {
      if (
        !collectionId ||
        !JoiObjectId().validate(collectionId).error === undefined
      ) {
        return res
          .status(400)
          .json({ error: "Invalid or missing collectionId in query" });
      }
    }

    const { error, value } = collectionValidationSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res
        .status(400)
        .json({ errors: error.details.map((e) => e.message) });
    }

    if (value.products && value.products.length > 0) {
      const validProducts = await ProductModel.find({
        _id: { $in: value.products },
        storeRef: storeId,
      }).select("_id");

      const validIds = validProducts.map((p) => p._id.toString());

      const invalidIds = value.products.filter(
        (id) => !validIds.includes(id.toString())
      );

      if (invalidIds.length > 0) {
        return res
          .status(400)
          .json({ error: `Invalid product ID(s): ${invalidIds.join(", ")}` });
      }
    }

    next();
  };
};

module.exports = validateCollection;
