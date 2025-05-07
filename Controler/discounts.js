const { StoreDetailModal } = require("../Models/StoreDetailModal");
const { UserModal } = require("../Models/userModal");

// Add Discount
const addDiscount = async (req, res) => {
  const { userId } = req.query;
  const { discount } = req.body;

  if (
    !userId ||
    !discount ||
    !discount.name ||
    !discount.amount ||
    !discount.amountType ||
    !discount.discountType ||
    !discount.access ||
    !discount.startDate ||
    !discount.endDate
  ) {
    return res.status(400).json({
      error: "Missing required discount fields.",
    });
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

    store.discounts.push(discount);
    const savedStore = await store.save();

    return res.status(200).json({
      message: "Discount added successfully.",
      data: savedStore,
    });
  } catch (error) {
    console.error("Error adding discount:", error);
    return res.status(500).json({ message: error?.message });
  }
};

// Edit Discount
const editDiscount = async (req, res) => {
  const { userId } = req.query;
  const { discountId, updatedDiscount } = req.body;

  if (
    !userId ||
    !discountId ||
    !updatedDiscount ||
    !updatedDiscount.name ||
    !updatedDiscount.amount ||
    !updatedDiscount.amountType ||
    !updatedDiscount.discountType ||
    !updatedDiscount.access ||
    !updatedDiscount.startDate ||
    !updatedDiscount.endDate
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

    const discount = store.discounts.id(discountId);
    if (!discount) {
      return res.status(404).json({ error: "Discount not found." });
    }

    Object.assign(discount, updatedDiscount);
    const savedStore = await store.save();

    return res.status(200).json({
      message: "Discount updated successfully.",
      data: savedStore,
    });
  } catch (error) {
    console.error("Error editing discount:", error);
    return res.status(500).json({ message: error?.message });
  }
};

// Delete Discount
const deleteDiscount = async (req, res) => {
  const { userId, discountId } = req.query;

  if (!userId || !discountId) {
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

    const discount = store.discounts.id(discountId);
    if (!discount) {
      return res.status(404).json({ error: "Discount not found." });
    }

    discount.deleteOne();
    const savedStore = await store.save();

    return res.status(200).json({
      message: "Discount deleted successfully.",
      data: savedStore,
    });
  } catch (error) {
    console.error("Error deleting discount:", error);
    return res.status(500).json({ message: error?.message });
  }
};

module.exports = {
  addDiscount,
  editDiscount,
  deleteDiscount,
};
