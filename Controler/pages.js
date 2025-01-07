const { default: mongoose } = require("mongoose");
const { pageSchema } = require("../Models/PagesModel");
const SeedDefaultPages = require("../InitialSeeding/SeedDefaultPages");

const getPages = async (req, res) => {
  const type = req.collectionType;
  try {
    const PagesModel = mongoose.model(
      type + "_pages",
      pageSchema,
      type + "_pages"
    );

    await SeedDefaultPages(type)

    const pages = await PagesModel.find();

    return res.status(200).json(pages);
  } catch (e) {
    return res.status(500).json({ message: e.message || "An error occurred" });
  }
};

module.exports = { getPages };
