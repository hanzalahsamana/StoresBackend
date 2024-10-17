const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: "dtl08f66p",
  api_key: "124222775849949",
  api_secret: "1gvvxaZisHuyKL3jEaWswzYRGJI",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "png","webp","svg"],
  },
});

const upload = multer({ storage: storage });

module.exports = { upload: upload.array("images") };
