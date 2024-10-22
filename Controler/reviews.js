const { default: mongoose } = require("mongoose");
const reviewSchema = require("../Models/reviewModal");

const addReview = async (req, res) => {
  const type = req.collectionType;

  const ReviewModel = mongoose.model(
    type + "_reviews",
    reviewSchema,
    type + "_reviews"
  );
  try {
    const newReview = new ReviewModel(req.body);
    await newReview.save();
    return res.status(201).json(newReview);
  } catch (e) {
    return res.status(500).json({ message: Object.values(e.errors)[0] });
  }
};

const getReviews = async (req, res) => {
  const type = req.collectionType;
  const productId = req.query.productId;
  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }
  const ReviewModel = mongoose.model(
    type + "_reviews",
    reviewSchema,
    type + "_reviews"
  );
  try {
    const reviews = await ReviewModel.find({ productId: productId });
    if (reviews.length > 0) {
      return res.status(200).json(reviews);
    }
    return res
      .status(404)
      .json({ message: "No reviews found for this product" });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
module.exports = { addReview, getReviews };
