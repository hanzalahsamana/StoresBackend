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
const { userLoginValidate } = require("../Utils/userValidate");
const {
  loginUser,
  sendOtp,
  verifyOtp,
  getUserFromToken,
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
const { getSections, updateSection, createSection, deleteSection } = require("../Controler/sections");

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

withoutParams.post("/login", userLoginValidate, loginUser);
withoutParams.post("/sendOtp", sendOtp);
withoutParams.post("/verifyOtp", verifyOtp);

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
withParams.get("/getUserFromToken", getUserFromToken);
withoutParams.get("/fetchSiteByDomain", fetchSiteByDomain);

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

module.exports = { withParams, withoutParams };
