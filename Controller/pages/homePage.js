const mongoose = require("mongoose");
const { SectionModel } = require("../../Models/SectionsModel");
const { ProductModel } = require("../../Models/ProductModel");
const { CollectionModel } = require("../../Models/CollectionModel");

module.exports = {
    getHomePageData: async (req, res) => {
        try {
            const { storeId } = req.params;

            const sections = await SectionModel.find({ storeRef: storeId }).sort({ order: 1 }).lean();

            const collectionIds = [];
            const productIds = [];
            const categoryIds = [];

            for (const sec of sections) {
                if (sec.type === "feature_collection") {
                    collectionIds.push(...(sec.content?.collections || []));
                }
                if (sec.type === "feature_product") {
                    if (sec.content?.selectedProducts?.length) {
                        productIds.push(...sec.content.selectedProducts);
                    } else if (sec.content?.selectedcollections?.length) {
                        categoryIds.push(...sec.content.selectedcollections);
                    }
                }
            }

            const [collections, selectedProducts, categoryProducts] = await Promise.all([
                CollectionModel.find({ _id: { $in: collectionIds } }).lean(),
                ProductModel.find({ _id: { $in: productIds } }).lean(),
                ProductModel.find({ collections: { $in: categoryIds } }).lean(),
            ]);

            const collectionsMap = Object.fromEntries(collections.map(c => [c._id.toString(), c]));
            const productMap = Object.fromEntries(selectedProducts.map(p => [p._id.toString(), p]));
            const categoryProductMap = {};

            for (const product of categoryProducts) {
                for (const cid of product.collections || []) {
                    const key = cid.toString();
                    if (!categoryProductMap[key]) categoryProductMap[key] = [];
                    categoryProductMap[key].push(product);
                }
            }

            for (const sec of sections) {
                if (sec.type === "feature_collection") {
                    sec.content.collections = (sec.content.collections || [])
                        .map(id => collectionsMap[id.toString()])
                        .filter(Boolean);
                }
                if (sec.type === "feature_product") {
                    if (sec.content?.selectedProducts?.length) {
                        sec.content.selectedProducts = sec.content.selectedProducts
                            .map(id => productMap[id.toString()])
                            .filter(Boolean);
                    }
                    if (sec.content?.selectedcollections?.length) {
                        sec.content.selectedcollections = sec.content.selectedcollections
                            .flatMap(cid => categoryProductMap[cid.toString()] || []);
                    }
                }
            }

            res.status(200).json({ success: true, data: sections });
        } catch (error) {
            console.error("Error fetching home page data:", error);
            res.status(500).json({ success: false, message: "Something went wrong!" });
        }
    }
};
