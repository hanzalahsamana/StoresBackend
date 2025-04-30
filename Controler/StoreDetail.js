const { StoreDetailModal } = require("../Models/StoreDetailModal");
const { UserModal } = require("../Models/userModal");

const getStoreDetails = async (req, res) => {
  const type = req.collectionType;

  try {
    const user = await UserModal.findOne({ brandName: String(type) }).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No document found with brandName: ${userId}`,
      });
    }

    const Store = await StoreDetailModal.findOne({ brandName: String(type) });

    if (!Store) {
      console.log(`store ${type} not found.`);
      const storeDetail = StoreDetailModal({
        brandName: user.brandName,
        brand_Id: user.brand_Id,
      });
      const savedStoreDetail = storeDetail.save();
      return res.status(200).json({
        success: true,
        data: savedStoreDetail,
      });
    }

    return res.status(200).json({
      success: true,
      data: Store,
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

module.exports = { getStoreDetails };
