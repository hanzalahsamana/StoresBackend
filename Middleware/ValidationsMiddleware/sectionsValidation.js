const Joi = require("joi");

const validateSection = (req, res, next) => {
    const baseSchema = Joi.object({
        key: Joi.string()
            .valid(
                "banner_slider",
                "hero_banner",
                "feature_collection",
                "promo_section",
                "rich_text",
                "feature_product"
            )
            .required(),

        name: Joi.string().required(),
        order: Joi.number().required(),
        visibility: Joi.boolean().optional(),

        content: Joi.alternatives().conditional("key", [
            {
                is: "banner_slider",
                then: Joi.object({
                    title: Joi.string().required(),
                    imagesUrl: Joi.array().items(Joi.string().uri()).required(),
                })
                    .required()
                    .unknown(false),
            },
            {
                is: "hero_banner",
                then: Joi.object({
                    title: Joi.string().required(),
                    image: Joi.string().uri().required(),
                })
                    .required()
                    .unknown(false),
            },
            {
                is: "feature_collection",
                then: Joi.object({
                    title: Joi.string().required(),
                    selectedcollections: Joi.array().items(Joi.string()).min(1).required(),
                })
                    .required()
                    .unknown(false),
            },
            {
                is: "promo_section",
                then: Joi.object({
                    title: Joi.string().required(),
                    image: Joi.string().uri().required(),
                    text: Joi.string().required(),
                    buttonText: Joi.string().required(),
                    styleType: Joi.string().valid("style1", "style2").required(),
                })
                    .required()
                    .unknown(false),
            },
            {
                is: "rich_text",
                then: Joi.object({
                    title: Joi.string().required(),
                    text: Joi.string().required(),
                    buttonText: Joi.string().required(),
                })
                    .required()
                    .unknown(false),
            },
            {
                is: "feature_product",
                then: Joi.object({
                    title: Joi.string().required(),
                    maxLength: Joi.number().min(1).required(),
                    productType: Joi.string()
                        .valid("All", "Selected collections", "Selected Products")
                        .required(),
                    selectedcollections: Joi.array().items(Joi.string()).optional(),
                    selectedProducts: Joi.array().items(Joi.string()).optional(),
                })
                    .required()
                    .unknown(false),
            },
        ]),
    });

    const { error } = baseSchema.validate(req.body, { allowUnknown: false });

    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
            success: false,
        });
    }

    next();
};

module.exports = { validateSection };
