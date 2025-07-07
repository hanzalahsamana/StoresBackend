const Joi = require("joi");

const validateSection = (req, res, next) => {
    const schema = Joi.object({
        type: Joi.string().required(),
        sectionName: Joi.string().required(),
        order: Joi.number().required(),
        visibility: Joi.boolean().optional(),
        content: Joi.object().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
};

module.exports = { validateSection };
