const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/");
  },
  filename: (req, file, cb) => {
    let ext = path.extname(req.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, callback) => {
    if (file.mimetype == "image/jpg" || file.mimetype == "image/png") {
      callback(null, true);
    } else {
      console.log("only jpg and png files allowed!");
      callback(null, false);
    }
  },
});

module.exports = { upload };
