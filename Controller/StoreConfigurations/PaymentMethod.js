// controllers/configurationController.js

const { ConfigurationModel } = require("../models/Configuration");

const addOrUpdatePaymentMethod = async (req, res) => {
  const { storeId } = req.params;
  const { key, data } = req.body;

  try {
    const config = await ConfigurationModel.findOne({ storeRef: storeId });

    if (!config) {
      return res.status(404).json({ message: "Store configuration not found" });
    }

    const existingIndex = config.paymentMethods.findIndex(p => p.key === key);

    if (existingIndex !== -1) {
      // Update existing
      config.paymentMethods[existingIndex] = {
        ...config.paymentMethods[existingIndex],
        ...data,
        key,
      };
    } else {
      // Add new
      config.paymentMethods.push({ key, ...data });
    }

    await config.save();

    return res.status(200).json({ message: "Payment method updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

module.exports = {
  addOrUpdatePaymentMethod,
};
