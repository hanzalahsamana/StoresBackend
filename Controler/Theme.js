const { UserModal } = require("../Models/userModal");

const addTheme = async (req, res) => {
  const { theme } = req.body;
  const { userId } = req.query;

  try {
    const user = await UserModal.findById(userId).select("-password");

    if (!user) {
      console.log(`User with ID ${userId} not found.`);
      return res.status(404).json({
        success: false,
        message: `No document found with brandName: ${siteName}`,
      });
    }

    console.log(req.body);
    user.theme = theme;
    const suser = await user.save();

    res.status(200).json({
      success: true,
      message: "Theme updated successfully",
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

const getTheme = async (req, res) => {
  const type = req.collectionType;

  try {
    const user = await UserModal.findOne({ brandName: String(type) });

    if (!user) {
      console.log(`User with store ${type} not found.`);
      return res.status(404).json({
        success: false,
        message: `No document found with brandName: ${siteName}`,
      });
    }

    console.log(req.body);

    res.status(200).json({
      success: true,
      message: "Theme updated successfully",
      data: user.theme,
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

module.exports = { addTheme };
