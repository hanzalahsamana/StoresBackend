const { ConfigurationModel } = require("../../Models/ConfigurationModel");

const getPublicConfiguration = async (req, res) => {
  const { storeId } = req.params;

  try {
    const config = await ConfigurationModel.findOne({
      storeRef: storeId,
    }).lean();

    if (!config) {
      return res.status(404).json({ message: "Store configuration not found" });
    }

    // Filter only enabled payment methods without credentials
    const paymentMethods = config.paymentMethods
      .filter((method) => method.isEnabled)
      .map(({ key, label }) => ({ key, label }));

    return res.status(200).json({
      ...config,
      paymentMethods, // override with filtered safe version
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }
};

const getAdminConfiguration = async (req, res) => {
  const { storeId } = req.params;

  try {
    const config = await ConfigurationModel.findOne({
      storeRef: storeId,
    }).lean();

    if (!config) {
      return res.status(404).json({ message: "Store configuration not found" });
    }

    return res.status(200).json(config);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }
};



module.exports = { getPublicConfiguration, getAdminConfiguration };
