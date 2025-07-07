const mongoose = require("mongoose");
const { CollectionModel } = require("../../Models/CollectionModel");
const { ProductModel } = require("../../Models/ProductModel");
const { SectionModel } = require("../../Models/SectionsModel");

module.exports = {
    getHomePageData: async (req, res) => {
        try {
            const { storeId } = req.params;

            const sections = await SectionModel.find({ storeRef: storeId }).sort({ order: 1 }).lean();

            const collectionIds = new Set();
            const productIds = new Set();
            const categoryIds = new Set();

            sections.forEach(sec => {
                const content = sec.content;

                if (sec.type === "feature_collection") {
                    (content?.collections || []).forEach(id => collectionIds.add(id.toString()));
                }

                if (sec.type === "feature_product") {
                    if (content?.selectedProducts?.length)
                        content.selectedProducts.forEach(id => productIds.add(id.toString()));
                    else if (content?.selectedcollections?.length)
                        content.selectedcollections.forEach(id => categoryIds.add(id.toString()));
                }
            });

            const [collections, selectedProducts, categoryProducts] = await Promise.all([
                CollectionModel.find({ _id: { $in: [...collectionIds] } }).lean(),
                productIds.size ? ProductModel.find({ _id: { $in: [...productIds] } }).lean() : [],
                categoryIds.size
                    ? ProductModel.find({
                        collections: { $in: [...categoryIds].map(id => new mongoose.Types.ObjectId(id)) },
                    }).lean()
                    : [],
            ]);

            const collectionsMap = Object.fromEntries(collections.map(c => [c._id.toString(), c]));
            const productMap = Object.fromEntries(selectedProducts.map(p => [p._id.toString(), p]));

            const categoryProductMap = categoryProducts.reduce((acc, product) => {
                product.collections?.forEach(cid => {
                    cid = cid.toString();
                    if (categoryIds.has(cid)) {
                        acc[cid] = acc[cid] || [];
                        acc[cid].push(product);
                    }
                });
                return acc;
            }, {});

            sections.forEach(sec => {
                const content = sec.content;

                if (sec.type === "feature_collection") {
                    content.collections = (content.collections || [])
                        .map(id => collectionsMap[id.toString()])
                        .filter(Boolean);
                }

                if (sec.type === "feature_product") {
                    if (content?.selectedProducts?.length) {
                        content.selectedProducts = content.selectedProducts
                            .map(id => productMap[id.toString()])
                            .filter(Boolean);
                    }

                    if (content?.selectedcollections?.length) {
                        content.selectedcollections = content.selectedcollections
                            .flatMap(cid => categoryProductMap[cid.toString()] || []);
                    }
                }
            });

            return res.status(200).json({ success: true, data: sections });

        } catch (error) {
            console.error("Error fetching home page data:", error?.message || error);
            return res.status(500).json({ message: "Something went wrong!", success: false });
        }
    },
};
