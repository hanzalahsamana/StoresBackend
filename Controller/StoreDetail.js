const { default: mongoose } = require("mongoose");
const { StoreModal } = require("../Models/StoreModal");
const { UserModal } = require("../Models/userModal");
const SeedDefaultData = require("../InitialSeeding/SeedDefaultData");

const generateStore = async (req, res) => {
  const { userId } = req.query;
  const { storeName, storeType, subDomain } = req.body;

  try {
    const isSubDomainExist = await StoreModal.findOne({ subDomain });

    if (isSubDomainExist) {
      return res.status(400).json({ message: "Sub domain already exists!", success: false });
    }

    const newStore = new StoreModal({
      storeName,
      storeType,
      subDomain,
      userRef: userId,
    });
    const savedStore = await newStore.save();
    await SeedDefaultData(savedStore?._id);
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

const editStore = async (req, res) => {
  try {
    const { storeName, subDomain } = req.body;
    const { storeId } = req.params;
    if (!req.body) {
      return res.status(400).json({ message: "Data is required", success: false });
    }
    const isSubDomainExist = await StoreModal.findOne({ subDomain });

    if (isSubDomainExist) {
      return res.status(400).json({ message: "Sub domain already exists!", success: false });
    }

    const store = await StoreModal.findById(storeId)
    if (!store) {
      return res.status(404).json({ message: `Invalid Store Id!`, success: false })
    }
    store.storeName = storeName
    const updatedStore = await store.save()
    return res.status(200).json({ message: "Store Updated succesfully", data: updatedStore, success: true })

  } catch (e) {
    console.error("Error edit Store", e?.message || e);
    return res.status(500).json({ message: "Something went wrong!", success: false });
  }
}

module.exports = { generateStore, getAllStores, getStore, editStore };
