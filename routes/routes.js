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

const routes = express.Router();

// post apis
routes.post("/addProduct", postProductData);
routes.post("/addCart", addCarts);
routes.post("/addOrderData", addOrderData);

// get apis
routes.get("/getProducts", getProductData);
routes.get("/getCartData", getCartData);
routes.get("/getOrders", getOrders);

// delete apis
routes.delete("/deleteCartProduct", deleteCartProduct);
routes.delete("/deleteProduct", deleteProduct);

//  edit product
routes.put("/editProduct", editProduct);

module.exports = routes;
