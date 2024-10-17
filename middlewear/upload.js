const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dtl08f66p",
  api_key: "124222775849949",
  api_secret: "1gvvxaZisHuyKL3jEaWswzYRGJI",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // The name of the folder in your Cloudinary account
    allowed_formats: ["jpg", "png"],
  },
});

const upload = multer({ storage: storage });

module.exports = { upload: upload.array("images") };
