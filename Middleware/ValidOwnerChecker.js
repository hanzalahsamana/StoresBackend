const mongoose = require('mongoose');

const { StoreModal } = require('../Models/StoreModal');
const { UserModal } = require('../Models/userModal');

const validOwnerChecker = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const { storeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId or storeId',
      });
    }

    const userExists = await UserModal.exists({ _id: userId });

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: `User not found: ${userId}`,
      });
    }

    const store = await StoreModal.findOne({ _id: storeId, userRef: userId }).lean();

    if (!store) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized or store not found.',
      });
    }

    next();
  } catch (err) {
    console.error('Error in validOwnerChecker:', err);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};

module.exports = validOwnerChecker;
