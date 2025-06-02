const { default: mongoose } = require("mongoose");
const { StoreModal } = require("../Models/StoreModal");

const ValidStoreChecker = async (req, res, next) => {
  try {
    const { storeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid storeId format",
      });
    }

    const store = await StoreModal.findById(storeId);

    if (!store) {
      return res
        .status(404)
        .json({ error: "No store found with the provided Store ID." });
    }

    next();
  } catch (err) {
    console.error("Error in validOwnerChecker:", err);
    return res.status(403).json({ message: "something went wrong." });
  }
};

module.exports = ValidStoreChecker;
