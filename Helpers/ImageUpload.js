const uploadSingleImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({ imageUrl: req.file.location });
};

const uploadMultipleImages = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }
  const imageUrls = req.files.map((file) => file.location);
  res.json({ imageUrls });
};

module.exports = { uploadSingleImage, uploadMultipleImages };
