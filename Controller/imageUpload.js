const { GalleryModel } = require('../Models/GalleryModel');

const uploadSingleImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ imageUrl: req.file.location });
};

const uploadImages = async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Create DB entries for each uploaded file
    const savedImages = await Promise.all(
      req.files.map(async (file) => {
        const imageDoc = new GalleryModel({
          url: file.location || file?.path,
          type: file.mimetype.startsWith('video') ? 'video' : 'image',
          size: file.size,
          storeRef: storeId,
        });

        return await imageDoc.save();
      })
    );

    res.status(200).json({ imageUrls: savedImages });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { uploadSingleImage, uploadImages };


