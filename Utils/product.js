const { request } = require("express");
const { ProductModal } = require("../Models/ProductModal");

module.exports = {
  postProductData: async (req, res) => {
    const productModel = new ProductModal(req.body);
    try {
      const savedProduct = await productModel.save();
      
      // Check if files are uploaded
      if (req.files && req.files.length > 0) {
        // Map through the files to get their paths
        const paths = req.files.map(file => file.path);
        productModel.images = paths; // Assuming images is an array in your ProductModal
      }

      await productModel.save(); // Save the updated product with image paths
      return res.status(201).json(savedProduct);
    } catch (e) {
      return res.status(500).json({ message: Object.values(e.errors)[0] });
    }
  },
  getProductData: async (req, res) => {
    const collectionName = req.query.collection;
    try {
      if (collectionName) {
        const productData = await ProductModal.find({
          collection: collectionName,
        });
        return res.status(200).json(productData);
      } else {
        const productData = await ProductModal.find();
        return res.status(200).json(productData);
      }
    } catch (e) {
      return res
        .status(500)
        .json({ message: e.message || "An error occurred" });
    }
  },
};
