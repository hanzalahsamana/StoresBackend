const { StoreModal } = require("../Models/StoreModal");
const { UserModal } = require("../Models/userModal");

// Add Announcement
const addAnnouncement = async (req, res) => {
  const { userId } = req.query;
  const { announcement } = req.body;

  if (!userId || !announcement || !announcement.title) {
    return res.status(400).json({
      error: "Missing required fields or announcement format is invalid.",
    });
  }

  try {
    const user = await UserModal.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const store = await StoreModal.findOne({ brand_Id: user.brand_Id });
    if (!store) {
      return res.status(404).json({ error: "Store not found." });
    }

    store.announcements.push(announcement);
    const savedStore = await store.save();

    return res.status(200).json({
      message: "Announcement added successfully.",
      data: savedStore.announcements,
    });
  } catch (error) {
    console.error("Error adding announcement:", error);
    return res.status(500).json({ message: error?.message });
  }
};

// Delete Announcement
const deleteAnnouncement = async (req, res) => {
  const { userId, announcementId } = req.query;

  if (!userId || !announcementId) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const user = await UserModal.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const store = await StoreModal.findOne({ brand_Id: user.brand_Id });
    if (!store) {
      return res.status(404).json({ error: "Store not found." });
    }

    const announcement = store.announcements.id(announcementId);
    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found." });
    }

    announcement.deleteOne();
    const savedStore = await store.save();

    return res.status(200).json({
      message: "Announcement deleted successfully.",
      data: savedStore.announcements,
    });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return res.status(500).json({ message: error?.message });
  }
};

module.exports = { addAnnouncement, deleteAnnouncement };
