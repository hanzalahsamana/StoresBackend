const { default: mongoose } = require("mongoose");
const { SectionModel } = require("../Models/SectionsModel");

const addSection = async (req, res) => {
  const { storeId } = req.params;
  const sectionToAdd = req.body;

  if (!sectionToAdd || Object.keys(sectionToAdd).length === 0) {
    return res.status(400).json({ message: "Data is required" });
  }

  const { order } = sectionToAdd;

  if (!order || typeof order !== "number") {
    return res.status(400).json({ message: "Order must be a valid number" });
  }

  try {
    await SectionModel.updateMany(
      { storeRef: storeId, order: { $gte: order } },
      { $inc: { order: 1 } }
    );

    const section = new SectionModel({
      ...sectionToAdd,
      storeRef: storeId,
    });

    await section.save();

    const allSections = await SectionModel.find({ storeRef: storeId }).sort({
      order: 1,
    });

    return res.status(200).json(allSections);
  } catch (e) {
    return res.status(500).json({ message: e.message || "An error occurred" });
  }
};

const getSections = async (req, res) => {
  const { storeId } = req.params;

  try {
    const sections = await SectionModel.find({ storeRef: storeId }).sort({
      order: 1,
    });
    return res.status(200).json({
      success: true,
      data: sections,
    });
  } catch (e) {
    console.error("Error fetching sections:", e);
    return res.status(500).json({ message: e.message || "An error occurred" });
  }
};

const editSection = async (req, res) => {
  const { storeId } = req.params;
  const sectionID = req.query.sectionId;

  if (!mongoose.isValidObjectId(sectionID) || !sectionID) {
    return res
      .status(400)
      .json({ message: "Invalid section id OR id is not defined" });
  }

  try {
    const section = await SectionModel.findOne({
      _id: sectionID,
      storeRef: storeId,
    });

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    const updatedFields = req.body;

    if (!updatedFields || Object.keys(updatedFields).length === 0) {
      return res.status(400).json({ message: "Data is required" });
    }

    Object.assign(section.content, updatedFields);
    section.markModified("content");
    await section.save();

    return res.status(200).json({
      success: true,
      section,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message || "An error occurred" });
  }
};

const deleteSection = async (req, res) => {
  const { storeId } = req.params;
  const sectionId = req.query.sectionId;

  try {
    if (!mongoose.isValidObjectId(sectionId)) {
      return res.status(400).json({ message: "Invalid section ID" });
    }

    const sectionToDelete = await SectionModel.findOne({
      _id: sectionId,
      storeRef: storeId,
    });
    if (!sectionToDelete) {
      return res.status(404).json({ message: "Section not found" });
    }

    const deletedOrder = sectionToDelete.order;

    await SectionModel.deleteOne({ _id: sectionId });

    await SectionModel.updateMany(
      { storeRef: storeId, order: { $gt: deletedOrder } },
      { $inc: { order: -1 } }
    );

    const updatedSections = await SectionModel.find({ storeRef: storeId }).sort(
      { order: 1 }
    );

    return res.status(200).json(updatedSections);
  } catch (e) {
    return res.status(500).json({ message: e.message || "An error occurred" });
  }
};

const changeSectionOrder = async (req, res) => {
  const { storeId } = req.params;
  const sectionId = req.query.sectionId;
  const { newOrder } = req.body;

  try {
    if (!mongoose.isValidObjectId(sectionId)) {
      throw new Error("Invalid section ID");
    }
    if (!newOrder || typeof newOrder !== "number") {
      throw new Error("New order must be a valid number");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const sectionToMove = await SectionModel.findOne({
      _id: sectionId,
      storeRef: storeId,
    }).session(session);
    if (!sectionToMove) throw new Error("Section not found");

    const currentOrder = sectionToMove.order;

    if (newOrder < 1) throw new Error("Invalid order position");

    const totalSections = await SectionModel.countDocuments({
      storeRef: storeId,
    }).session(session);
    if (newOrder > totalSections) throw new Error("Invalid order position");

    await SectionModel.updateMany(
      {
        storeRef: storeId,
        order: {
          $gte: Math.min(currentOrder, newOrder),
          $lte: Math.max(currentOrder, newOrder),
        },
        _id: { $ne: sectionId },
      },
      [
        {
          $set: {
            order: {
              $cond: {
                if: { $eq: ["$order", currentOrder] },
                then: newOrder,
                else: {
                  $cond: {
                    if: { $gt: [currentOrder, newOrder] },
                    then: { $add: ["$order", 1] },
                    else: { $subtract: ["$order", 1] },
                  },
                },
              },
            },
          },
        },
      ]
    ).session(session);

    await SectionModel.findByIdAndUpdate(sectionId, {
      order: newOrder,
    }).session(session);

    await session.commitTransaction();
    session.endSession();

    const updatedSections = await SectionModel.find({ storeRef: storeId }).sort(
      { order: 1 }
    );

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      sections: updatedSections,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSections,
  addSection,
  editSection,
  deleteSection,
  changeSectionOrder,
};
