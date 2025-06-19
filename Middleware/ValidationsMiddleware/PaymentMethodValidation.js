// middlewares/validatePaymentPayload.js

const allowedFields = {
  jazzcash: ["merchantId", "pp_Password", "integritySalt"],
  easypaisa: ["merchantId", "apiKey"],
  cod: [], // No sensitive fields
};

const validatePaymentPayload = (req, res, next) => {
  const { key, data } = req.body;

  if (!key || typeof key !== "string") {
    return res.status(400).json({ message: "Payment method key is required" });
  }

  if (!data || typeof data !== "object") {
    return res.status(400).json({ message: "Payment method data is required" });
  }

  const fields = allowedFields[key];

  if (!fields) {
    return res.status(400).json({ message: "Unsupported payment method" });
  }

  const missingFields = fields.filter((f) => !data[f] || data[f].trim() === "");

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  next();
};

module.exports = { validatePaymentPayload };
