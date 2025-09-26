const { CartModel } = require("../Models/CartModel");
const { CollectionModel } = require("../Models/CollectionModel");
const { ConfigurationModel } = require("../Models/ConfigurationModel");
const { ContactModel } = require("../Models/ContactModel");
const { ContentModel } = require("../Models/ContentModel");
const { OrderModel } = require("../Models/OrderModal");
const { ProductModel } = require("../Models/ProductModel");
const { ReviewModel } = require("../Models/ReviewModel");
const { SectionModel } = require("../Models/SectionsModel");
const { SubscriberModel } = require("../Models/SubscriberModal");

const deleteAllData = async (storeIds) => {
    try {
        if (!Array.isArray(storeIds) || storeIds.length === 0) return;
        await Promise.all([
            ProductModel.deleteMany({ storeRef: { $in: storeIds } }),
            SectionModel.deleteMany({ storeRef: { $in: storeIds } }),
            CollectionModel.deleteMany({ storeRef: { $in: storeIds } }),
            CartModel.deleteMany({ storeRef: { $in: storeIds } }),
            ConfigurationModel.deleteMany({ storeRef: { $in: storeIds } }),
            ContactModel.deleteMany({ storeRef: { $in: storeIds } }),
            ContentModel.deleteMany({ storeRef: { $in: storeIds } }),
            OrderModel.deleteMany({ storeRef: { $in: storeIds } }),
            ReviewModel.deleteMany({ storeRef: { $in: storeIds } }),
            SubscriberModel.deleteMany({ storeRef: { $in: storeIds } }),
        ]);
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = { deleteAllData }