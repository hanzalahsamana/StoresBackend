const Joi = require("joi");

const editPasswordValidate = (req, res, next) => {
    const schema = Joi.object({
        currentPassword: Joi.string()
            .min(6)
            .required()
            .pattern(/^[\w!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]+$/)
            .messages({
                "any.required": "Current password is required",
                "string.min": "Current password must be at least 6 characters",
                "string.pattern.base":
                    "Current password must not contain spaces and should include special characters if needed",
            }),
        newPassword: Joi.string()
            .min(6)
            .required()
            .pattern(/^[\w!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]+$/)
            .messages({
                "any.required": "New password is required",
                "string.min": "New password must be at least 6 characters",
                "string.pattern.base":
                    "New password must not contain spaces and should include special characters if needed",
            }),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessages = error.details.map((err) => err.message);
        return res.status(400).json({ message: errorMessages[0] });
    }

    next();
};

module.exports = { editPasswordValidate };
