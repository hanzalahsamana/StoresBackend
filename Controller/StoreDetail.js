const { StoreModal } = require("../Models/StoreModal");
const { UserModal } = require("../Models/userModal");
const generateSlug = require("../Utils/generateSlug");
const { generateStoreValidation } = require("../Utils/ValidatePayloads");


const generateStore = async (req, res) => {
  const { userId } = req.query;
  const { storeName, storeType } = req.body;

  try {
    const error = generateStoreValidation(req.body);
    if (!error.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }

    const newStore = new StoreModal({
      storeName,
      storeType,
      subDomain: generateSlug(storeName),
      userRef: userId,
    });
    const savedStore = await newStore.save();
    return res.status(201).json({
      success: true,
      data: savedStore,
    });
  } catch (error) {
    console.error("Error adding store details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getStoreDetails = async (req, res) => {
  const type = req.collectionType;

  try {
    const user = await UserModal.findOne({ brandName: String(type) }).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No document found with brandName: ${type}`,
      });
    }

    const Store = await StoreModal.findOne({ brandName: String(type) });

    if (!Store) {
      console.log(`store ${type} not found.`);
      const storeDetail = StoreModal({
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

module.exports = { getStoreDetails, generateStore };
