const mongoose = require('mongoose');
const { UserModal } = require('../Models/userModal');

const superAdminChecker = async (req, res, next) => {
    try {
        const { userId } = req.query;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid userId!',
            });
        }

        const user = await UserModal.findById(userId);

        if (user.role !== "superAdmin") {
            return res.status(400).json({ message: "Access denied", success: false })
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User not found: ${userId}`,
            });
        }

        next();
    } catch (err) {
        console.error('Error in validOwnerChecker:', err);
        return res.status(500).json({ message: 'Something went wrong.' });
    }
};

module.exports = superAdminChecker;
