const { ConfigurationModel } = require('../Models/ConfigurationModel');
const { StoreModal } = require('../Models/StoreModal');
const { UserModal } = require('../Models/userModal');

const addAnnouncement = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { announcementName } = req.query;
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

    if (announcementName === 'discountBar' && !data?.description) {
      return res.status(400).json({
        success: false,
        message: 'Text is required!',
      });
    }

    let config = await ConfigurationModel.findOne({ storeRef: storeId });

    if (!config) {
      config = new ConfigurationModel({
        storeRef: storeId,
        announcements: {},
      });
    }

    if (!config.announcements) {
      config.announcements = {};
    }

    config.announcements[announcementName] = data;
    console.log('config.announcements[announcementName]', (config.announcements[announcementName] = data));

    await config.save();

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

module.exports = { addAnnouncement };
