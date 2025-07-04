const { ProductModel } = require("../Models/ProductModel");
const { mongoose } = require("mongoose");
const { ReviewModel } = require("../Models/ReviewModel");
const { paginate } = require("../Helpers/pagination");
const { searchSuggestion } = require("../Helpers/searchSuggest");

module.exports = {
  // add product
  addProduct: async (req, res) => {
    const { storeId } = req.params;

    const newProduct = new ProductModel({ ...req.body, storeRef: storeId });
    try {
      const savedProduct = await newProduct.save();
      return res.status(201).json({
        success: true,
        data: savedProduct,
      });
    } catch (error) {
      console.error("Error adding product:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // get product
  getProducts: async (req, res) => {
    const { storeId } = req.params;
    const { collection, productId, page = 0, limit = 0, filter } = req.query;

    try {
      const query = { storeRef: storeId };

      // Filter by collection
      if (collection) {
        const ids = collection.split(',').map(id => id.trim());
        const allValid = ids.every(id => mongoose.Types.ObjectId.isValid(id));
        if (!allValid) return res.status(400).json({ message: "Invalid collection ID format" });
        query.collections = { $in: ids.map(id => new mongoose.Types.ObjectId(id)) };
      }

      // Filter by product ID
      if (productId) {
        const ids = productId.split(',').map(id => id.trim());
        const allValid = ids.every(id => mongoose.Types.ObjectId.isValid(id));
        if (!allValid) return res.status(400).json({ message: "Invalid product ID format" });
        query._id = { $in: ids.map(id => new mongoose.Types.ObjectId(id)) };
      }

      let sort = { createdAt: -1 };
      if (filter === "lowToHigh") {
        sort = { price: 1 };
      } else if (filter === "highToLow") {
        sort = { price: -1 };
      } else if (filter === "topRated") {
        sort = { wantsCustomerReview: -1, "ratings.average": -1, "ratings.count": -1 };
        useAggregation = true;
      } else if (filter === "inStock") {
        query.stock = { $gt: 0 };
      }

      const { data, totalData } = await paginate(ProductModel, query, { page, limit, sort });

      return res.status(200).json({
        success: true,
        data,
        totalData
      });
    } catch (error) {
      console.error("Error fetching product data:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  // edit product
  editProduct: async (req, res) => {
    const { storeId } = req.params;
    const productID = req.query.id;

    try {
      const product = await ProductModel.findOne({
        _id: productID,
        storeRef: storeId,
      });

      if (!product) {
        return res
          .status(404)
          .json({ message: "Product not found for this store" });
      }

      Object.assign(product, req.body);

      await product.save();

      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // delete product
  deleteProduct: async (req, res) => {
    const productID = req.query.id;
    const { storeId } = req.params;

    if (!mongoose.isValidObjectId(productID) || !productID) {
      return res
        .status(400)
        .json({ message: "Invalid product ID or ID is not defined" });
    }

    try {
      const product = await ProductModel.deleteOne({
        _id: productID,
        storeRef: storeId,
      });

      if (product.deletedCount === 0) {
        return res
          .status(404)
          .json({ message: "Product not found or unauthorized" });
      }

      await ReviewModel.deleteMany({
        productId: productID,
        storeRef: storeId,
      });

      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // search products 
  productSearchSuggestion: async (req, res) => {
    const { searchQuery } = req.query;
    const { storeId } = req.params;

    try {
      const results = await searchSuggestion({
        Model: ProductModel,
        searchTerm: searchQuery,
        field: 'name',
        extraQuery: { storeRef: storeId },
        projection: { _id: 1, name: 1 },
      });

      res.status(200).json({ success: true, data: results });
    } catch (err) {
      console.error("error fetching product suggestion:", err?.message || err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

};


