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
const { upload } = require("../middlewear/upload");
const {
  postProductData,
  getProductData,
  editProduct,
  deleteProduct,
} = require("../Controler/product");
const express = require("express");
const {
  userRegisterValidate,
  userLoginValidate,
} = require("../Utils/userValidate");
const { registerUser, loginUser } = require("../Controler/user");
const { addReview, getReviews } = require("../Controler/reviews");
const { getAnalyticsData } = require("../Controler/analytics");
const { getPages, updatePage } = require("../Controler/pages");
const { postCategory, getCategory, deleteCategory, editCategory } = require("../Controler/category");

const withParams = express.Router();
const withoutParams = express.Router();

// post apis
withParams.post("/addProduct", postProductData);
withParams.post("/addCategory", postCategory);
withParams.post("/addCart", addCarts);
withParams.post("/addOrderData", addOrderData);
withParams.post("/addReview", addReview);
withoutParams.post("/register", userRegisterValidate, registerUser);
withoutParams.post("/login", userLoginValidate, loginUser);

// get apis
withParams.get("/getProducts", getProductData);
withParams.get("/getCategory", getCategory);
withParams.get("/getCartData", getCartData);
withParams.get("/getOrders", getOrders);
withParams.get("/getReviews", getReviews);
withParams.get("/getAnalytics", getAnalyticsData);
withParams.get("/getPages", getPages);

// delete apis
withParams.delete("/deleteCartProduct", deleteCartProduct);
withParams.delete("/deleteCategory", deleteCategory);
withParams.delete("/deleteProduct", deleteProduct);

//  edit product
withParams.put("/editProduct", editProduct);
withParams.put("/editCategory", editCategory);
withParams.put("/editOrder", editOrderData);
withParams.patch("/editPage", updatePage);

module.exports = { withParams, withoutParams };