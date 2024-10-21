const { productSchema } = require("../Models/ProductModal");
const { mongoose } = require("mongoose");

module.exports = {
  // add product
  postProductData: async (req, res) => {
    const type = req.collectionType;

    const ProductModel = mongoose.model(
      type + "_products",
      productSchema,
      type + "_products"
    );

    const newProduct = new ProductModel(req.body);
    try {
      const savedProduct = await newProduct.save();
      // if (req.files && req.files.length > 0) {
      //   const paths = req.files.map((file) => file.path);
      //   savedProduct.images = paths;
      // }
      return res.status(201).json(savedProduct);
    } catch (e) {
      return res.status(500).json({ message: Object.values(e.errors)[0] });
    }
  },

  // get product
  getProductData: async (req, res) => {
    const collectionName = req.query.collection;
    const type = req.collectionType;
    try {
      const ProductModel = mongoose.model(
        type + "_products",
        productSchema,
        type + "_products"
      );
      if (collectionName) {
        const productData = await ProductModel.find({
          collectionName: collectionName,
        });
        return res.status(200).json(productData);
      } else {
        const productData = await ProductModel.find();
        return res.status(200).json(productData);
      }
    } catch (e) {
      return res
        .status(500)
        .json({ message: e.message || "An error occurred" });
    }
  },

  // edit product
  editProduct: async (req, res) => {
    const productID = req.query.id;
    const type = req.collectionType;

    if (!mongoose.isValidObjectId(productID) || !productID) {
      return res
        .status(400)
        .json({ message: "Invalid id OR id is not defined" });
    }

    try {
      const ProductModel = mongoose.model(
        type + "_products",
        productSchema,
        type + "_products"
      );
      const product = await ProductModel.findById(productID);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const updatedFields = req.body;

      if (!updatedFields || Object.keys(updatedFields).length === 0) {
        return res.status(400).json({ message: "Data is required" });
      }

      Object.assign(product, updatedFields);

      await product.save();

      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // delete product
  deleteProduct: async (req, res) => {
    const productID = req.query.id;
    const type = req.collectionType;

    if (!mongoose.isValidObjectId(productID) || !productID) {
      return res
        .status(400)
        .json({ message: "Invalid id OR id is not defined" });
    }

    try {
      const ProductModel = mongoose.model(
        type + "_products",
        productSchema,
        type + "_products"
      );

      const product = await ProductModel.deleteOne({ _id: productID });

      if (product.deletedCount === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json({ message: "Product Deleted Successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};
