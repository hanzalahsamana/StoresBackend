const { ConfigurationModel } = require('../Models/ConfigurationModel');
const { StoreModal } = require('../Models/StoreModal');
const { UserModal } = require('../Models/userModal');

// Add Announcement
const addAnnouncement = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { announcementName } = req.query; // e.g. "discountBar" or "popup"
    const data = req.body;

    if (!announcementName) {
      return res.status(400).json({
        success: false,
        message: 'Announcement name is required!',
      });
    }

    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Valid announcement data is required!',
      });
    }

    const config = await ConfigurationModel.findOne({ storeRef: storeId });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Store not found!',
      });
    }

    // Ensure announcements object exists
    if (!config.announcements) {
      config.announcements = {};
    }

    // Update only the specified announcement (overwrite or create if not exists)
    config.announcements[announcementName] = data;

    // Save the updated configuration
    await config.save();
    console.log('config.announcements', config.announcements);

    return res.status(200).json({
      success: true,
      message: 'Announcement saved successfully.',
      data: config.announcements,
    });
  } catch (error) {
    console.error('Error adding announcement:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Internal server error.',
    });
  }
};

// Delete Announcement
const deleteAnnouncement = async (req, res) => {
  const { userId, announcementId } = req.query;

  if (!userId || !announcementId) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const user = await UserModal.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const store = await StoreModal.findOne({ brand_Id: user.brand_Id });
    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    const announcement = store.announcements.id(announcementId);
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found.' });
    }

    announcement.deleteOne();
    const savedStore = await store.save();

    return res.status(200).json({
      message: 'Announcement deleted successfully.',
      data: savedStore.announcements,
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return res.status(500).json({ message: error?.message });
  }
};

module.exports = { addAnnouncement, deleteAnnouncement };
