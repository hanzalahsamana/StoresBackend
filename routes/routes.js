const express = require("express");
const multer = require("multer");
const tokenChecker = require("../middlewear/TokenChecker");

const {
  uploadSingleImage,
  uploadMultipleImages,
} = require("../Utils/ImageUpload");
const {
  userLoginValidate,
  userRegisterValidate,
} = require("../Utils/userValidate");
const importSiteData = require("../Utils/ImportSite");

const {
  loginUser,
  sendOtp,
  verifyOtp,
  getUserFromToken,
  registerUser,
  authWithGoogle,
} = require("../Controler/user");
const {
  postProductData,
  getProductData,
  editProduct,
  deleteProduct,
} = require("../Controler/product");
const {
  postCategory,
  getCategory,
  deleteCategory,
  editCategory,
} = require("../Controler/category");
const {
  addCarts,
  getCartData,
  deleteCartProduct,
} = require("../Controler/carts");
const {
  addOrderData,
  getOrders,
  editOrderData,
} = require("../Controler/Order");
const { addReview, getReviews } = require("../Controler/reviews");
const { getAnalyticsData } = require("../Controler/analytics");
const { getPages, updatePage } = require("../Controler/pages");
const { postConatctForm } = require("../Controler/Contact");
const {
  handleDomainRequest,
  automateDomainSetup,
  fetchSiteByDomain,
  removeDomainFromDatabase,
} = require("../Controler/domain");
const { uploadSingle, uploadMultiple } = require("../Controler/imageUpload");
const {
  getSections,
  updateSection,
  createSection,
  deleteSection,
  updateSectionOrder,
} = require("../Controler/Sections");
const { addTheme } = require("../Controler/Theme");
const { exportSite } = require("../Controler/migration");
const {
  deleteVariation,
  addVariation,
  editVariation,
} = require("../Controler/variation");
const { getStoreDetails } = require("../Controler/StoreDetail");
const {
  addDiscount,
  deleteDiscount,
  editDiscount,
  applyCoupon,
} = require("../Controler/discounts");
const {
  addAnnouncement,
  deleteAnnouncement,
} = require("../Controler/announcement");
const addSubscriber = require("../Controler/subscribe");

// Multer setup
const upload = multer({ dest: "/tmp" });

// Routers
const withParams = express.Router();
const withoutParams = express.Router();

// POST routes (with params)
withParams.post("/addProduct", postProductData);
withParams.post("/addCategory", postCategory);
withParams.post("/addCart", addCarts);
withParams.post("/addOrderData", addOrderData);
withParams.post("/addReview", addReview);
withParams.post("/postContact", postConatctForm);
withParams.post("/uploadSingle", uploadSingle, uploadSingleImage);
withParams.post("/uploadMultiple", uploadMultiple, uploadMultipleImages);
withParams.post("/addDomainDns", handleDomainRequest);
withParams.post("/addSection", createSection);
withParams.post("/genrateSSl", automateDomainSetup);
withParams.post("/addSubscriber", addSubscriber);
withParams.post("/applyCoupon", applyCoupon);

// POST routes (without params)
withoutParams.post("/setTheme", tokenChecker, addTheme);
withoutParams.post("/addVariation", tokenChecker, addVariation);
withoutParams.post("/addAnnouncement", tokenChecker, addAnnouncement);
withoutParams.post("/addDiscount", tokenChecker, addDiscount);
withoutParams.post(
  "/importSiteData",
  tokenChecker,
  upload.single("file"),
  importSiteData
);
withoutParams.post("/login", userLoginValidate, loginUser);
withoutParams.post("/sendOtp", sendOtp);
withoutParams.post("/verifyOtp", verifyOtp);
withoutParams.post("/register", userRegisterValidate, registerUser);
withoutParams.post("/authWithGoogle", authWithGoogle);

// GET routes (with params)
withParams.get("/getProducts", getProductData);
withParams.get("/getCategory", getCategory);
withParams.get("/getCartData", getCartData);
withParams.get("/getOrders", getOrders);
withParams.get("/getReviews", getReviews);
withParams.get("/getAnalytics", getAnalyticsData);
withParams.get("/getPages", getPages);
withParams.get("/getSections", getSections);
withParams.get("/getStoreDetails", getStoreDetails);

// GET routes (without params)
withoutParams.get("/exportSiteData", tokenChecker, exportSite);
withoutParams.get("/fetchSiteByDomain", fetchSiteByDomain);
withoutParams.get("/getUserFromToken", tokenChecker, getUserFromToken);
withoutParams.get("/ping", async (req, res) => {
  try {
    // await mongoose.connection.db.admin().ping();
    res.status(200).send("OK");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    res.status(503).send("MongoDB Unreachable");
  }
});

// DELETE routes
withParams.delete("/deleteCartProduct", deleteCartProduct);
withParams.delete("/deleteCategory", deleteCategory);
withParams.delete("/deleteProduct", deleteProduct);
withParams.delete("/deleteDomain", removeDomainFromDatabase);
withParams.delete("/deleteSection", deleteSection);
withoutParams.delete("/deleteVariation", tokenChecker, deleteVariation);
withoutParams.delete("/deleteDiscount", tokenChecker, deleteDiscount);
withoutParams.delete("/deleteAnnouncement", tokenChecker, deleteAnnouncement);

// PUT/PATCH routes
withParams.put("/editProduct", editProduct);
withParams.put("/editCategory", editCategory);
withParams.put("/editOrder", editOrderData);

withParams.patch("/editPage", updatePage);
withParams.patch("/editSection", updateSection);
withParams.patch("/editSectionOrder", updateSectionOrder);
withoutParams.patch("/editVariation", tokenChecker, editVariation);
withoutParams.patch("/editDiscount", tokenChecker, editDiscount);

// Export routers
module.exports = { withParams, withoutParams };
