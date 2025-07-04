const { CollectionModel } = require("../Models/CollectionModel");
const { mongoose } = require("mongoose");
const { ProductModel } = require("../Models/ProductModel");
const generateSlug = require("../Utils/generateSlug");
const { paginate } = require("../Helpers/pagination");

module.exports = {
  // add category
  addCollection: async (req, res) => {
    const { storeId } = req.params;
    const { name, image, products } = req.body;

    try {
      const newCollection = new CollectionModel({
        name,
        image,
        slug: generateSlug(name),
        storeRef: storeId,
      });

      const savedCollection = await newCollection.save();
      if (products && products.length > 0) {
        await ProductModel.updateMany(
          { _id: { $in: products }, storeRef: storeId },
          { $addToSet: { collections: savedCollection._id } }
        );
      }

      let savedProducts = [];
      savedProducts = await ProductModel.find(
        { _id: { $in: products } },
        { _id: 1, name: 1 }
      );

      return res.status(201).json({
        success: true,
        data: { ...savedCollection.toObject?.(), products: savedProducts },
      });
    } catch (error) {
      console.error("Error adding collection:", error);
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Collection name already exists.",
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // get category
  getCollections: async (req, res) => {
    const { storeId } = req.params;
    const { collectionId, page = 1, limit = 10 } = req.query;

    try {
      const query = { storeRef: new mongoose.Types.ObjectId(storeId) };

      if (collectionId) {
        if (!mongoose.Types.ObjectId.isValid(collectionId)) {
          return res.status(400).json({ message: "Invalid collection ID format" });
        }
        query._id = new mongoose.Types.ObjectId(collectionId);
      }

      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'collections',
            as: 'products',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1
                }
              }
            ]
          }
        }
      ];

      const { data, totalData } = await paginate(CollectionModel, query, {
        page,
        limit,
        sort: { createdAt: -1 },
      }, pipeline);

      return res.status(200).json({ success: true, data, totalData });
    } catch (e) {
      return res.status(500).json({ message: e.message || "An error occurred" });
    }
  },



  // edit collection
  editCollection: async (req, res) => {
    const { storeId } = req.params;
    const collectionId = req.query.collectionId;
    const { name, image, products } = req.body;

    try {
      const collection = await CollectionModel.findById(collectionId);

      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }

      const updatedProductIds = (products || []).map((p) => p.toString());

      const previouslyLinkedProducts = await ProductModel.find({
        collections: collectionId,
        storeRef: storeId,
      }).select("_id");

      const previouslyLinkedIds = previouslyLinkedProducts.map((p) =>
        p._id.toString(),
      );

      const removedProductIds = previouslyLinkedIds.filter(
        (id) => !updatedProductIds.includes(id),
      );
      const newlyAddedProductIds = updatedProductIds.filter(
        (id) => !previouslyLinkedIds.includes(id),
      );

      if (removedProductIds.length > 0) {
        await ProductModel.updateMany(
          { _id: { $in: removedProductIds }, storeRef: storeId },
          { $pull: { collections: collectionId } },
        );
      }

      if (newlyAddedProductIds.length > 0) {
        await ProductModel.updateMany(
          { _id: { $in: newlyAddedProductIds }, storeRef: storeId },
          { $addToSet: { collections: collectionId } },
        );
      }
      let savedProducts = []
      savedProducts = await ProductModel.find(
        { _id: { $in: [products] } },
        { _id: 1, name: 1 }
      );

      Object.assign(collection, { name, image, slug: generateSlug(name) });
      const savedCollection = await collection.save();

      res.status(200).json({
        success: true,
        data: { ...savedCollection.toObject?.(), products: savedProducts },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // delete category
  deleteCollection: async (req, res) => {
    const { storeId } = req.params;
    const collectionId = req.query.collectionId;

    if (!mongoose.isValidObjectId(collectionId) || !collectionId) {
      return res
        .status(400)
        .json({ message: "Invalid id OR id is not defined" });
    }

    try {
      // Step 1: Delete the collection by ID and storeRef
      const deleted = await CollectionModel.deleteOne({
        _id: collectionId,
        storeRef: storeId,
      });

      if (deleted.deletedCount === 0) {
        return res.status(404).json({ message: "Collection not found" });
      }

      // Step 2: Remove collection ref from all products
      await ProductModel.updateMany(
        { storeRef: storeId, collections: collectionId },
        { $pull: { collections: collectionId } },
      );

      return res
        .status(200)
        .json({ message: "Collection Deleted Successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};
