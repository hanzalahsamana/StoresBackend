const { default: mongoose } = require("mongoose");
const { ContentModel } = require("../Models/ContentModel");

const getContents = async (req, res) => {
  const { storeId } = req.params;
  const { contentId } = req.query;

  try {
    const filter = { storeRef: storeId };
    if (contentId) {
      filter._id = contentId;
    }

    const contents = await ContentModel.find(filter);

    if (contentId && contents.length === 0) {
      return res.status(404).json({ message: "Content not found" });
    }

    return res.status(200).json({
      message: "Contents fetched successfully",
      data: contents,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message || "An error occurred" });
  }
};

const editContent = async (req, res) => {
  const { contentId } = req.query;
  const { storeId } = req.params;

  try {
    const content = await ContentModel.findOne({
      _id: contentId,
      storeRef: storeId,
    });

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    const updatedFields = req.body;

    Object.assign(content, updatedFields);

    await content.save();
    return res.status(200).json({
      message: "Content updated successfully",
      data: content,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message || "An error occurred" });
  }
};

module.exports = { getContents, editContent };
