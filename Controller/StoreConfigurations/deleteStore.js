const { StoreModal } = require("../../Models/StoreModal");
const { UserModal } = require("../../Models/userModal");
const { ProductModel } = require("../../Models/ProductModel");
const { SectionModel } = require("../../Models/SectionsModel");
const { CollectionModel } = require("../../Models/CollectionModel");
const { CartModel } = require("../../Models/CartModel");
const { ConfigurationModel } = require("../../Models/ConfigurationModel");
const { ContactModel } = require("../../Models/ContactModel");
const { ContentModel } = require("../../Models/ContentModel");
const { OrderModel } = require("../../Models/OrderModal");
const { ReviewModel } = require("../../Models/ReviewModel");
const { SubscriberModel } = require("../../Models/SubscriberModal");
const { compareHash } = require("../../Utils/BCrypt");

module.exports = {
    deleteStore: async (req, res) => {
        try {
            const { storeId } = req.params;
            const { password } = req.body;

            if (!storeId || !password) {
                return res.status(400).json({ message: "Store ID and password are required", success: false });
            }

            const store = await StoreModal.findById(storeId);
            if (!store) {
                return res.status(404).json({ message: "Store not found", success: false });
            }

            const user = await UserModal.findById(store.userRef).select("+password");
            if (!user) {
                return res.status(404).json({ message: "User not found", success: false });
            }

            const isPasswordCorrect = await compareHash(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(401).json({ message: "Invalid password", success: false });
            }

            await Promise.all([
                ProductModel.deleteMany({ storeRef: storeId }),
                SectionModel.deleteMany({ storeRef: storeId }),
                CollectionModel.deleteMany({ storeRef: storeId }),
                CartModel.deleteMany({ storeRef: storeId }),
                ConfigurationModel.deleteMany({ storeRef: storeId }),
                ContactModel.deleteMany({ storeRef: storeId }),
                ContentModel.deleteMany({ storeRef: storeId }),
                OrderModel.deleteMany({ storeRef: storeId }),
                ReviewModel.deleteMany({ storeRef: storeId }),
                SubscriberModel.deleteMany({ storeRef: storeId }),
            ]);

            await StoreModal.findByIdAndDelete(storeId);

            return res.status(200).json({ message: "Store and all related data deleted successfully", success: true });

        } catch (error) {
            console.error("Error deleting store:", error?.message || error);
            return res.status(500).json({ message: "Something went wrong!", success: false });
        }
    }
}
