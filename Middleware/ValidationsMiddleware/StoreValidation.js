const Joi = require("joi");

const subdomainValidator = Joi.string()
    .required()
    .custom((value, helpers) => {
        const trimmed = value.trim();
        const replacedSpaces = trimmed.replace(/\s+/g, "-");
        const cleaned = replacedSpaces.replace(/[^a-z0-9-]/g, "");

        if (trimmed !== cleaned) {
            return helpers.error("string.invalidSubdomain");
        }
        return value;
    }, "Custom subdomain validation")
    .messages({
        "any.required": "subDomain is required",
        "string.invalidSubdomain":
            "subDomain must only contain lowercase letters, numbers, and hyphens. No spaces or special characters allowed.",
    });



const generateStoreValidation = (req, res, next) => {
    const schema = Joi.object({
        subDomain: subdomainValidator,
        storeName: Joi.string().required().messages({
            "any.required": "Store name is required",
            "string.base": "Store name must be a string",
        }),

        storeType: Joi.string().required().messages({
            "any.required": "Store type is required",
            "string.base": "Store type must be a string",
        }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
            success: false,
        });
    }

    next();
};

const editStoreValidation = (req, res, next) => {
    const schema = Joi.object({
        subDomain: subdomainValidator,
        storeName: Joi.string().required().messages({
            "any.required": "Store name is required",
            "string.base": "Store name must be a string",
        }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
            success: false,
        });
    }

    next();
};

module.exports = { generateStoreValidation, editStoreValidation };
