const multer = require("multer");
const { cloudinary } = require("./cloudinaryConfig"); // Import cloudinaryConfig
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products", // Folder in Cloudinary where images will be stored
    allowedFormats: ["jpg", "jpeg", "png"], // Allowed image formats
  },
});

const upload = multer({ storage }).array("image", 2); // Adjust the number according to how many files you want to upload

module.exports = { upload }; // Export the configured 'upload'