const { CollectionModel } = require("../Models/CollectionModel");
const { ContentModel } = require("../Models/ContentModel");
const { ProductModel } = require("../Models/ProductModel");
const { SectionModel } = require("../Models/SectionsModel");
const { parse } = require("json2csv");
const archiver = require("archiver");
const stream = require("stream");

const exportSite = async (req, res) => {
  const { storeId } = req.params;
  const { selectedData } = req.query;

  if (!Array.isArray(selectedData) || selectedData.length < 1) {
    return res.status(400).json({ message: "selectedData must be a non-empty array." });
  }

  try {
    const removeMetaFields = (docs) =>
      docs.map(({ _id, storeRef, __v, ...rest }) => rest);

    // Use PassThrough stream for streaming response
    const zipStream = new stream.PassThrough();
    const archive = archiver("zip", { zlib: { level: 9 } });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=site_export.zip");

    archive.pipe(zipStream);
    zipStream.pipe(res);

    // Export collections
    if (selectedData.includes("collections")) {
      const collections = await CollectionModel.find({ storeRef: storeId }).lean();
      const cleaned = removeMetaFields(collections);
      if (cleaned.length) {
        const csv = parse(cleaned);
        archive.append(csv, { name: "collections.csv" });
      }
    }

    // Export products
    if (selectedData.includes("products")) {
      const products = await ProductModel.find({ storeRef: storeId }).lean();
      const cleaned = removeMetaFields(products);
      if (cleaned.length) {
        const csv = parse(cleaned);
        archive.append(csv, { name: "products.csv" });
      }
    }

    // Export sections
    if (selectedData.includes("sections")) {
      const sections = await SectionModel.find({ storeRef: storeId }).lean();
      const cleaned = removeMetaFields(sections);
      if (cleaned.length) {
        const csv = parse(cleaned);
        archive.append(csv, { name: "sections.csv" });
      }
    }

    // Export contents
    if (selectedData.includes("contents")) {
      const contents = await ContentModel.find({ storeRef: storeId }).lean();
      const cleaned = removeMetaFields(contents);
      if (cleaned.length) {
        const csv = parse(cleaned);
        archive.append(csv, { name: "contents.csv" });
      }
    }

    archive.finalize();
  } catch (err) {
    console.error("CSV Export Error:", err);
    return res.status(500).json({ message: "Failed to export site data as CSV." });
  }
};

module.exports = { exportSite };
