const { StoreDetailModal } = require("../Models/StoreDetailModal");

const addVariation = async (req, res) => {
  const { userId } = req.query;
  const { variation } = req.body;

  if (
    !userId ||
    !variation ||
    !variation.name ||
    !Array.isArray(variation.options) ||
    variation.options.length === 0
  ) {
    return res.status(400).json({
      error: "Missing required fields or variation format is invalid.",
    });
  }

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

    store.variations.push(variation);
    const savedStore = await store.save();

    return res.status(200).json({
      message: "Variation added successfully.",
      data: savedStore,
    });
  } catch (error) {
    console.error("Error adding variation:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const editVariation = async (req, res) => {
  const { userId } = req.query;
  const { variationId, updatedVariation } = req.body;

  if (
    !userId ||
    !variationId ||
    !updatedVariation ||
    !updatedVariation.name ||
    !Array.isArray(updatedVariation.options) ||
    updatedVariation.options.length === 0
  ) {
    return res.status(400).json({ error: "Missing or invalid fields." });
  }

  try {
    const user = await UserModal.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const store = await StoreDetailModal.findOne({ brand_Id: user.brand_Id });
    if (!store) {
      return res.status(404).json({ error: "Store not found." });
    }

    const variation = store.variations.id(variationId);
    if (!variation) {
      return res.status(404).json({ error: "Variation not found." });
    }

    variation.name = updatedVariation.name;
    variation.options = updatedVariation.options;

    const savedStore = await store.save();

    return res
      .status(200)
      .json({ message: "Variation updated successfully.", data: savedStore });
  } catch (error) {
    console.error("Error editing variation:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const deleteVariation = async (req, res) => {
  const { userId, variationId } = req.query;

  if (!userId || !variationId) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const user = await UserModal.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const store = await StoreDetailModal.findOne({ brand_Id: user.brand_Id });
    if (!store) {
      return res.status(404).json({ error: "Store not found." });
    }

    const variation = store.variations.id(variationId);
    if (!variation) {
      return res.status(404).json({ error: "Variation not found." });
    }

    variation.deleteOne();
    const savedStore = await store.save();

    return res
      .status(200)
      .json({ message: "Variation deleted successfully.", data: savedStore });
  } catch (error) {
    console.error("Error deleting variation:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { addVariation, editVariation, deleteVariation };
