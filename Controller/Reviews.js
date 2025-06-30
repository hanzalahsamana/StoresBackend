const { default: mongoose } = require("mongoose");
const { ReviewModel } = require("../Models/ReviewModel");
const { ProductModel } = require("../Models/ProductModel");
const updateProductRating = require("../Helpers/UpdateProductRating");

const addReview = async (req, res) => {
  const { storeId } = req.params;
  const { productId } = req.query;

  try {
    const product = await ProductModel.findOne({
      _id: productId,
      storeRef: storeId,
    });

    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found for this store" });
    }

    if (!product.wantsCustomerReview) {
      return res.status(403).json({
        message: "Customer reviews are disabled for this product",
      });
    }

    const existingReview = await ReviewModel.findOne({
      email: req.body.email,
      productId,
      storeRef: storeId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already submitted a review for this product.",
      });
    }

    const newReview = new ReviewModel({
      ...req.body,
      productId: productId,
      storeRef: storeId,
    });

    await newReview.save();

    await updateProductRating(product);

    return res.status(201).json({
      success: true,
      data: newReview,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getReviews = async (req, res) => {
  const { storeId } = req.params;
  const { productId } = req.query;

  const filter = { storeRef: storeId };
  if (productId) {
    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .json({ message: "Invalid format of product ID in query" });
    }
    filter.productId = productId;
  }

  try {
    const reviews = await ReviewModel.find(filter);

    if (reviews.length === 0) {
      return res.status(404).json({
        message: productId
          ? "No reviews found for this product"
          : "No reviews found for this store",
      });
    }

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.query;
    const { storeId } = req.params;

    if (!reviewId || !mongoose.isValidObjectId(reviewId)) {
      return res
        .status(400)
        .json({ message: "Missing or Invalid format of review ID" });
    }

    const review = await ReviewModel.findOneAndDelete({
      _id: reviewId,
      storeRef: storeId,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const product = await ProductModel.findOne({
      _id: review.productId,
      storeRef: storeId,
    });

    if (!product) {
      return res.status(200).json({ message: "Review deleted successfully." });
    }

    await updateProductRating(product);

    return res
      .status(200)
      .json({ message: "Review deleted and product rating updated." });
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { addReview, getReviews, deleteReview };
