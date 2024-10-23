const {
  addCarts,
  getCartData,
  deleteCartProduct,
} = require("../Controler/carts");
const { addOrderData, getOrders } = require("../Controler/Order");
const { upload } = require("../middlewear/upload");
const {
  postProductData,
  getProductData,
  editProduct,
  deleteProduct,
} = require("../Utils/product");
const express = require("express");
const {
  userRegisterValidate,
  userLoginValidate,
} = require("../Utils/userValidate");
const { registerUser, loginUser } = require("../Controler/user");
const { addReview, getReviews } = require("../Controler/reviews");

const withParams = express.Router();
const withoutParams = express.Router();

// post apis
withParams.post("/addProduct", postProductData);
withParams.post("/addCart", addCarts);
withParams.post("/addOrderData", addOrderData);
withParams.post("/addReview", addReview);
withoutParams.post("/register", userRegisterValidate, registerUser);
withoutParams.post("/login", userLoginValidate, loginUser);

// get apis
withParams.get("/getProducts", getProductData);
withParams.get("/getCartData", getCartData);
withParams.get("/getOrders", getOrders);
withParams.get("/getReviews", getReviews);

// delete apis
withParams.delete("/deleteCartProduct", deleteCartProduct);
withParams.delete("/deleteProduct", deleteProduct);

//  edit product
withParams.put("/editProduct", editProduct);

module.exports = { withParams, withoutParams };
