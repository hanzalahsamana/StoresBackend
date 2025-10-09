const fs = require("fs");
const csv = require("csv-parser");
const multer = require("multer");
const path = require("path");
const { CollectionModel } = require("../Models/CollectionModel");
const { ProductModel } = require("../Models/ProductModel");
const { parse } = require("json2csv");

const modelMap = {
  products: ProductModel,
  collections: CollectionModel,
};
const exportSite = async (req, res) => {
  const { storeId } = req.params;
  const { selectedData } = req.query;
  const data = selectedData.split(',').map(d => d.trim());


  if (!Array.isArray(data) || data.length < 1) {
    return res.status(400).json({ message: "selectedData must be a non-empty array." });
  }

  try {
    const removeMetaFields = (docs) =>
      docs.map(({ _id, storeRef, __v, ...rest }) => rest);

    const combinedData = [];

    // Helper to fetch and push with model name
    const addToCombinedData = async (modelName, model) => {
      const docs = await model.find({ storeRef: storeId }).lean();
      const cleaned = removeMetaFields(docs);
      cleaned.forEach(doc => combinedData.push({ model: modelName, ...doc }));
    };


    for (const modelKey of data) {
      const model = modelMap[modelKey];
      if (model) {
        await addToCombinedData(modelKey, model);
      }
    }

    if (!combinedData.length) {
      return res.status(404).json({ message: "No data found to export." });
    }

    const csv = parse(combinedData);

    res.header("Content-Type", "text/csv");
    res.attachment("site_export.csv");
    return res.send(csv);

  } catch (err) {
    console.error("Export CSV error:", err);
    return res.status(500).json({ message: "Failed to export site data." });
  }
};

const importSite = async (req, res) => {
  const { selectedKeys, keepOldData = "true" } = req.query;

  if (!selectedKeys) {
    return res.status(400).json({ message: "Selected Keys is required!", success: false })
  }
  
  const { storeId } = req.params;

  const keys = selectedKeys.split(",").map(k => k.trim());
  const shouldKeepOld = keepOldData === "true";

  if (!req.file) {
    return res.status(400).json({ message: "CSV file is required." });
  }

  const filePath = req.file.path;
  const parsedData = [];

  // Step 1: Parse CSV file
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      parsedData.push(row);
    })
    .on("end", async () => {
      try {
        // Step 2: Process by selectedKeys
        for (const key of keys) {
          const model = modelMap[key];
          if (!model) continue;

          // ✅ Match directly with CSV's "model" column
          const matchingRows = parsedData.filter(row => row.model?.trim() === key);

          if (!matchingRows.length) continue;

          // Remove old data if keepOldData is false
          if (!shouldKeepOld) {
            await model.deleteMany({ storeRef: storeId });
          }

          // Remove model field and add storeRef
          const formattedDocs = matchingRows.map(({ model, ...rest }) => ({
            ...rest,
            storeRef: storeId,
          }));

          if (formattedDocs.length) {
            await model.insertMany(formattedDocs);
          }
        }

        fs.unlinkSync(filePath); // Clean up the uploaded file
        return res.json({ success: true, message: "Data imported successfully." });
      } catch (err) {
        console.error("Import error:", err);
        fs.unlinkSync(filePath); // Clean up even if there's an error
        return res.status(500).json({ message: "Failed to import site data." });
      }
    })
    .on("error", (err) => {
      console.error("CSV read error:", err);
      return res.status(500).json({ message: "Error reading CSV file." });
    });
};





module.exports = { exportSite, importSite };
