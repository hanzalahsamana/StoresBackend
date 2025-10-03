const { CollectionModel } = require('../Models/CollectionModel');
const { mongoose } = require('mongoose');
const { ProductModel } = require('../Models/ProductModel');
const { generateSlug } = require('../Utils/generateSlug');
const { paginate } = require('../Helpers/pagination');
const { searchSuggestion } = require('../Helpers/searchSuggest');

module.exports = {
  // add category
  addCollection: async (req, res) => {
    const { storeId } = req.params;
    const { name, image, products, metaDescription, metaTitle } = req.body;
    const uniqueSlug = await generateSlug(name, CollectionModel);

    try {
      const newCollection = new CollectionModel({
        name,
        image,
        slug: uniqueSlug,
        storeRef: storeId,
        metaDescription,
        metaTitle,
      });

      const savedCollection = await newCollection.save();
      if (products && products.length > 0) {
        await ProductModel.updateMany({ _id: { $in: products }, storeRef: storeId }, { $addToSet: { collections: savedCollection._id } });
      }

      let savedProducts = [];
      savedProducts = await ProductModel.find({ _id: { $in: products } }, { _id: 1, name: 1 });

      return res.status(201).json({
        success: true,
        data: { ...savedCollection.toObject?.(), products: savedProducts },
      });
    } catch (error) {
      console.error('Error adding collection:', error);
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Collection name already exists.',
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  },

  // get category
  getCollections: async (req, res) => {
    const { storeId } = req.params;
    const { collectionIds, page = 1, limit = 10 } = req.query;

    try {
      const query = { storeRef: new mongoose.Types.ObjectId(storeId) };

      // Handle multiple collection IDs
      if (collectionIds) {
        const idArray = collectionIds
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean);

        // Validate all IDs
        const invalidIds = idArray.filter((id) => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
          return res.status(400).json({
            message: `Invalid collection ID(s): ${invalidIds.join(', ')}`,
          });
        }

        const objectIds = idArray.map((id) => new mongoose.Types.ObjectId(id));
        query._id = { $in: objectIds };
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
                  name: 1,
                },
              },
            ],
          },
        },
      ];

      const { data, totalData } = await paginate(
        CollectionModel,
        query,
        {
          page,
          limit,
          sort: { createdAt: -1 },
        },
        pipeline
      );

      return res.status(200).json({ success: true, data, totalData });
    } catch (e) {
      return res.status(500).json({ message: e.message || 'An error occurred' });
    }
  },

  // get single collection
  getSingleCollection: async (req, res) => {
    const { storeId } = req.params;
    const { collectionSlug } = req.query;

    try {
      if (!collectionSlug) {
        return res.status(400).json({ message: 'collectionSlug is required', success: false });
      }

      // find collection by slug
      const collection = await CollectionModel.findOne({
        slug: collectionSlug,
        storeRef: new mongoose.Types.ObjectId(storeId),
      });

      if (!collection) {
        return res.status(404).json({ message: 'Collection not found', success: false });
      }

      // find all products linked to this collection
      const products = await ProductModel.find({
        collections: collection._id,
        storeRef: storeId,
      });

      return res.status(200).json({
        success: true,
        data: {
          ...collection.toObject(),
          products, // complete product data
        },
      });
    } catch (e) {
      console.error('Error fetching single collection:', e);
      return res.status(500).json({ message: 'Something went wrong!', success: false });
    }
  },

  // edit collection
  editCollection: async (req, res) => {
    const { storeId } = req.params;
    const collectionId = req.query.collectionId;
    const { name, image, products, metaDescription, metaTitle } = req.body;

    try {
      const collection = await CollectionModel.findById(collectionId);

      if (!collection) {
        return res.status(404).json({ message: 'Collection not found' });
      }

      const updatedProductIds = (products || []).map((p) => p.toString());

      const previouslyLinkedProducts = await ProductModel.find({
        collections: collectionId,
        storeRef: storeId,
      }).select('_id');

      const previouslyLinkedIds = previouslyLinkedProducts.map((p) => p._id.toString());

      const removedProductIds = previouslyLinkedIds.filter((id) => !updatedProductIds.includes(id));
      const newlyAddedProductIds = updatedProductIds.filter((id) => !previouslyLinkedIds.includes(id));

      if (removedProductIds.length > 0) {
        await ProductModel.updateMany({ _id: { $in: removedProductIds }, storeRef: storeId }, { $pull: { collections: collectionId } });
      }

      if (newlyAddedProductIds.length > 0) {
        await ProductModel.updateMany({ _id: { $in: newlyAddedProductIds }, storeRef: storeId }, { $addToSet: { collections: collectionId } });
      }
      let savedProducts = [];
      savedProducts = await ProductModel.find({ _id: { $in: products } }, { _id: 1, name: 1 });

      const uniqueSlug = await generateSlug(name);

      Object.assign(collection, { name, image, slug: uniqueSlug, metaDescription, metaTitle });
      const savedCollection = await collection.save();

      res.status(200).json({
        success: true,
        data: { ...savedCollection.toObject?.(), products: savedProducts },
      });
    } catch (error) {
      console.log('Error updating collection!', error?.message || error);
      res.status(500).json({ message: error.message });
    }
  },

  // delete category
  deleteCollection: async (req, res) => {
    const { storeId } = req.params;
    let { collectionId } = req.query;
    collectionId = [collectionId];
    try {
      // ✅ Normalize collectionId into an array
      if (!collectionId || collectionId.length === 0) {
        return res.status(400).json({ message: 'collectionId is required' });
      }

      // ✅ Validate all IDs
      const validIds = collectionId.filter((id) => mongoose.isValidObjectId(id));
      if (validIds.length === 0) {
        return res.status(400).json({ message: 'Invalid collectionId(s)' });
      }

      // Step 1: Delete multiple collections
      const deleted = await CollectionModel.deleteMany({
        _id: { $in: validIds },
        storeRef: storeId,
      });

      if (deleted.deletedCount === 0) {
        return res.status(404).json({ message: 'Collection(s) not found' });
      }

      // Step 2: Remove collection refs from all products
      await ProductModel.updateMany({ storeRef: storeId }, { $pull: { collections: { $in: validIds } } });

      return res.status(200).json({ message: 'Collection(s) Deleted Successfully' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  // search collection
  collectionSearchSuggestion: async (req, res) => {
    const { searchQuery } = req.query;
    const { storeId } = req.params;

    try {
      const results = await searchSuggestion({
        Model: CollectionModel,
        searchTerm: searchQuery,
        field: 'name',
        extraQuery: { storeRef: storeId },
        projection: { _id: 1, name: 1 },
      });

      res.status(200).json({ success: true, data: results });
    } catch (err) {
      console.error('error fetching product suggestion:', err?.message || err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
};
