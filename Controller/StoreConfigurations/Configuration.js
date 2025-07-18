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
    const paymentMethods = config.paymentMethods.map(
      ({ credentials, ...rest }) => rest,
    );

    return res.status(200).json({
      message: "cofig fetched successfully",
      data: {
        ...config,
        paymentMethods, // override with filtered safe version
      },
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

    console.log(config);
    return res.status(200).json({
      message: "cofig fetched successfully",
      data: config,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }
};

module.exports = { getPublicConfiguration, getAdminConfiguration };
