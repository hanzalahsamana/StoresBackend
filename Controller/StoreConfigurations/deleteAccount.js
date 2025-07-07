const { deleteAllData } = require("../../Helpers/deleteAllData");
const { StoreModal } = require("../../Models/StoreModal");
const { UserModal } = require("../../Models/userModal");
const { compareHash } = require("../../Utils/BCrypt");

module.exports = {
    deleteAccount: async (req, res) => {
        try {
            const { password } = req.body;
            const userId = req.query.userId;

            if (!password) {
                return res.status(400).json({ message: "Password is required", success: false });
            }

            const user = await UserModal.findById(userId).select("+password");
            if (!user) {
                return res.status(404).json({ message: "Invalid userId", success: false });
            }

            const isPasswordValid = await compareHash(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid password", success: false });
            }

            const stores = await StoreModal.find({ userRef: userId });
            const storeIds = stores.map(store => store._id);

            if (storeIds.length > 0) {
                await deleteAllData(storeIds);
                await StoreModal.deleteMany({ userRef: userId });
            }

            await UserModal.findByIdAndDelete(userId);

            return res.status(200).json({ message: "Account and all related data deleted", success: true });

        } catch (e) {
            console.error("Error deleting account", e?.message || e);
            return res.status(500).json({ message: "Something went wrong!", success: false });
        }
    }
};
