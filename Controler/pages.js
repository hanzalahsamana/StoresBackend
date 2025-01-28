const { default: mongoose } = require("mongoose");
const { pageSchema } = require("../Models/PagesModel");

const getPages = async (req, res) => {
  const type = req.collectionType;
  try {
    const PagesModel = mongoose.model(
      type + "_pages",
      pageSchema,
      type + "_pages"
    );

    const pages = await PagesModel.find();

    return res.status(200).json(pages);
  } catch (e) {
    return res.status(500).json({ message: e.message || "An error occurred" });
  }
};

const updatePage = async (req, res) => {
  const type = req.collectionType;
  const pageID = req.query.id;
  console.log("Page ID:", pageID); // Logs the value
  console.log("Type of Page ID:", typeof pageID); // Logs the type
  console.log("Is Valid ObjectId:", mongoose.isValidObjectId(pageID)); 
  

  try {
    if (!mongoose.isValidObjectId(pageID) || !pageID) {
      return res
        .status(400)
        .json({ message: "Invalid id OR id is not defined" });
    }

    const PagesModel = mongoose.model(
      type + "_pages",
      pageSchema,
      type + "_pages"
    );

    const page = await PagesModel.findById(pageID);

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    const updatedFields = req.body;

    if (!updatedFields || Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ message: "Data is required" });
    }

    Object.assign(page, updatedFields);

    await page.save();

  console.log(type , page);


    return res.status(200).json(page);
  } catch (e) {
    return res.status(500).json({ message: e.message || "An error occurred" });
  }
};

module.exports = { getPages, updatePage };
