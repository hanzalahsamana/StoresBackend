const { ProductModel } = require("../Models/ProductModel");
const { mongoose } = require("mongoose");
const { ReviewModel } = require("../Models/ReviewModel");
const { paginate } = require("../Helpers/pagination");

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

      if (collection) {
        const ids = Array.isArray(collection) ? collection : [collection];
        const allValid = ids.every(id => mongoose.Types.ObjectId.isValid(id));
        if (!allValid) res.status(400).json({ message: "Invalid collection ID format" });
        query.collections = { $in: ids.map(id => new mongoose.Types.ObjectId(id)) };
      }

      // Filter by product ID
      if (productId && productId.length !== 0) {
        const ids = Array.isArray(productId) ? productId : [productId];
        const allValid = ids.every(id => mongoose.Types.ObjectId.isValid(id));
        if (!allValid) res.status(400).json({ message: "Invalid product ID format" });
        const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
        query._id = { $in: objectIds };
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
};
