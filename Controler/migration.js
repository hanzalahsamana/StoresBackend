const { categorySchema } = require("../Models/CategoryModal");
const {orderSchema} = require("../Models/OrderModal");
const { pageSchema } = require("../Models/PagesModel");
const { productSchema } = require("../Models/ProductModal");
const { SectionSchema } = require("../Models/SectionsModal");
const { UserModal } = require("../Models/userModal");
const getModel = require("../Utils/GetModel");

const exportSite = async (req, res) => {
  const { userId, selectedData } = req.query;

  const user = await UserModal.findById(userId).select("-password");
  if (!user) {
    return res.status(404).json({
      success: false,
      message: `No user found with ID: ${userId}`,
    });
  }

  if (!Array.isArray(selectedData) || selectedData.length < 1) {
    console.error("Invalid selectedData:", selectedData);
    return res
      .status(400)
      .json({ message: "selectedData must be a non-empty array." });
  }

  const siteName = user.brandName;

  if (!siteName) {
    return res.status(400).json({ message: "Missing 'brandName'." });
  }

  try {
    const data = {};

    if (selectedData.includes("categories")) {
      const CategoryModel = getModel(siteName, "category", categorySchema);
      data.categories = await CategoryModel.find().lean();
    }

    if (selectedData.includes("products")) {
      const ProductModel = getModel(siteName, "products", productSchema);
      data.products = await ProductModel.find().lean();
    }

    if (selectedData.includes("sections")) {
      const SectionModel = getModel(siteName, "section", SectionSchema);
      data.sections = await SectionModel.find().lean();
    }

    if (selectedData.includes("orders")) {
      const OrderModel = getModel(siteName, "Orders", orderSchema);
      data.orders = await OrderModel.find().lean();
    }

    if (selectedData.includes("contents")) {
      const PagesModel = getModel(siteName, "pages", pageSchema);
      data.contents = await PagesModel.find().lean();
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Export error:", err);
    return res.status(500).json({ message: "Failed to export site data." });
  }
};

module.exports = { exportSite };
