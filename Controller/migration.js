const { CollectionModel } = require("../Models/CollectionModel");
const { ContentModel } = require("../Models/ContentModel");
const { ProductModel } = require("../Models/ProductModel");
const { SectionModel } = require("../Models/SectionsModel");

const exportSite = async (req, res) => {
  const { storeId } = req.params;
  const { selectedData } = req.query;

  if (!Array.isArray(selectedData) || selectedData.length < 1) {
    console.error("Invalid selectedData:", selectedData);
    return res
      .status(400)
      .json({ message: "selectedData must be a non-empty array." });
  }

  try {
    const data = {};

    if (selectedData.includes("collections")) {
      data.collections = await CollectionModel.find({
        storeRef: storeId,
      }).lean();
    }

    if (selectedData.includes("products")) {
      data.products = await ProductModel.find({ storeRef: storeId }).lean();
    }

    if (selectedData.includes("sections")) {
      data.sections = await SectionModel.find({ storeRef: storeId }).lean();
    }

    if (selectedData.includes("contents")) {
      data.contents = await ContentModel.find({ storeRef: storeId }).lean();
    }

    // if (selectedData.includes("orders")) {
    //   data.orders = await OrderModel.find({storeRef:storeId}).lean();
    // }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Export error:", err);
    return res.status(500).json({ message: "Failed to export site data." });
  }
};

const importSiteData = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { selectedKeys } = req.query;

    console.error("Invalid selectedKeys:", selectedKeys);
    if (!Array.isArray(selectedKeys) || selectedKeys.length < 1) {
      return res
        .status(400)
        .json({ message: "selectedKeys must be a non-empty array." });
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
      const ContentModel = getModel(siteName, "contents", ContentModel);
      for (const incomingContent of jsonData.contents) {
        const { type, _id, ...rest } = incomingContent;
        const existing = await ContentModel.findOne({ type });
        if (existing) {
          importActions.push(ContentModel.updateOne({ type }, { $set: rest }));
        } else {
          importActions.push(ContentModel.create({ type, ...rest }));
        }
      }
    }

    // Execute all import actions
    await Promise.all(importActions);

    res.status(200).json({ message: "Data imported successfully" });
  } catch (err) {
    console.error("Import error", err);
    res.status(500).json({ message: "Failed to import data" });
  }
};

module.exports = { exportSite };
