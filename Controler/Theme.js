const { StoreDetailModal } = require("../Models/StoreDetailModal");
const { UserModal } = require("../Models/userModal");

const addTheme = async (req, res) => {
  const { theme } = req.body;
  const { userId } = req.query;

  try {
    const user = await UserModal.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No document found with brandName: ${userId}`,
      });
    }

    const store = await StoreDetailModal.findOne({ brand_Id: user?.brand_Id });

    if (!store) {
      return res
        .status(404)
        .json({ error: "No store found with the provided brand_Id." });
    }

    store.theme = theme;
    const savedStore = await store.save();

    res.status(200).json({
      success: true,
      message: "Theme updated successfully",
      data: savedStore,
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
