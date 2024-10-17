const { addCarts } = require("../Controler/carts");
const { upload } = require("../middlewear/upload");
const { postProductData, getProductData } = require("../Utils/product");
const express = require("express");

const routes = express.Router();

routes.post("/addProduct", upload, postProductData);
routes.get("/getProducts", getProductData);
routes.post("/addCarts", addCarts);

module.exports = routes;
