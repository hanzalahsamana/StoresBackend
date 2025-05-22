const { default: mongoose } = require("mongoose");
const { StoreDetailModal } = require("../Models/StoreDetailModal");
const { UserModal } = require("../Models/userModal");
const moment = require("moment");
const subscriberSchema = require("../Models/SubscriberModal");
const { orderSchema } = require("../Models/OrderModal");

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
    !discount.expiryDate
  ) {
    return res.status(400).json({
      message: "Missing required discount fields.",
    });
  }

  try {
    const user = await UserModal.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const store = await StoreDetailModal.findOne({ brand_Id: user.brand_Id });
    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }

    if (
      discount.discountType === "global" &&
      store.discounts.some((d) => d.discountType === "global")
    ) {
      return res.status(400).json({
        message:
          "A global discount already exists. Only one global discount is allowed.",
      });
    }

    const expiry = new Date(discount?.expiryDate);
    const now = new Date();
    if (expiry <= now) {
      return res.status(400).json({
        message: "Expiry date must be in the future",
      });
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
    !updatedDiscount.expiryDate
  ) {
    return res.status(400).json({ message: "Missing or invalid fields." });
  }

  try {
    const user = await UserModal.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const store = await StoreDetailModal.findOne({ brand_Id: user.brand_Id });
    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }

    const discount = store.discounts.id(discountId);
    if (!discount) {
      return res.status(404).json({ message: "Discount not found." });
    }

    if (
      updatedDiscount.discountType === "global" &&
      store.discounts.some(
        (d) => d._id.toString() !== discountId && d.discountType === "global"
      )
    ) {
      return res.status(400).json({
        message:
          "A global discount already exists. Only one global discount is allowed.",
      });
    }

    const expiry = new Date(updatedDiscount?.expiryDate);
    const now = new Date();
    if (expiry <= now) {
      return res.status(400).json({
        message: "Expiry date must be in the future",
      });
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
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const user = await UserModal.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const store = await StoreDetailModal.findOne({ brand_Id: user.brand_Id });
    if (!store) {
      return res.status(404).json({ message: "Store not found." });
    }

    const discount = store.discounts.id(discountId);
    if (!discount) {
      return res.status(404).json({ message: "Discount not found." });
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

const applyCoupon = async (req, res) => {
  try {
    console.log(req.body);
    
    const { email, couponCode, totalAmount } = req.body;
    const type = req.collectionType;

    if (!couponCode) {
      return res.status(400).json({ message: "Coupon code is required." });
    }
    if (totalAmount === undefined) {
      return res.status(400).json({ message: "Total amount is required." });
    }
    if (isNaN(Number(totalAmount))) {
      return res
        .status(400)
        .json({ message: "Total amount must be a valid number." });
    }
    if (Number(totalAmount) <= 0) {
      return res
        .status(400)
        .json({ message: "Total amount must be greater than 0." });
    }

    const user = await UserModal.findOne({ brandName: String(type) }).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `No document found with brandName: ${type}`,
      });
    }

    const Store = await StoreDetailModal.findOne({ brandName: String(type) });

    // Find store discounts (you might have a different way to get discounts)
    if (!Store || !Store.discounts || Store.discounts.length === 0) {
      return res.status(404).json({ message: "No discounts configured." });
    }

    // Find the coupon discount
    const discount = Store.discounts.find(
      (d) =>
        d.discountType === "coupon" &&
        d.name.toLowerCase() === couponCode.toLowerCase()
    );

    if (!discount) {
      return res
        .status(404)
        .json({ message: "Invalid or inactive coupon code." });
    }

    // Check active & expiry
    if (!discount.isActive) {
      return res
        .status(400)
        .json({ message: "expired or inactive coupon code." });
    }

    if (moment(discount.expiryDate).isBefore(moment())) {
      return res
        .status(400)
        .json({ message: "expired or inactive coupon code." });
    }

    if (discount.usageLimit && discount?.usedBy >= discount?.usageLimit) {
      return res.status(400).json({
        message: `Coupon valid only for first ${discount?.usageLimit} customers.`,
      });
    }

    if (
      discount.minOrderAmount &&
      discount.minOrderAmount > 0 &&
      totalAmount < discount.minOrderAmount
    ) {
      return res.status(400).json({
        message: `Minimum order amount of Rs. ${discount.minOrderAmount} is required to use this coupon.`,
      });
    }

    if (discount.usagePerUser && discount.usagePerUser > 0) {
      if (!email) {
        return res.status(400).json({ message: "Please fill email first." });
      }
      const OrderModel = mongoose.model(
        type + "_Orders",
        orderSchema,
        type + "_Orders"
      );

      const userOrderCount = await OrderModel.countDocuments({
        "customerInfo.email": email.toLowerCase(),
      });

      // If the user already used coupon 'usagePerUser' times or more, block it
      if (userOrderCount >= discount.usagePerUser) {
        return res.status(400).json({
          message: `Coupon valid only for first ${
            discount.usagePerUser > 1 && discount.usagePerUser
          } order(s).`,
        });
      }
    }

    if (discount.access && discount.access === "subscription") {
      if (!email) {
        return res.status(400).json({ message: "Please fill email first." });
      }
      const SubscriberModel = mongoose.model(
        `${type}_subscribers`,
        subscriberSchema,
        `${type}_subscribers`
      );

      const existingUser = await SubscriberModel.findOne({
        email: email.toLowerCase(),
      });
      if (!existingUser) {
        return res.status(400).json({
          message: "Coupon valid only for subscribe user.",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Coupon applied successfully.`,
      discount,
    });
  } catch (error) {
    console.error("applyCoupon message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addDiscount,
  editDiscount,
  deleteDiscount,
  applyCoupon,
};
