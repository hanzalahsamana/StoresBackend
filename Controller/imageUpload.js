const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
require("dotenv").config();

// Initialize AWS S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer-S3 Storage Setup
const s3Storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const uniqueFileName = `/${Date.now()}_${Math.random().toString(36).substring(2)}_${file.originalname}`;
    cb(null, uniqueFileName);
  },
  contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically detect content type
});

// Multer Configuration
const upload = multer({
  storage: s3Storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB per file
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      console.log(file);

      cb(null, true);
    } else {
      console.log(file, "ghiop");
      cb(
        new Error(
          "Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.",
        ),
      );
    }
  },
});

// Export Upload Handlers
module.exports = {
  uploadSingle: upload.single("image"),
  uploadMultiple: upload.array("images", 5),
};




