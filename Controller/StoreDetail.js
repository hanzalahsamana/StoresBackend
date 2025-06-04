const { default: mongoose } = require("mongoose");
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

const getStore = async (req, res) => {
  const { storeId } = req.params;

  try {
    const storeData = await StoreModal.findById(storeId);

    return res.status(200).json({
      success: true,
      data: storeData,
    });
  } catch (error) {
    console.error("Error fetching store:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAllStores = async (req, res) => {
  const { userId } = req.query;

  try {
    const user = await UserModal.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No user found with ID: ${userId}`,
      });
    }

    const storeData = await StoreModal.find({
      userRef: userId,
    });

    return res.status(200).json({
      success: true,
      data: storeData,
    });
  } catch (error) {
    console.error("Error fetching stores:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { generateStore, getAllStores, getStore };
