const multer = require("multer");
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
const {
  postProductData,
  getProductData,
  editProduct,
  deleteProduct,
} = require("../Controler/product");
const express = require("express");
const {
  userLoginValidate,
  userRegisterValidate,
} = require("../Utils/userValidate");
const {
  loginUser,
  sendOtp,
  verifyOtp,
  getUserFromToken,
  registerUser,
} = require("../Controler/user");
const { addReview, getReviews } = require("../Controler/reviews");
const { getAnalyticsData } = require("../Controler/analytics");
const { getPages, updatePage } = require("../Controler/pages");
const {
  postCategory,
  getCategory,
  deleteCategory,
  editCategory,
} = require("../Controler/category");
const { postConatctForm } = require("../Controler/Contact");
const {
  handleDomainRequest,
  automateDomainSetup,
  fetchSiteByDomain,
  removeDomainFromDatabase,
} = require("../Controler/domain");
const { uploadSingle, uploadMultiple } = require("../Controler/imageUpload");
const {
  uploadSingleImage,
  uploadMultipleImages,
} = require("../Utils/ImageUpload");
const {
  getSections,
  updateSection,
  createSection,
  deleteSection,
  updateSectionOrder,
} = require("../Controler/Sections");
const tokenChecker = require("../middlewear/TokenChecker");
const { addTheme, getTheme } = require("../Controler/Theme");
const { exportSite } = require("../Controler/migration");
const importSiteData = require("../Utils/ImportSite");

const upload = multer({ dest: "uploads/" });

const withParams = express.Router();
const withoutParams = express.Router();

// post apis
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
withoutParams.post("/setTheme", tokenChecker, addTheme);
withoutParams.post("/importSiteData", tokenChecker, upload.single("file"), importSiteData);

withoutParams.post("/login", userLoginValidate, loginUser);
withoutParams.post("/sendOtp", sendOtp);
withoutParams.post("/verifyOtp", verifyOtp);
withoutParams.post("/register", userRegisterValidate, registerUser);

withoutParams.post("/jazzresponse", (req, res) => {
  console.log("Here you will receive payment token", req.body);
});

// get apis
// withParams.get("/verifyDomain", verifyDomain);
withParams.get("/getProducts", getProductData);
withParams.get("/getCategory", getCategory);
withParams.get("/getCartData", getCartData);
withParams.get("/getOrders", getOrders);
withParams.get("/getReviews", getReviews);
withParams.get("/getAnalytics", getAnalyticsData);
withParams.get("/getPages", getPages);
withParams.get("/getSections", getSections);
withParams.get("/getTheme", getTheme);
withoutParams.get("/exportSiteData", tokenChecker, exportSite);
withoutParams.get("/fetchSiteByDomain", fetchSiteByDomain);
withoutParams.get("/getUserFromToken", tokenChecker, getUserFromToken);

// delete apis
withParams.delete("/deleteCartProduct", deleteCartProduct);
withParams.delete("/deleteCategory", deleteCategory);
withParams.delete("/deleteProduct", deleteProduct);
withParams.delete("/deleteDomain", removeDomainFromDatabase);
withParams.delete("/deleteSection", deleteSection);

//  edit product
withParams.put("/editProduct", editProduct);
withParams.put("/editCategory", editCategory);
withParams.put("/editOrder", editOrderData);
withParams.patch("/editPage", updatePage);
withParams.patch("/editSection", updateSection);
withParams.patch("/editSectionOrder", updateSectionOrder);

module.exports = { withParams, withoutParams };
