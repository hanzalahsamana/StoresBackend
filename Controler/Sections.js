const { default: mongoose } = require("mongoose");
const { SectionSchema } = require("../Models/SectionsModal");

const getSections = async (req, res) => {
  const type = req.collectionType;
  try {
    const SectionModel = mongoose.model(
      type + "_section",
      SectionSchema,
      type + "_section"
    );

    const sections = await SectionModel.find().sort({ order: 1 });

    return res.status(200).json(sections);
  } catch (e) {
    return res.status(500).json({ message: e.message || "An error occurred" });
  }
};

const updateSection = async (req, res) => {
  const type = req.collectionType;
  const sectionID = req.query.id;

  try {
    if (!mongoose.isValidObjectId(sectionID) || !sectionID) {
      return res
        .status(400)
        .json({ message: "Invalid id OR id is not defined" });
    }

    const SectionModel = mongoose.model(
      type + "_section",
      SectionSchema,
      type + "_section"
    );

    const section = await SectionModel.findById(sectionID);

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

    return res.status(200).json(section);
  } catch (e) {
    return res.status(500).json({ message: e.message || "An error occurred" });
  }
};

const createSection = async (req, res) => {
  const type = req.collectionType;
  const sectionToAdd = req.body;
  const { order } = sectionToAdd;

  try {
    const SectionModel = mongoose.model(
      type + "_section",
      SectionSchema,
      type + "_section"
    );

    await SectionModel.updateMany(
      { order: { $gte: order } },
      { $inc: { order: 1 } }
    );

    const section = new SectionModel(sectionToAdd);
    await section.save();

    const allSections = await SectionModel.find().sort({ order: 1 });

    return res.status(200).json(allSections);
  } catch (e) {
    return res.status(500).json({ message: e.message || "An error occurred" });
  }
};

const deleteSection = async (req, res) => {
  const type = req.collectionType;
  const sectionId = req.query.id;

  try {
    const SectionModel = mongoose.model(
      type + "_section",
      SectionSchema,
      type + "_section"
    );

    // Find the section to be deleted
    const sectionToDelete = await SectionModel.findById(sectionId);
    if (!sectionToDelete) {
      return res.status(404).json({ message: "Section not found" });
    }

    const deletedOrder = sectionToDelete.order;

    // Delete the section
    await SectionModel.findByIdAndDelete(sectionId);

    // Shift orders for sections that come after the deleted one
    await SectionModel.updateMany(
      { order: { $gt: deletedOrder } },
      { $inc: { order: -1 } } // Decrease order by 1
    );

    // Return updated sections
    const updatedSections = await SectionModel.find().sort({ order: 1 });

    return res.status(200).json(updatedSections);
  } catch (e) {
    return res.status(500).json({ message: e.message || "An error occurred" });
  }
};

const updateSectionOrder = async (req, res) => {
  const type = req.collectionType;
  const sectionId = req.query.id;
  const {newOrder} = req.body;
console.log(type , sectionId , newOrder);

  try {
    const SectionModel = mongoose.model(
      `${type}_section`,
      SectionSchema,
      `${type}_section`
    );

    const session = await mongoose.startSession();
    session.startTransaction();

    const sectionToMove = await SectionModel.findById(sectionId).session(
      session
    );
    if (!sectionToMove) throw new Error("Section not found");

    const currentOrder = sectionToMove.order;

    if (newOrder < 1) throw new Error("Invalid order position");

    const totalSections = await SectionModel.countDocuments().session(session);
    if (newOrder > totalSections) throw new Error("Invalid order position");

    // Update affected sections efficiently
    await SectionModel.updateMany(
      {
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

    // Update the moved section
    await SectionModel.findByIdAndUpdate(sectionId, {
      order: newOrder,
    }).session(session);

    await session.commitTransaction();
    session.endSession();

    // Fetch updated sections sorted by order
    const updatedSections = await SectionModel.find().sort({ order: 1 });

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

module.exports = { getSections, updateSection, createSection, deleteSection , updateSectionOrder };
