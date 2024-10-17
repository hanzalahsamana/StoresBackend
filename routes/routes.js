const { addCarts, getCartData, deleteCartProduct } = require("../Controler/carts");
const { upload } = require("../middlewear/upload");
const { postProductData, getProductData } = require("../Utils/product");
const express = require("express");

const routes = express.Router();

// post apis
routes.post("/addProduct", postProductData);
routes.post("/addCart", addCarts);

// get apis
routes.get("/getProducts", getProductData);
routes.get("/getCartData", getCartData);


// delete apis 
routes.delete("/deleteCartProduct", deleteCartProduct);

module.exports = routes;
