const { ProductModel } = require("../Models/ProductModel");
const { mongoose } = require("mongoose");
const { ReviewModel } = require("../Models/ReviewModel");
const { paginate } = require("../Helpers/pagination");
const { searchSuggestion } = require("../Helpers/searchSuggest");
const { generateSlug } = require("../Utils/generateSlug");

module.exports = {
  // add product
  addProduct: async (req, res) => {
    const { storeId } = req.params;
    const uniqueSlug = await generateSlug(req.body.name, ProductModel);

    const newProduct = new ProductModel({
      ...req.body,
      storeRef: storeId,
      slug: uniqueSlug,
    });
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
    const {
      collectionIds,
      productIds,
      page = 0,
      limit = 0,
      sortBy,
      minPrice,
      maxPrice,
      ...restFilters // contains dynamic filters
    } = req.query;

    try {
      const query = { storeRef: storeId };

      // ✅ Filter: Collection IDs
      if (collectionIds) {
        const ids = collectionIds.split(",").map((id) => id.trim());
        const validIds = ids.filter((id) =>
          mongoose.Types.ObjectId.isValid(id)
        );
        if (validIds.length > 0) {
          query.collections = {
            $in: validIds.map((id) => new mongoose.Types.ObjectId(id)),
          };
        }
      }

      // ✅ Filter: Product IDs
      if (productIds) {
        const ids = productIds.split(",").map((id) => id.trim());
        const validIds = ids.filter((id) =>
          mongoose.Types.ObjectId.isValid(id)
        );
        if (validIds.length > 0) {
          query._id = {
            $in: validIds.map((id) => new mongoose.Types.ObjectId(id)),
          };
        }
      }

      // ✅ Filter: Price Range
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      // ✅ Dynamic Variant Filters: Detect keys NOT in standard filters
      const standardKeys = [
        "collections",
        "productId",
        "page",
        "limit",
        "sortBy",
        "minPrice",
        "maxPrice",
      ];
      Object.entries(restFilters).forEach(([key, value]) => {
        if (!standardKeys.includes(key)) {
          const valuesArray = value.split(",");
          query[`variants.options.${key}`] = { $in: valuesArray };
        }
      });

      // ✅ Sort Handling
      let sort = { createdAt: -1 };

      if (sortBy === "priceLowToHigh") {
        sort = { price: 1 };
      } else if (sortBy === "priceHighToLow") {
        sort = { price: -1 };
      } else if (sortBy === "topRated") {
        sort = {
          wantsCustomerReview: -1,
          "ratings.average": -1,
          "ratings.count": -1,
        };
      } else if (sortBy === "inStock") {
        query.stock = { $gt: 0 };
      } else if (sortBy === "outOfStock") {
        query.stock = { $lte: 0 };
      } else if (sortBy === "newest") {
        sort = { createdAt: -1 }; // Newest first
      }

      // ✅ Final Mongo Query Execution
      const { data, totalData } = await paginate(ProductModel, query, {
        page: Number(page),
        limit: Number(limit),
        sort,
      });

      return res.status(200).json({
        success: true,
        data,
        totalData,
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

  // get single prouct
  getSingleProduct: async (req, res) => {
    const { storeId } = req.params;
    const { slug } = req.query;
    try {
      if (!slug) {
        return res
          .status(400)
          .json({ message: "slug is required!", success: false });
      }
      const product = await ProductModel.findOne({ slug }).populate(
        "relatedProducts"
      );
      if (!product) {
        return res
          .status(400)
          .json({ message: "Invalid slug!", success: false });
      }
      const reviews = await ReviewModel.find({ productId: product?._id });

      return res.status(200).json({
        data: { product, reviews, relatedProducts: product.relatedProducts },
        success: true,
      });
    } catch (error) {
      console.error("Error fetching single product!", error?.message || error);
      return res
        .status(500)
        .json({ message: "Something went wrong!", success: false });
    }
  },

  // edit product
  editProduct: async (req, res) => {
    const { storeId } = req.params;
    const productID = req.query.id;

    console.log("req?.body", req?.body);

    try {
      const product = await ProductModel.findOneAndUpdate(
        { _id: productID, storeRef: storeId },
        { $set: req.body },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found for this store",
        });
      }

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
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
        field: "name",
        extraQuery: { storeRef: storeId },
        projection: { _id: 1, name: 1, displayImage: 1, price: 1 },
      });

      res.status(200).json({ success: true, data: results });
    } catch (err) {
      console.error("error fetching product suggestion:", err?.message || err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
};
