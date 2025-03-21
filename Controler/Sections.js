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

// const updateSectionOrder = async (sectionId, newOrder) => {
//   try {
//     const sectionToMove = await Section.findById(sectionId);
//     if (!sectionToMove) throw new Error("Section not found");

//     const currentOrder = sectionToMove.order;

//     // Find all sections
//     const sections = await Section.find().sort({ order: 1 });

//     if (newOrder < 1 || newOrder > sections.length) {
//       throw new Error("Invalid order position");
//     }

//     // Update order of affected sections
//     for (const section of sections) {
//       if (section._id.equals(sectionId)) {
//         section.order = newOrder;
//       } else if (currentOrder < newOrder && section.order > currentOrder && section.order <= newOrder) {
//         section.order -= 1;
//       } else if (currentOrder > newOrder && section.order < currentOrder && section.order >= newOrder) {
//         section.order += 1;
//       }
//       await section.save();
//     }

//     console.log("Order updated successfully");
//     return { success: true, message: "Order updated successfully" };
//   } catch (error) {
//     console.error("Error updating order:", error);
//     return { success: false, message: error.message };
//   }
// };

module.exports = { getSections, updateSection, createSection, deleteSection };
