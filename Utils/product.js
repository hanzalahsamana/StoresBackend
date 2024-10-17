const { ProductModal } = require("../Models/ProductModal");

module.exports = {
  postProductData: async (req, res) => {
    const productModel = new ProductModal(req.body);
    try {
      const savedProduct = await productModel.save();
      if (req.files.lenght > 0) {
        let path = "";
        req.files.forEach((file, index, arr) => {
          path = path + files.path + ",";
        });
        path.substring(0, path.lastIndexOf(","))
        productModel.images = path;
      }
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
