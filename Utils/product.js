const { cloudinary } = require("../Config/cloudinaryConfig");
const { ProductModal } = require("../Models/ProductModal");

module.exports = {
  postProductData: async (req, res) => {
    try {
      // Collect image URLs from the uploaded files
      const imageUrls = [];

      // Upload each file to Cloudinary and collect the URL
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path); // Upload to Cloudinary
        imageUrls.push(result.secure_url); // Save the secure URL from Cloudinary
      }

      // Create a new product with the form data and the image URLs
      const productModel = new ProductModal({
        ...req.body,
        image: imageUrls, // Save the uploaded image URLs to the 'image' field
      });

      const savedProduct = await productModel.save(); // Save the product to the database
      return res.status(201).json(savedProduct);
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },
  getProductData: async (req, res) => {
    const collectionName = req.query.collection;
    try {
      if (collectionName) {
        const productData = await ProductModal.find({
          collectionName: collectionName,
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
