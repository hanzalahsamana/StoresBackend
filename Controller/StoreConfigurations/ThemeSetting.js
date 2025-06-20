const { ConfigurationModel } = require("../../Models/ConfigurationModel");

const updateTheme = async (req, res) => {
  const { theme } = req.body;
  const { storeId } = req.params;

  try {
    let configuration = await ConfigurationModel.findOne({
      storeRef: storeId,
    }).lean();

    if (!configuration) {
      configuration = new ConfigurationModel({
        storeRef: storeId,
      });
    }

    configuration.theme = theme;
    const savedConfiguration = await configuration.save();

    res.status(200).json({
      success: true,
      message: "Theme updated successfully",
      data: savedConfiguration?.theme,
    });
  } catch (error) {
    console.error("Error updating theme:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { updateTheme };
