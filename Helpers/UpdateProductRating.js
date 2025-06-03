const { ReviewModel } = require("../Models/ReviewModel");

const updateProductRating = async (product) => {
  try {
    if (!product || !product._id || !product.storeRef) return;

    const reviews = await ReviewModel.find({
      productId: product._id,
      storeRef: product.storeRef,
    });

    const newCount = reviews.length;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const newAverage = newCount ? total / newCount : 0;

    product.ratings.count = newCount;
    product.ratings.average = parseFloat(newAverage.toFixed(2));

    await product.save();
  } catch (error) {
    console.error("Failed to update product rating:", error);
  }
};

module.exports = updateProductRating;
