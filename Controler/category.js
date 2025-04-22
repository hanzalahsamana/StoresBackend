const { categorySchema } = require("../Models/CategoryModal");
const { mongoose } = require("mongoose");

module.exports = {
  // add category
  postCategory: async (req, res) => {
    const type = req.collectionType;

    const CategoryModel = mongoose.model(
      type + "_category",
      categorySchema,
      type + "_category"
    );

    const newCategory = new CategoryModel(req.body);
    try {
      const savedCategory = await newCategory.save();
      return res.status(201).json(savedCategory);
    } catch (e) {
      return res.status(500).json({
        message: Object.values(e?.errors)[0] || "error occur while creating",
      });
    }
  },

  // get category
  getCategory: async (req, res) => {
    const type = req.collectionType;
    try {
      const CategoryModal = mongoose.model(
        type + "_category",
        categorySchema,
        type + "_category"
      );
    
      const categories = await CategoryModal.find();
      return res.status(200).json(categories);
    } catch (e) {
      return res
        .status(500)
        .json({ message: e.message || "An error occurred" });
    }
  },

  // delete category
  deleteCategory: async (req, res) => {
    const categoryID = req.query.id;
    const type = req.collectionType;

    if (!mongoose.isValidObjectId(categoryID) || !categoryID) {
      return res
        .status(400)
        .json({ message: "Invalid id OR id is not defined" });
    }

    try {
      const CategoryModal = mongoose.model(
        type + "_category",
        categorySchema,
        type + "_category"
      );

      const category = await CategoryModal.deleteOne({ _id: categoryID });

      if (category.deletedCount === 0) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(200).json({ message: "Category Deleted Successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // edit category
  editCategory: async (req, res) => {
    const categoryId = req.query.id;
    const type = req.collectionType;

    if (!mongoose.isValidObjectId(categoryId) || !categoryId) {
      return res
        .status(400)
        .json({ message: "Invalid id OR id is not defined" });
    }

    try {
      const CategoryModal = mongoose.model(
        type + "_category",
        categorySchema,
        type + "_category"
      );
      const category = await CategoryModal.findById(categoryId);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const updatedFields = req.body;

      if (!updatedFields || Object.keys(updatedFields).length === 0) {
        return res.status(400).json({ message: "Data is required" });
      }

      Object.assign(category, updatedFields);

      await category.save();

      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};
