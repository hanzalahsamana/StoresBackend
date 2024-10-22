const addReview = async (req, res) => {
  res.status(200).json({ message: "Review added successfully" });
};

module.exports = {addReview};
