const mongoose = require("mongoose");

const { StoreModal } = require("../Models/StoreModal");
const { UserModal } = require("../Models/userModal");

const validOwnerChecker = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const { storeId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(storeId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId or storeId",
      });
    }

    const user = await UserModal.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No document found with brandName: ${userId}`,
      });
    }

    const store = await StoreModal.findById(storeId);

    if (!store) {
      return res
        .status(404)
        .json({ message: "No store found with the provided Store ID." });
    }

    if (!store.userRef.equals(user._id)) {
      return res.status(403).json({
        message: "You are not authorized.",
      });
    }

    next();
  } catch (err) {
    console.error("Error in validOwnerChecker:", err);
    return res.status(403).json({ message: "something went wrong." });
  }
};

module.exports = validOwnerChecker;
