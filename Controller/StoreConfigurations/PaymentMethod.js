// controllers/configurationController.js

const { ConfigurationModel } = require("../../Models/ConfigurationModel");

const updatePaymentMethod = async (req, res) => {
  const { storeId } = req.params;
  const { method, data } = req.body;

  console.log(method, data);
  

  try {
    let config = await ConfigurationModel.findOne({ storeRef: storeId });

    if (!config) {
      // If configuration doesn't exist, create a new one
      config = new ConfigurationModel({
        storeRef: storeId,
        paymentMethods: [
          {
            method,
            isEnabled: data.isEnabled || false,
            credentials: data.credentials || {},
          },
        ],
      });
    } else {
      const existingIndex = config.paymentMethods.findIndex(
        (p) => p.method === method
      );

      if (existingIndex !== -1) {
        // Update existing method
        config.paymentMethods[existingIndex].isEnabled =
          data.isEnabled ?? config.paymentMethods[existingIndex].isEnabled;

        if (data.credentials && typeof data.credentials === "object") {
          Object.entries(data.credentials).forEach(([field, value]) => {
            config.paymentMethods[existingIndex].credentials.set(field, value);
          });
        }
      } else {
        // Add new method
        config.paymentMethods.push({
          method,
          isEnabled: data.isEnabled || false,
          credentials: data.credentials || {},
        });
      }
    }

    await config.save();

    return res.status(200).json({
      message: "Payment method updated successfully",
      paymentMethods: config.paymentMethods,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }
};

module.exports = {
  updatePaymentMethod,
};
