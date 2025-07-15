const { GalleryModel } = require('../Models/GalleryModel');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const mongoose = require('mongoose');
const { s3 } = require('../Helpers/s3Uploader');

const uploadImage = async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.file;
    const format = file?.mimetype.split('/')[1];

    const imageDoc = new GalleryModel({
      url: file.location,
      key: file.key,
      type: file.mimetype.startsWith('video') ? 'video' : 'image',
      size: file.size,
      format: format,
      storeRef: storeId,
    });

    const savedImage = await imageDoc.save();

    res.status(200).json({
      message: 'Image uploaded successfully',
      image: savedImage,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getImages = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { imageId } = req.query;

    let query = { storeRef: storeId };

    // Validate imageId if provided
    if (imageId) {
      if (!mongoose.Types.ObjectId.isValid(imageId)) {
        return res.status(400).json({ message: 'Invalid image ID format' });
      }
      query._id = imageId;
    }

    const images = await GalleryModel.find(query).sort({ createdAt: -1 });
    console.log(images);

    return res.status(200).json({
      message: 'Fetch successful',
      images,
    });
  } catch (err) {
    console.error('Get images error:', err);
    return res.status(500).json({
      message: 'Server error',
      error: err.message,
    });
  }
};

const deleteImages = async (req, res) => {
  try {
    const { storeId } = req.params;
    const rawIds = req.query.imageIds;

    if (!rawIds || typeof rawIds !== 'string') {
      return res.status(400).json({ message: 'imageIds must be a comma-separated string' });
    }

    const imageIds = rawIds
      .split(',')
      .map((id) => id.trim())
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (imageIds.length === 0) {
      return res.status(400).json({ message: 'No valid image IDs provided' });
    }

    // Find matching images
    const images = await GalleryModel.find({
      _id: { $in: imageIds },
      storeRef: storeId,
    });

    const results = [];

    for (const image of images) {
      try {
        let s3Key = image.key;
        if (!s3Key && image.url) {
          s3Key = new URL(image.url).pathname.slice(1); // fallback from URL
        }

        if (!s3Key) {
          results.push({ id: image._id, status: 'failed', reason: 'S3 key missing' });
          continue;
        }

        // Delete from S3
        const command = new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: s3Key,
        });
        await s3.send(command);

        // Delete from MongoDB
        await GalleryModel.findByIdAndDelete(image._id);

        results.push({ id: image._id, status: 'deleted' });
      } catch (err) {
        results.push({ id: image._id, status: 'failed', reason: err.message });
      }
    }

    res.status(200).json({
      message: 'Deletion process completed',
    });
  } catch (err) {
    console.error('Delete images error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { uploadImage, getImages, deleteImages };
