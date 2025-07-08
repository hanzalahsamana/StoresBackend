const fs = require("fs/promises");
const { categorySchema } = require("../Models/CollectionModel");
const { productSchema } = require("../Models/ProductModel");
const { orderSchema } = require("../Models/OrderModal");
const { UserModal } = require("../Models/userModal");
const { SectionSchema } = require("../Models/SectionsModel");
const getModel = require("../Utils/GetModel");
const { StoreModal } = require("../Models/StoreModal");
const { ContentModel } = require("../Models/ContentModel");

const importSiteData = async (req, res) => {
  try {
    const { selectedKeys } = req.query;
    const { storeId } = req.params

    // Validate selectedKeys
    console.error("Invalid selectedKeys:", selectedKeys);
    if (!Array.isArray(selectedKeys) || selectedKeys.length < 1) {
      return res
        .status(400)
        .json({ message: "selectedKeys must be a non-empty array." });
    }

    // Fetch user
    const store = await StoreModal.findById(storeId);

    const siteName = store.storeName;
    if (!siteName) {
      return res.status(400).json({ message: "Missing 'brandName'." });
    }

    // Handle file upload
    const filePath = req.file.path;
    const raw = await fs.readFile(filePath, "utf-8");
    const jsonData = JSON.parse(raw);
    await fs.unlink(filePath); // Ensure file is deleted after reading

    const importActions = [];

    // Generalized function to handle insertion logic
    const handleInsertion = async (model, data, existingIds) => {
      const existingIdSet = new Set(
        existingIds.map((item) => item._id.toString()),
      );
      const newData = data
        .filter((item) => !existingIdSet.has(item._id.toString()))
        .map(({ _id, ...rest }) => rest);

      if (newData.length > 0) {
        return model.insertMany(newData);
      }
      return null;
    };

    // Handle Products
    if (selectedKeys.includes("products") && jsonData.products?.length) {
      const ProductModel = getModel(siteName, "products", productSchema);
      const existingIds = await ProductModel.find(
        { _id: { $in: jsonData.products.map((p) => p._id) } },
        { _id: 1 },
      ).lean();
      const productInsertion = await handleInsertion(
        ProductModel,
        jsonData.products,
        existingIds,
      );
      if (productInsertion) importActions.push(productInsertion);
    }

    // Handle Categories
    if (selectedKeys.includes("categories") && jsonData.categories?.length) {
      const CategoryModel = getModel(siteName, "category", categorySchema);
      const existingCategoryIds = await CategoryModel.find(
        { _id: { $in: jsonData.categories.map((c) => c._id) } },
        { _id: 1 },
      ).lean();
      const categoryInsertion = await handleInsertion(
        CategoryModel,
        jsonData.categories,
        existingCategoryIds,
      );
      if (categoryInsertion) importActions.push(categoryInsertion);
    }

    // Handle Sections - Override (Delete & Replace All)
    if (selectedKeys.includes("sections") && jsonData.sections?.length) {
      const SectionModel = getModel(siteName, "section", SectionSchema);

      await SectionModel.deleteMany({});

      importActions.push(
        SectionModel.insertMany(
          jsonData.sections.map((section) => ({
            ...section,
          })),
        ),
      );
    }

    // Handle Orders
    if (selectedKeys.includes("orders") && jsonData.orders?.length) {
      const OrderModel = getModel(siteName, "Orders", orderSchema);
      const existingOrderIds = await OrderModel.find(
        { _id: { $in: jsonData.orders.map((o) => o._id) } },
        { _id: 1 },
      ).lean();
      const orderInsertion = await handleInsertion(
        OrderModel,
        jsonData.orders,
        existingOrderIds,
      );
      if (orderInsertion) importActions.push(orderInsertion);
    }

    // Handle Pages/Contents
    if (selectedKeys.includes("contents") && jsonData.contents?.length) {
      await jsonData.contents.forEach(({ type, ...rest }) => {
        importActions.push(
          ContentModel.updateOne(
            { storeRef: storeId, type },
            { $set: { ...rest, storeRef: storeId } },
            { upsert: true }
          )
        );
      });
    }

    // Execute all import actions
    await Promise.all(importActions);

    res.status(200).json({ message: "Data imported successfully" });
  } catch (err) {
    console.error("Import error", err);
    res.status(500).json({ message: "Failed to import data" });
  }
};

module.exports = importSiteData;
